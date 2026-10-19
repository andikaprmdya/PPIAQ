# Supabase bandwidth

The October 2026 alert concerns egress (bytes sent out), not database capacity.
The production database contained a published event with a 3,495,103-byte
base64 poster. Public event requests selected that whole image and the home page
repeated the request every 30 seconds. One continuously open tab could therefore
transfer approximately 420 MB per hour from the database.

## Changes

- Public event, team and static content queries replace embedded images with
  versioned `/api/media/…` URLs **inside PostgreSQL**. Image bytes do not cross
  the database connection during list requests.
- Public CMS query results share Next.js's persistent data cache for one hour.
  Successful CMS writes immediately invalidate the corresponding data and media
  tags, including writes through curator endpoints.
- Public JSON responses allow 60 seconds of browser caching and five minutes of
  CDN caching, plus up to one minute of stale responses during revalidation.
  Public visitors can see a CMS edit after that HTTP cache window; refreshing
  an already open page fetches the current cached content.
- The media endpoint reads only published events, active team members and public
  static content. It selects only the requested image, converts it to WebP at
  up to 1600×1600, and caches the optimized result for one day. A smaller fallback
  keeps the result below Next's 2 MB data cache entry limit.
- URLs include the record's update time so edits request a new browser/CDN image.
  Previously public images can remain in downstream caches until their expiry.
- Public pages and event/team administration screens no longer poll every
  30 seconds. Administration screens still fetch on entry and update their state
  after their own changes.
- The CMS uploader resizes and compresses new images before saving them.
- Homepage slideshow photos have responsive WebP variants prepared locally.
  The four original photos total 12,042,440 bytes; all sixteen generated variants
  combined total 861,624 bytes. A browser downloads just its chosen size for each
  photo it actually views, without invoking Vercel's image transformation service.
  Generated filenames contain a content hash and allow immutable one-year caching.
  Originals are retained as sources; regenerate variants with `npm run images:optimize`
  after replacing a source photo, and commit the manifest and generated images.
- Only the first slideshow photo is initially rendered. Subsequent photos load
  when selected. Automatic rotation runs only while the gallery is visible and
  the tab is active, and respects reduced motion, Save-Data and 2G connections.
  Arrow buttons continue to work. The first slide is stable between server and
  browser rendering, avoiding an unnecessary image download during reshuffling.
- Team portraits specify their actual 64 px display size, including on About.
  Larger member detail photos still load on demand. The decorative homepage bird
  no longer preloads on mobile, where it is hidden.
- Public static image, guide, download and favicon requests bypass middleware.
  Application pages retain their existing session redirects; API authentication
  continues to be checked in the API handlers. Run `npm run test:bandwidth` to
  check that static-file exclusions do not bypass protected page paths.

Existing database records are preserved. No schema migration or bucket is needed.
Authentication and administration responses do not receive public cache headers.
Scripts that write directly through Prisma bypass on-demand cache invalidation;
their public data changes appear after the one-hour cache revalidation window
(image contents after the daily media revalidation window).

## Validation

Additional image changes were measured against the preceding fixed release
(`520b142`) using a local production server, Chrome at 390×844 with device pixel
ratio 3, a fresh browser context per page and a 5.5-second wait after network idle.
Transferred bytes include loaded scripts, images, HTML and API responses:

| Page | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| Homepage | 848,606 B | 516,131 B | 39% |
| Meet the Team | 635,694 B | 318,115 B | 50% |

Portrait image transfers alone fell from 371,090 B to 52,503 B (86%). These are
local browser measurements, not production billing totals. Savings vary with
device, cache state and time spent viewing the slideshow. Browser checks also
verified next/previous controls, offscreen pause, reduced motion, data saving,
desktop/mobile rendering, small portraits and larger member detail images.

From `ppiaq-website`, run:

```sh
npm run build
npm start -- --port 3100
```

In another terminal:

```sh
npm run check:bandwidth -- http://localhost:3100
```

This read-only smoke check verifies public payload sizes, absence of inline
images, cache headers, image dimensions, repeat responses, Next/Image integration,
and rejection of private or unsupported media requests. It reads at most one
event poster and one static-content image on a cold cache.

The check first calls `/api/version`, which returns the public Git commit SHA
without querying Supabase. It stops before downloading application data if
Vercel has disabled the deployment or the site still runs an older release.
To verify a particular production commit, run:

```sh
EXPECTED_GIT_SHA=YOUR_FULL_COMMIT_SHA npm run check:bandwidth -- https://ppiaqueensland.org
```

## Vercel deployment

The Vercel project's **Root Directory** must be `ppiaq-website`, with production
branch `master`. The supported build/install configuration is in
`ppiaq-website/vercel.json`. Root Directory belongs in the Vercel project settings;
the old repository-root `monorepo` / `projectSettings` JSON was not a supported
way to configure it. Next.js uses the single `next.config.ts` file, including
the public-media image allowlist.

A successful Git push does not prove that Vercel deployed it. Inspect the commit's
Vercel check and compare `/api/version` with that commit after deployment.
An `Account is blocked` GitHub status or `402 DEPLOYMENT_DISABLED` HTTP response
is a hosting-account restriction. Repository changes and repeated pushes cannot
clear that restriction. Keep the election in DRAFT while restoring hosting.

### Recovery without a paid upgrade

No paid plan, trial, billing change or new Vercel account is needed for these
optimizations. They reduce future use once the account can serve the release.
They do not remove bytes already counted against the account's allowance.

Vercel's [Hobby documentation](https://vercel.com/docs/plans/hobby#hobby-billing-cycle)
says that, in most cases, exceeding a usage limit means waiting until 30 days
have passed before the feature can be used again. Check the actual reset date
in the owning team's Usage dashboard and pause notification. If the owner's
dashboard says November 15, that is the date to check; it has not been confirmed
through the connected CLI account.

The owner can request a review through Vercel's available account/support channels
and supply the fixed commit and measurements. An early reset is at Vercel's
discretion; it cannot be promised. Once the restriction expires or Vercel lifts
it, redeploy the latest `master`, check the GitHub deployment status and run the
read-only release check above. Repeated pushes while blocked cannot restore the
site and are unnecessary. See also
[Vercel's deployment-disabled troubleshooting](https://vercel.com/docs/errors/deployment_disabled).

## Account usage

After deployment, inspect Supabase's Usage dashboard to confirm that daily
Database/Shared Pooler Egress falls. These code changes reduce future transfers;
they cannot remove the 12.11 GB already recorded in the warning. If Supabase
restricts the organization, its current usage documentation says the restriction
clears with the next billing cycle or an eligible plan/billing change. Account
billing must be addressed separately if immediate continued service is required.

Reference: [Supabase: Manage Egress usage](https://supabase.com/docs/guides/platform/manage-your-usage/egress).
