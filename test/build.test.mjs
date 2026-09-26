// Checks the built pages in dist/. Run `npm run build` first — `npm test` does.
//
// These guard the failure modes that have already happened once and looked fine
// while they were happening: donate buttons pointing somewhere wrong, and the
// modal iframe that never loaded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { donateUrl } from '../src/config/donate.ts';

const pages = [
  { lang: 'ar', dir: 'rtl', file: 'dist/index.html' },
  { lang: 'en', dir: 'ltr', file: 'dist/en/index.html' },
];

const decode = (s) => s.replaceAll('&amp;', '&');

for (const { lang, dir, file } of pages) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

  test(`${file}: html lang and dir`, () => {
    const root = html.match(/<html[^>]*>/)[0];
    assert.match(root, new RegExp(`lang="${lang}"`));
    assert.match(root, new RegExp(`dir="${dir}"`));
  });

  test(`${file}: every donate button is a real link to SGI`, () => {
    const anchors = html.match(/<a\b[^>]*\bdata-donate-open\b[^>]*>/g) ?? [];
    // Header (desktop + mobile), Hero, DonationSection.
    assert.ok(anchors.length >= 4, `expected at least 4 donate buttons, found ${anchors.length}`);

    for (const a of anchors) {
      const href = decode(a.match(/\bhref="([^"]*)"/)?.[1] ?? '');
      // The plain URL, never the framed one: a no-JS donor follows this href and
      // needs SGI's site chrome.
      assert.equal(href, donateUrl(lang));
    }
  });

  test(`${file}: the donate modal is present`, () => {
    assert.match(html, /<dialog[^>]*id="itq-donate-modal"/);
  });

  test(`${file}: the modal iframe is not lazy and has no src`, () => {
    const frame = html.match(/<iframe\b[^>]*\bdata-donate-frame\b[^>]*>/)?.[0];
    assert.ok(frame, 'modal iframe not found');
    // loading="lazy" on a hidden frame means it is never fetched — the modal
    // deadlocks on "Loading…". See the comment above the iframe in DonateModal.astro.
    assert.doesNotMatch(frame, /loading=/);
    // src is set on first open, so the payment page is not loaded for every visitor.
    assert.doesNotMatch(frame, /\bsrc=/);
    assert.match(frame, /allow="payment"/);
  });
}
