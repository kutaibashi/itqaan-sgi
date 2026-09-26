// The URL contract with SGI's checkout. Node 24 strips the types from donate.ts
// on import, so this needs no build step and no test framework.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  CAMPAIGN_SLUG,
  DONATE_ORIGIN,
  FRAME_FLAG,
  donateUrl,
} from '../src/config/donate.ts';

test('the campaign slug is pinned, typo and all', () => {
  // An unresolvable slug does not break giving, it silently stops attributing it.
  // If this fails because someone "tidied" the slug, read the comment in donate.ts.
  assert.equal(CAMPAIGN_SLUG, 'itkan-foundationfor-education-and-development');
});

test('the frame flag is not a WordPress query var', () => {
  // ?embed=1 makes WordPress serve its oEmbed template instead of the donate page.
  assert.notEqual(FRAME_FLAG, 'embed');
  assert.equal(FRAME_FLAG, 'sgi_frame');
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

test('only the framed URL carries the frame flag', () => {
  for (const lang of ['ar', 'en']) {
    assert.equal(new URL(donateUrl(lang)).searchParams.has(FRAME_FLAG), false);
    assert.equal(new URL(donateUrl(lang, true)).searchParams.get(FRAME_FLAG), '1');
  }
});

test('donations go to sgi.ngo over https', () => {
  assert.equal(DONATE_ORIGIN, 'https://sgi.ngo');
});
