-- Add organizer (penyelenggara) field for event filtering
ALTER TABLE "events"
ADD COLUMN "organizer" TEXT;

-- Backfill organizer for existing seeded events
UPDATE "events"
SET "organizer" = 'PPIAQ'
WHERE COALESCE("organizer", '') = ''
  AND (
    ("title"->>'en') ILIKE '%Pre-Departure Briefing%'
    OR ("title"->>'id') ILIKE '%Pre-Departure Briefing%'
  );

UPDATE "events"
SET "organizer" = 'QUT'
WHERE COALESCE("organizer", '') = ''
  AND (
    ("title"->>'en') ILIKE '%QUT Market Day%'
    OR ("title"->>'id') ILIKE '%QUT Market Day%'
    OR ("title"->>'en') ILIKE '%PPIA QUT%'
    OR ("title"->>'id') ILIKE '%PPIA QUT%'
  );

UPDATE "events"
SET "organizer" = 'UQISA'
WHERE COALESCE("organizer", '') = ''
  AND (
    ("title"->>'en') ILIKE '%UQ St. Lucia Market Day%'
    OR ("title"->>'id') ILIKE '%UQ St. Lucia Market Day%'
    OR ("title"->>'en') ILIKE '%UQISA%'
    OR ("title"->>'id') ILIKE '%UQISA%'
  );
