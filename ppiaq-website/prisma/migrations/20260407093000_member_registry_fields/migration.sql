-- Add fields to align user data with 2026 financial members register format
ALTER TABLE "users"
  ADD COLUMN "memberNo" TEXT,
  ADD COLUMN "branch" TEXT,
  ADD COLUMN "domicileCampus" TEXT,
  ADD COLUMN "intake" TEXT,
  ADD COLUMN "expectedGraduation" TEXT,
  ADD COLUMN "membershipTermEnds" TIMESTAMP(3);

CREATE INDEX "users_memberNo_idx" ON "users"("memberNo");
