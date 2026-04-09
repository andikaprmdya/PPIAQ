-- Add organizer (penyelenggara) field for event filtering
ALTER TABLE "events"
ADD COLUMN "organizer" TEXT;
