import { unstable_cache } from 'next/cache';
import { Event, Prisma, StaticContent, TeamMember } from '@prisma/client';
import sharp from 'sharp';
import { prisma } from './prisma';
import { getAboutTeamViewMoreEnabled, getAllFAQs } from './db';
import { PUBLIC_CACHE_SECONDS, PUBLIC_CACHE_TAGS } from '../public-cache';

type MediaKind = 'events' | 'team' | 'content';
type MediaField = 'image' | 'id' | 'en';

// Replace embedded images inside Postgres, before rows cross the network. Merely
// removing base64 in JavaScript would still consume Supabase database egress.
function publicImage(kind: MediaKind, value: Prisma.Sql, field: MediaField = 'image') {
  return Prisma.sql`CASE WHEN ${value} LIKE 'data:image/%' THEN
    '/api/media/' || ${kind} || '/' || id || '?field=' || ${field} ||
    '&v=' || EXTRACT(EPOCH FROM "updatedAt")::text
    ELSE ${value} END`;
}

export const getPublicEvents = unstable_cache(
  () => prisma.$queryRaw<Event[]>(Prisma.sql`
    SELECT id, day, month, title, location, description, date, organizer,
      ${publicImage('events', Prisma.sql`image`)} AS image,
      "registrationUrl", status, "createdAt", "updatedAt", "createdBy"
    FROM events WHERE status = 'PUBLISHED' ORDER BY "createdAt" DESC
  `),
  ['public-events-v1'],
  { revalidate: PUBLIC_CACHE_SECONDS, tags: [PUBLIC_CACHE_TAGS.events] },
);

export const getPublicTeam = unstable_cache(
  async () => {
    const [members, viewMoreEnabled] = await Promise.all([
      prisma.$queryRaw<TeamMember[]>(Prisma.sql`
        SELECT id, name, role, bio, university, instagram,
          ${publicImage('team', Prisma.sql`image`)} AS image,
          division, "order", "isActive", "createdAt", "updatedAt"
        FROM team_members WHERE "isActive" = true ORDER BY "order" ASC
      `),
      getAboutTeamViewMoreEnabled(),
    ]);
    return { members, viewMoreEnabled };
  },
  ['public-team-v1'],
  { revalidate: PUBLIC_CACHE_SECONDS, tags: [PUBLIC_CACHE_TAGS.team] },
);

export const getPublicContent = unstable_cache(
  (page: string | null, key: string | null) => prisma.$queryRaw<StaticContent[]>(Prisma.sql`
    SELECT id, key, type,
      CASE WHEN jsonb_typeof(content) = 'object' THEN COALESCE((
        SELECT jsonb_object_agg(entry.key,
          CASE WHEN entry.key IN ('id', 'en') AND entry.value #>> '{}' LIKE 'data:image/%'
            THEN to_jsonb('/api/media/content/' || id || '?field=' || entry.key ||
              '&v=' || EXTRACT(EPOCH FROM "updatedAt")::text)
            ELSE entry.value END)
        FROM jsonb_each(content) AS entry
      ), '{}'::jsonb) ELSE content END AS content,
      ${publicImage('content', Prisma.sql`image`)} AS image,
      page, section, "order", "createdAt", "updatedAt"
    FROM static_contents
    WHERE ${key ? Prisma.sql`key = ${key}` : Prisma.sql`page = ${page}`}
    ORDER BY "order" ASC
  `),
  ['public-content-v1'],
  { revalidate: PUBLIC_CACHE_SECONDS, tags: [PUBLIC_CACHE_TAGS.content] },
);

export const getPublicFAQs = unstable_cache(
  (page?: string) => getAllFAQs(page),
  ['public-faq-v1'],
  { revalidate: PUBLIC_CACHE_SECONDS, tags: [PUBLIC_CACHE_TAGS.faq] },
);

export const getPublicCommunityBoard = unstable_cache(
  async () => {
    const [discounts, resources, announcements] = await Promise.all([
      prisma.communityDiscount.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
      prisma.communityResource.findMany({ where: { isActive: true }, orderBy: [{ category: 'asc' }, { order: 'asc' }] }),
      prisma.communityAnnouncement.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    ]);
    return { discounts, resources, announcements };
  },
  ['public-community-v1'],
  { revalidate: PUBLIC_CACHE_SECONDS, tags: [PUBLIC_CACHE_TAGS.community] },
);

export function isPublicMediaRequest(kind: string, field: string): kind is MediaKind {
  return (kind === 'events' || kind === 'team' || kind === 'content') &&
    (field === 'image' || (kind === 'content' && (field === 'id' || field === 'en')));
}

export function getPublicMedia(kind: MediaKind, id: string, field: string) {
  return unstable_cache(
    async () => {
      let image: string | null | undefined;
      if (kind === 'events') {
        image = (await prisma.event.findFirst({
          where: { id, status: 'PUBLISHED' }, select: { image: true },
        }))?.image;
      } else if (kind === 'team') {
        image = (await prisma.teamMember.findFirst({
          where: { id, isActive: true }, select: { image: true },
        }))?.image;
      } else {
        // Select just the requested field, avoiding other embedded images.
        const rows = await prisma.$queryRaw<{ image: string | null }[]>(Prisma.sql`
          SELECT ${field === 'image' ? Prisma.sql`image` : Prisma.sql`content ->> ${field}`} AS image
          FROM static_contents WHERE id = ${id}
        `);
        image = rows[0]?.image;
      }

      if (!image || !/^data:image\/(?:png|jpe?g|webp);base64,/i.test(image)) return null;

      const original = Buffer.from(image.slice(image.indexOf(',') + 1), 'base64');
      let optimized = await sharp(original)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      // Next's data cache has a 2 MB entry limit, including base64 overhead.
      if (optimized.length > 1_400_000) {
        optimized = await sharp(original).rotate()
          .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 75 }).toBuffer();
      }
      // Cache the small optimized representation, never the multi-MB original.
      return optimized.toString('base64');
    },
    ['public-media-v1', kind, id, field],
    { revalidate: 86400, tags: [PUBLIC_CACHE_TAGS[kind]] },
  )();
}
