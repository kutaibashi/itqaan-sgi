// Checks the built pages in dist/. Run `npm run build` first — `npm test` does.
//
// These guard the failure modes that have already happened once and looked fine
// while they were happening: donate buttons pointing somewhere wrong, and the
// modal iframe that never loaded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

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
    // Header, hero and give band. The old mobile-menu duplicate is gone with the menu.
    assert.ok(anchors.length >= 3, `expected at least 3 donate buttons, found ${anchors.length}`);

    for (const a of anchors) {
      const href = decode(a.match(/\bhref="([^"]*)"/)?.[1] ?? '');
      // The plain URL, never the framed one: a no-JS donor follows this href and
      // needs SGI's site chrome.
      assert.equal(href, donateUrl(lang));
    }
  });

  test(`${file}: every local <link> in <head> resolves to a built file`, () => {
    // /favicon.png was linked here for months with no file behind it.
    const links = html.match(/<link\b[^>]*>/g) ?? [];
    const local = links
      .map((l) => l.match(/\bhref="(\/[^"/][^"]*)"/)?.[1])
      .filter(Boolean);
    assert.ok(local.length > 0, 'no local <link> hrefs found');
    for (const href of local) {
      assert.ok(existsSync(new URL(`../dist${href}`, import.meta.url)), `${href} is not in dist/`);
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

  test(`${file}: canonical and hreflang alternates`, () => {
    const self = lang === 'ar' ? 'https://itqaan.sgi.ngo/' : 'https://itqaan.sgi.ngo/en/';
    assert.match(html, new RegExp(`<link rel="canonical" href="${self}"`));
    assert.match(html, /<link rel="alternate" hreflang="ar" href="https:\/\/itqaan\.sgi\.ngo\/"/);
    assert.match(html, /<link rel="alternate" hreflang="en" href="https:\/\/itqaan\.sgi\.ngo\/en\/"/);
    assert.match(html, /<link rel="alternate" hreflang="x-default" href="https:\/\/itqaan\.sgi\.ngo\/"/);
    assert.match(html, new RegExp(`<meta property="og:url" content="${self}"`));
  });

  test(`${file}: share image points at a built file`, () => {
    const m = html.match(/<meta property="og:image" content="https:\/\/itqaan\.sgi\.ngo(\/[^"]+)"/);
    assert.ok(m, 'og:image missing');
    assert.ok(existsSync(new URL(`../dist${m[1]}`, import.meta.url)), `${m[1]} not in dist/`);
  });

  test(`${file}: no Google Fonts, light colour scheme`, () => {
    assert.doesNotMatch(html, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
    assert.match(html.match(/<html[^>]*>/)[0], /style="color-scheme: ?light"|data-color-scheme/);
  });

  test(`${file}: exactly one h1 and one high-priority image`, () => {
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
    assert.equal((html.match(/fetchpriority="high"/g) ?? []).length, 1);
  });

  test(`${file}: skip link targets main`, () => {
    assert.match(html, /<a[^>]*class="skip-link"[^>]*href="#main"|<a[^>]*href="#main"[^>]*class="skip-link"/);
    assert.match(html, /<main[^>]*id="main"/);
  });

  test(`${file}: the path shows the four programmes in order, rounded down`, () => {
    const path = html.match(/<section[^>]*id="path"[\s\S]*?<\/section>/)?.[0];
    assert.ok(path, 'section#path missing');
    const items = path.match(/<li\b/g) ?? [];
    assert.equal(items.length, 5, 'four programmes plus the ijaza line');
    const expected = lang === 'ar'
      ? ['أكثر من ١٠٦٬٠٠٠', 'أكثر من ١١٬٠٠٠', 'أكثر من ٢٬٠٠٠', 'أكثر من ١٬٣٠٠']
      // English sets "More than" on its own line above each number.
      : ['106,000', '11,000', '2,000', '1,300'];
    if (lang === 'en') assert.ok((path.match(/More than/g) ?? []).length >= 4, 'each count says "More than"');
    let at = -1;
    for (const e of expected) {
      const i = path.indexOf(e);
      assert.ok(i > at, `${e} missing or out of order`);
      at = i;
    }
  });

  test(`${file}: no middle dot in Arabic text (Readex draws it like the digit ٠)`, () => {
    if (lang !== 'ar') return;
    const text = html.slice(html.indexOf('<body'))
      .replace(/<script\b[\s\S]*?<\/script>/g, '')
      .replace(/<[^>]+>/g, ' ');
    assert.doesNotMatch(text, /·/);
  });

  test(`${file}: every image has alt, width and height`, () => {
    for (const img of html.match(/<img\b[^>]*>/g) ?? []) {
      assert.match(img, /\balt="/, img);
      assert.match(img, /\bwidth="\d+"/, img);
      assert.match(img, /\bheight="\d+"/, img);
    }
  });

  test(`${file}: no photos of named students`, () => {
    assert.doesNotMatch(html, /avatar-/);
    const voices = html.match(/<section[^>]*id="voices"[\s\S]*?<\/section>/)?.[0] ?? '';
    assert.ok(voices, 'section#voices missing');
    assert.doesNotMatch(voices, /<img\b/);
  });
}

test('built CSS keeps anchors clear of the sticky header', () => {
  const dir = new URL('../dist/_astro/', import.meta.url);
  const css = readdirSync(dir).filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(new URL(f, dir), 'utf8')).join('\n');
  assert.match(css, /scroll-margin-(block-start|top)/);
});
