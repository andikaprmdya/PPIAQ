// Read-only smoke check against a running production build:
// npm run build && npm start -- --port 3100
// npm run check:bandwidth -- http://localhost:3100
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const origin = process.argv[2] || 'http://localhost:3100';
const expectedCommit = process.env.EXPECTED_GIT_SHA;
const paths = [
  '/api/events', '/api/team', '/api/faq?page=home',
  '/api/content?page=pesta-rakyat', '/api/community-board',
];
const media = new Set();

// Check the deployed revision before touching a data endpoint. An old release
// could otherwise serve multi-MB originals during this check itself.
const versionResponse = await fetch(new URL('/api/version', origin), {
  cache: 'no-store', signal: AbortSignal.timeout(15000),
});
assert.ok(
  !(versionResponse.status === 402 && versionResponse.headers.get('x-vercel-error') === 'DEPLOYMENT_DISABLED'),
  'Vercel has disabled the deployment. Restore the hosting account before checking application traffic.',
);
assert.equal(versionResponse.status, 200, 'The deployed release lacks /api/version. Deploy the latest master before continuing.');
assert.equal(versionResponse.headers.get('cache-control'), 'no-store');
const version = await versionResponse.json();
assert.equal(version.bandwidthFixVersion, 1, 'This deployment does not contain the expected bandwidth fixes');
if (expectedCommit) assert.equal(version.commit, expectedCommit, 'Deployment commit is missing or does not match EXPECTED_GIT_SHA');
console.log(`Deployment revision: ${version.commit || 'not provided by host'}`);

const home = await fetch(new URL('/', origin));
assert.equal(home.status, 200);
const html = await home.text();
const galleryImages = html.match(/<img\b[^>]*\/images\/optimized\/[^>]*>/g) || [];
assert.equal(galleryImages.length, 1, 'Home should initially request only the first slideshow photo');
const firstPhoto = galleryImages[0].match(/\/images\/optimized\/home-shuffle-\d-480-([a-f0-9]+)\.webp/);
assert.ok(firstPhoto, 'Missing responsive homepage image');
const photo = await fetch(new URL(firstPhoto[0], origin));
assert.equal(photo.status, 200);
assert.equal(photo.headers.get('content-type'), 'image/webp');
assert.match(photo.headers.get('cache-control'), /max-age=31536000.*immutable/);
const photoBytes = Buffer.from(await photo.arrayBuffer());
assert.equal(createHash('sha256').update(photoBytes).digest('hex').slice(0, 12), firstPhoto[1], 'Immutable photo URL must contain the hash of its content');
assert.equal((await sharp(photoBytes).metadata()).width, 480);
assert.ok(photoBytes.length < 50 * 1024, 'Small homepage photo exceeds its bandwidth budget');
console.log(`Home: one initial slideshow image; smallest variant ${photoBytes.length} bytes, immutable cache`);

function collectMedia(value) {
  if (typeof value === 'string' && value.startsWith('/api/media/')) media.add(value);
  else if (value && typeof value === 'object') Object.values(value).forEach(collectMedia);
}

function checkCacheHeaders(response, browserTTL, sharedTTL, path) {
  const cache = response.headers.get('cache-control') || '';
  assert.match(cache, /(?:^|,)\s*public(?:,|$)/, path);
  assert.match(cache, new RegExp(`(?:^|,)\\s*max-age=${browserTTL}(?:,|$)`), path);
  const shared = cache.match(/(?:^|,)\s*s-maxage=(\d+)(?:,|$)/);
  if (shared) assert.equal(Number(shared[1]), sharedTTL, `${path} shared cache lifetime`);
  else {
    // Vercel consumes s-maxage and stale-while-revalidate at its proxy. They
    // remain visible on localhost; on Vercel we verify real CDN hits instead.
    assert.ok(response.headers.has('x-vercel-cache'), `${path} lacks a shared cache directive`);
  }
}

