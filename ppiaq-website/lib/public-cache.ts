import { revalidateTag } from 'next/cache';

export const PUBLIC_CACHE_SECONDS = 3600;

export const PUBLIC_CACHE_TAGS = {
  events: 'public-events',
  team: 'public-team',
  content: 'public-content',
  faq: 'public-faq',
  community: 'public-community',
} as const;

// Only public CMS responses may use these headers. Auth/admin data stays private.
export const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=60',
};

export function invalidatePublicContent(kind: keyof typeof PUBLIC_CACHE_TAGS) {
  revalidateTag(PUBLIC_CACHE_TAGS[kind], { expire: 0 });
  // The team visibility setting can also be edited through static content CRUD.
  if (kind === 'content') revalidateTag(PUBLIC_CACHE_TAGS.team, { expire: 0 });
}
