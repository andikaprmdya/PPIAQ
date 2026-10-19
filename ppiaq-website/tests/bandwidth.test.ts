import assert from 'node:assert/strict';
import { test } from 'node:test';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { config } from '../middleware';

test('public assets bypass middleware while protected application paths still match', () => {
  for (const path of [
    '/images/optimized/home-shuffle-1-480-hash.webp', '/images/Andika.png',
    '/guides/PPIAQ_Election_Admin_Guide.pdf', '/downloads/partnership-obligations-2026.csv',
    '/favicon.ico', '/favicon-96x96.png', '/site.webmanifest',
    '/web-app-manifest-192x192.png', '/EOI%20guide.pdf', '/next.svg',
    '/_next/static/chunks/example.js', '/_next/image?url=%2Fimages%2FAndika.png&w=256&q=75',
    '/api/events', '/api/admin/elections',
  ]) {
    assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: `https://ppiaqueensland.org${path}` }), false, path);
  }
  for (const path of [
    '/', '/about', '/admin', '/admin/elections', '/admin/report.pdf',
    '/curator/events', '/profile', '/community-board', '/vote/example',
    '/images-private', '/api-settings',
  ]) {
    assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: `https://ppiaqueensland.org${path}` }), true, path);
  }
});
