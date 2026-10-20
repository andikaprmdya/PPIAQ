import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextRequest } from 'next/server';
import ElectionPage, { metadata } from '../app/2026election/page';
import LanguageContext from '../lib/language-context';
import { middleware } from '../middleware';

const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfLYRGehHPtTOmimjV7IFRcQuByqYq5upmIMXQI-f5HvV5K8A/viewform';

for (const language of ['en', 'id'] as const) {
  test(`2026 election prioritizes the original embedded form without requiring Google sign-in (${language})`, () => {
    const html = renderToStaticMarkup(createElement(
      LanguageContext.Provider,
      { value: { language, setLanguage: () => {} } },
      createElement(ElectionPage),
    ));

    assert.match(html, new RegExp(`<iframe[^>]+src="${formUrl}\\?embedded=true"`));
    assert.match(html, /<iframe[^>]+title="[^"]+"/);
    assert.ok(html.includes(`href="${formUrl}"`));
    assert.match(html, /target="_blank" rel="noopener noreferrer"/);
    assert.ok(html.includes(language === 'id' ? 'Pemilihan PPIAQ 2026' : 'PPIAQ 2026 Election'));
    assert.ok(html.includes(language === 'id' ? 'Buka Google Form' : 'Open Google Form'));
    assert.ok(html.includes(language === 'id' ? 'akun Google' : 'Google Account'));
    assert.ok(html.includes(language === 'id' ? 'Tautan resume/CV' : 'CV document link'));
    assert.ok(html.includes(language === 'id' ? 'formulir asli' : 'original Google Form'));
    assert.ok(html.indexOf('<iframe') < html.indexOf(`href="${formUrl}"`), 'The direct link should be a fallback below the embedded form');
    assert.ok(html.includes(language === 'id' ? 'Tidak perlu login akun Google' : 'No Google Account sign-in is required'));
  });
}

test('2026 election uses its own canonical URL', () => {
  assert.equal(metadata.alternates?.canonical, '/2026election');
});

test('visitors can access the election form without a website login', () => {
  const response = middleware(new NextRequest('https://ppiaqueensland.org/2026election'));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('location'), null);
});
