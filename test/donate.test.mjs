// The URL contract with SGI's checkout. Node 24 strips the types from donate.ts
// on import, so this needs no build step and no test framework.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  CAMPAIGN_SLUG,
  DONATE_ORIGIN,
  EMBED_SRC,
  SITE,
  donateUrl,
} from '../src/config/donate.ts';

test('the campaign slug is pinned, typo and all', () => {
  // An unresolvable slug does not break giving, it silently stops attributing it.
  // If this fails because someone "tidied" the slug, read the comment in donate.ts.
  assert.equal(CAMPAIGN_SLUG, 'itkan-foundationfor-education-and-development');
});

test('the site key is the one in SGI\'s registry', () => {
  // Donations\Frame\SITES on sgi.ngo maps 'itqaan' to https://itqaan.sgi.ngo. The
  // embed script refuses a key that does not match ^[a-z][a-z0-9-]{0,31}$.
  assert.equal(SITE, 'itqaan');
  assert.match(SITE, /^[a-z][a-z0-9-]{0,31}$/);
});

test('the embed script comes from the checkout origin, v1', () => {
  // The script frames whatever origin it was loaded from, so these must agree.
  assert.equal(EMBED_SRC, `${DONATE_ORIGIN}/embed/v1/donate.js`);
});

test('English is SGI\'s default language and takes no prefix', () => {
  assert.equal(
    donateUrl('en'),
    `${DONATE_ORIGIN}/donate/?campaign_slug=${CAMPAIGN_SLUG}`,
  );
});

test('Arabic takes the /ar/ prefix', () => {
  assert.equal(
    donateUrl('ar'),
    `${DONATE_ORIGIN}/ar/donate/?campaign_slug=${CAMPAIGN_SLUG}`,
  );
});

test('the href never carries frame mode: the embed script adds it', () => {
  // A no-JS donor follows this href and needs SGI's site chrome.
  for (const lang of ['ar', 'en']) {
    const params = new URL(donateUrl(lang)).searchParams;
    for (const k of ['sgi_frame', 'sgi_parent', 'embed']) assert.equal(params.has(k), false, k);
  }
});

test('donations go to sgi.ngo over https', () => {
  assert.equal(DONATE_ORIGIN, 'https://sgi.ngo');
});
