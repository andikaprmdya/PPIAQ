# Presidential elections

Admin: `/admin/elections`. Voters enter through their personal emailed link at
`/vote/[id]#token=…`. Both ordinary and associate active members can be enrolled.
Financial eligibility is explicitly confirmed by the committee, rather than
inferred from an APPROVED account alone.

## Setup and deployment

1. Apply `npx prisma migrate deploy` with the same `DATABASE_URL` used by the
   deployed website. The election migration adds five tables and two enums;
   it does not modify existing member records. It enables RLS on all new tables
   without anon/browser policies. The backend needs its existing privileged
   PostgreSQL connection, never a browser Supabase key.
2. Keep the existing `BREVO_API_KEY` and verified sender
   `qld@ppi-australia.org`. Publishing refuses to proceed without an API key.
   Provider quotas and sender verification still apply.
3. Set long random `AUTH_SECRET` and `ELECTION_TOKEN_SECRET` values for stable
   dedicated keys. The application can use the existing private server database
   credential as a fallback, so current deployment configuration continues to
   work. Do not rotate the election token key during an election. Delivery
   detects a changed key and fails visibly instead of sending unusable links.
4. Invitation origin defaults to `https://ppiaqueensland.org`.
   `ELECTION_SITE_URL` can override it; HTTPS is required in production.
   `NEXT_PUBLIC_SITE_URL` is the secondary fallback. The incoming request Host
   never determines the invitation destination.
5. Run `npm run elections:create-draft` to create the initial empty draft
   once, owned by the existing approved admin. An optional email argument selects
   a particular admin. The script does not grant roles, enroll voters, publish,
   or send messages.
6. Build/deploy normally. Existing members and administrators must sign in
   again because unsigned email/role cookies no longer authenticate APIs.

## Rules and lifecycle

- Save accepts only draft fields with a revision check and locks the election
  row. Candidates, tagged members, and dates remain editable only in DRAFT.
- Eligibility uses approved membership at `opensAt` and the existing one-year
  term fallback. Admins verify fees and duplicate people before publication.
  The voter roll is frozen at publish; later membership edits do not rewrite it.
- A real membership number is the voter label when available; otherwise a
  random label is generated. Authentication uses a separate 256-bit bearer
  credential. Only its hash and a derivation nonce are stored.
- Unique constraints prevent duplicate members, normalized email addresses,
  and voter labels in an election. Different accounts belonging to the same
  person still require committee review.
- Publish atomically freezes the election, creates hashed credentials and a
  durable email outbox, then `next/server`'s `after()` processes it after the
  response. The route has a 300-second execution budget. This requires hosting
  with Next.js `after` support, as provided by Vercel.
- Email batches contain up to 100 personalized message versions, with exactly
  one recipient each. Three workers claim batches using `SKIP LOCKED` and
  two-minute leases. Provider idempotency uses each batch UUID.
- A transient send failure gets one immediate retry. Failures and interrupted
  work remain visible and can be resumed from the admin page. There is no
  dependency on a browser polling loop or on a paid scheduler. Accepted by the
  provider is distinct from delivery to an inbox.
- Retrying or resending an unused invitation preserves its credential and
  frozen email, so it never issues another vote. Voted members cannot receive
  another voting right. A timeout followed by a retry beyond Brevo's idempotency
  TTL may duplicate an email; it still cannot duplicate a vote.
- Casting shares an election lock with concurrent voters. Closing/cancelling
  takes an exclusive lock. An atomic `hasVoted=false` update and anonymous ballot
  insert occur in one transaction, so concurrent requests cannot double count
  and insertion failures do not consume eligibility.
- Candidate IDs are checked against the same election; opening/closing times
  and optional abstention rules are enforced on the server. Ballots cannot be
  changed. Drafts may be deleted; published records are preserved.
- Candidate totals are unavailable until close/time expiry. Final exports
  contain only aggregates and protect spreadsheet cells against formula input.
- Election endpoints are private/no-store. Tokens use URL fragments, which are
  removed from browser history after access. They are submitted in POST bodies,
  never URL query strings. No automatic database polling is introduced.

## Privacy boundary

Application admins see eligibility and participation, without a choice next to
a member. Ballots have a random UUID, election ID, and nullable candidate ID;
they store no voter ID, email, token, IP, session, or per-ballot timestamp.

This is **application-level ballot privacy**, not cryptographic anonymity against
server/database owners. PostgreSQL transaction metadata, privileged logs, or
traffic observation can correlate the transaction that consumes a voter right
with its ballot. The email provider also processes invitation credentials.
Restrict operational access and use an independently audited election service
when the committee requires operator-resistant secrecy. Possession of a
forwarded bearer link also permits its first use; this is not proof of identity.

## Validation and guides

```sh
npm run test:elections
npm run build
npx eslint lib/elections lib/auth/session.ts app/admin/elections app/api/admin/elections app/api/vote app/vote components/elections tests
```

The test suite starts a temporary local PostgreSQL cluster and applies all
migrations. It does not load production environment files. Provider calls are
mocked. It covers race conditions, rollback, eligibility, immutable publication,
session tampering, origin checks, private batch delivery, retries, and results.

For manual browser checks, run `npx tsx tests/browser-fixture.ts` after a build.
It starts the build at `http://127.0.0.1:3141` using a separate throwaway local DB
and explicitly disables real email. Demo credentials and links are written to
the OS temporary directory and deleted at shutdown.

PDFs are in `public/guides/` and linked from the admin and voter pages. Their
editable sources are in `docs/election-*-guide.md`. Rebuild with
`npm run guides:elections` (Python `reportlab` required).

References:
[Next.js after](https://nextjs.org/docs/app/api-reference/functions/after),
[Brevo personalized batches](https://developers.brevo.com/docs/batch-send-transactional-emails),
[Brevo idempotency](https://developers.brevo.com/docs/heterogenous-versions-batch-emails).
