-- CreateEnum
CREATE TYPE "ElectionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ElectionMailStatus" AS ENUM ('QUEUED', 'SENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "elections" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ElectionStatus" NOT NULL DEFAULT 'DRAFT',
    "opensAt" TIMESTAMP(3),
    "closesAt" TIMESTAMP(3),
    "allowAbstain" BOOLEAN NOT NULL DEFAULT true,
    "emailSubject" TEXT NOT NULL,
    "emailBody" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "financialConfirmedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "elections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election_candidates" (
    "id" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "manifesto" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "election_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election_voters" (
    "id" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tokenNonce" TEXT NOT NULL,
    "tokenHash" TEXT,
    "hasVoted" BOOLEAN NOT NULL DEFAULT false,
    "mailBatchId" UUID,

    CONSTRAINT "election_voters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election_ballots" (
    "id" UUID NOT NULL,
    "electionId" TEXT NOT NULL,
    "candidateId" TEXT,

    CONSTRAINT "election_ballots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election_mail_batches" (
    "id" UUID NOT NULL,
    "electionId" TEXT NOT NULL,
    "status" "ElectionMailStatus" NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "errorCode" TEXT,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "election_mail_batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "elections_status_idx" ON "elections"("status");

-- CreateIndex
CREATE UNIQUE INDEX "election_candidates_electionId_id_key" ON "election_candidates"("electionId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "election_voters_tokenHash_key" ON "election_voters"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "election_voters_electionId_userId_key" ON "election_voters"("electionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "election_voters_electionId_email_key" ON "election_voters"("electionId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "election_voters_electionId_voterId_key" ON "election_voters"("electionId", "voterId");

-- CreateIndex
CREATE INDEX "election_ballots_electionId_candidateId_idx" ON "election_ballots"("electionId", "candidateId");

-- CreateIndex
CREATE INDEX "election_mail_batches_electionId_status_idx" ON "election_mail_batches"("electionId", "status");

-- AddForeignKey
ALTER TABLE "elections" ADD CONSTRAINT "elections_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_candidates" ADD CONSTRAINT "election_candidates_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_voters" ADD CONSTRAINT "election_voters_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_voters" ADD CONSTRAINT "election_voters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_voters" ADD CONSTRAINT "election_voters_mailBatchId_fkey" FOREIGN KEY ("mailBatchId") REFERENCES "election_mail_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_ballots" ADD CONSTRAINT "election_ballots_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_ballots" ADD CONSTRAINT "election_ballots_electionId_candidateId_fkey" FOREIGN KEY ("electionId", "candidateId") REFERENCES "election_candidates"("electionId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_mail_batches" ADD CONSTRAINT "election_mail_batches_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Browser/anon Supabase clients must never read voter identities or ballots.
-- The server's privileged Postgres connection is the only application access.
ALTER TABLE "elections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "election_candidates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "election_voters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "election_ballots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "election_mail_batches" ENABLE ROW LEVEL SECURITY;