async function cachedRepeat(path, first) {
  const onVercel = first.headers.has('x-vercel-cache');
  for (let attempt = 0; attempt < (onVercel ? 3 : 1); attempt += 1) {
    const repeated = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(15000) });
    assert.equal(repeated.status, 200, path);
    if (!onVercel || ['HIT', 'STALE'].includes(repeated.headers.get('x-vercel-cache'))) return repeated;
    // A freshly generated response can take a moment to populate the CDN.
    await repeated.arrayBuffer();
  }
  assert.fail(`${path} never produced a Vercel CDN cache hit on repeated requests`);
}

function checkUncached(response, path) {
  const cache = response.headers.get('cache-control') || '';
  assert.ok(!/(?:^|,)\s*(?:s-maxage|max-age)=[1-9]\d*(?:,|$)/.test(cache), `${path} has a positive cache lifetime`);
  // Vercel adds public,max-age=0,must-revalidate to responses that have no
  // explicit policy. Its zero-lifetime default does not enable CDN caching.
  if (cache.includes('public')) assert.match(cache, /(?:no-store|max-age=0(?:,|$))/, `${path} is publicly cacheable`);
  assert.ok(!['HIT', 'STALE'].includes(response.headers.get('x-vercel-cache')), `${path} was served from the CDN cache`);
}

for (const path of paths) {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, 200, path);
  checkCacheHeaders(response, 60, 300, path);
  const text = await response.text();
  assert.ok(!text.includes('data:image/'), `${path} embeds image bytes`);
  assert.ok(Buffer.byteLength(text) < 2 * 1024 * 1024, `${path} exceeds data cache limit`);
  const data = JSON.parse(text);
  if (path === '/api/events') assert.ok(data.data.every(event => event.status === 'PUBLISHED'));
  if (path === '/api/team') assert.ok(data.data.every(member => member.isActive));
  collectMedia(data);
  const repeated = await cachedRepeat(path, response);
  assert.equal(await repeated.text(), text, `${path} changed between immediate reads`);
  console.log(`${path}: ${Buffer.byteLength(text)} bytes; repeat matches; CDN ${repeated.headers.get('x-vercel-cache') || 'not present (local)'}`);
}

// Check one event poster and one CMS image, keeping the check's own egress small.
const samples = [...media].filter(path => path.startsWith('/api/media/events/')).slice(0, 1);
samples.push(...[...media].filter(path => path.startsWith('/api/media/content/')).slice(0, 1));
for (const path of samples) {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, 200, path);
  assert.equal(response.headers.get('content-type'), 'image/webp');
  checkCacheHeaders(response, 300, 86400, path);
  const buffer = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(buffer).metadata();
  assert.ok(metadata.width <= 1600 && metadata.height <= 1600);
  assert.ok(buffer.length * 4 / 3 < 2 * 1024 * 1024, 'Optimized image exceeds data cache limit');
  const repeated = await cachedRepeat(path, response);
  assert.deepEqual(Buffer.from(await repeated.arrayBuffer()), buffer);
  console.log(`Public ${path.split('/')[3]} image: ${buffer.length} bytes, ${metadata.width}×${metadata.height}; repeat matches`);

  // Verify Next/Image can load this same-origin API image in production.
  const optimized = await fetch(new URL(`/_next/image?url=${encodeURIComponent(path)}&w=640&q=75`, origin));
  assert.equal(optimized.status, 200, 'Next/Image failed to load public media');
  assert.match(optimized.headers.get('content-type'), /^image\//);
}

for (const path of ['/api/media/users/test', '/api/media/events/test?field=en', '/api/media/content/test?field=password']) {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, 404, `Unexpected media access: ${path}`);
  assert.equal(response.headers.get('cache-control'), 'no-store');
}
for (const path of ['/api/auth/me', '/api/admin/events']) {
  const response = await fetch(new URL(path, origin));
  assert.ok([401, 403].includes(response.status), `Unexpected unauthenticated access: ${path}`);
  checkUncached(response, path);
}
const missing = await fetch(new URL('/api/content', origin));
assert.equal(missing.status, 400);
checkUncached(missing, '/api/content');
console.log('Public bandwidth checks passed; invalid media and private APIs rejected.');
