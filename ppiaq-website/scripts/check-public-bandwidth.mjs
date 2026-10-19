// Read-only smoke check against a running production build:
// npm run build && npm start -- --port 3100
// npm run check:bandwidth -- http://localhost:3100
import assert from 'node:assert/strict';
import sharp from 'sharp';

const origin = process.argv[2] || 'http://localhost:3100';
const paths = [
  '/api/events', '/api/team', '/api/faq?page=home',
  '/api/content?page=pesta-rakyat', '/api/community-board',
];
const media = new Set();

function collectMedia(value) {
  if (typeof value === 'string' && value.startsWith('/api/media/')) media.add(value);
  else if (value && typeof value === 'object') Object.values(value).forEach(collectMedia);
}

for (const path of paths) {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get('cache-control'), /public.*s-maxage=300/, path);
  const text = await response.text();
  assert.ok(!text.includes('data:image/'), `${path} embeds image bytes`);
  assert.ok(Buffer.byteLength(text) < 2 * 1024 * 1024, `${path} exceeds data cache limit`);
  const data = JSON.parse(text);
  if (path === '/api/events') assert.ok(data.data.every(event => event.status === 'PUBLISHED'));
  if (path === '/api/team') assert.ok(data.data.every(member => member.isActive));
  collectMedia(data);
  const repeated = await fetch(new URL(path, origin));
  assert.equal(await repeated.text(), text, `${path} changed between immediate reads`);
  console.log(`${path}: ${Buffer.byteLength(text)} bytes; repeat matches`);
}

// Check one event poster and one CMS image, keeping the check's own egress small.
const samples = [...media].filter(path => path.startsWith('/api/media/events/')).slice(0, 1);
samples.push(...[...media].filter(path => path.startsWith('/api/media/content/')).slice(0, 1));
for (const path of samples) {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, 200, path);
  assert.equal(response.headers.get('content-type'), 'image/webp');
  assert.match(response.headers.get('cache-control'), /s-maxage=86400/);
  const buffer = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(buffer).metadata();
  assert.ok(metadata.width <= 1600 && metadata.height <= 1600);
  assert.ok(buffer.length * 4 / 3 < 2 * 1024 * 1024, 'Optimized image exceeds data cache limit');
  const repeated = await fetch(new URL(path, origin));
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
  assert.ok(!response.headers.get('cache-control')?.includes('public'), `${path} is publicly cached`);
}
const missing = await fetch(new URL('/api/content', origin));
assert.equal(missing.status, 400);
assert.ok(!missing.headers.get('cache-control')?.includes('public'));
console.log('Public bandwidth checks passed; invalid media and private APIs rejected.');
