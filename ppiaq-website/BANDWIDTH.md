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

Existing database records are preserved. No schema migration or bucket is needed.
Authentication and administration responses do not receive public cache headers.
Scripts that write directly through Prisma bypass on-demand cache invalidation;
their public data changes appear after the one-hour cache revalidation window
(image contents after the daily media revalidation window).

## Validation

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

## Account usage

After deployment, inspect Supabase's Usage dashboard to confirm that daily
Database/Shared Pooler Egress falls. These code changes reduce future transfers;
they cannot remove the 12.11 GB already recorded in the warning. If Supabase
restricts the organization, its current usage documentation says the restriction
clears with the next billing cycle or an eligible plan/billing change. Account
billing must be addressed separately if immediate continued service is required.

Reference: [Supabase: Manage Egress usage](https://supabase.com/docs/guides/platform/manage-your-usage/egress).
