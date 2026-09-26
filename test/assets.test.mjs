import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

const root = new URL('../public/', import.meta.url);
const names = ['hall', 'lecture', 'teachers', 'classroom', 'women'];

test('every cropped photo exists in both formats and sizes', () => {
  for (const n of names) for (const w of [800, 1600]) for (const ext of ['avif', 'webp']) {
    assert.ok(existsSync(new URL(`photos/${n}-${w}.${ext}`, root)), `${n}-${w}.${ext}`);
  }
});

test('share image and video thumbnail exist', () => {
  assert.ok(existsSync(new URL('og/itqaan.jpg', root)));
  assert.ok(existsSync(new URL('video/intro.webp', root)));
});

test('uncropped, watermarked originals are no longer deployed', () => {
  for (let i = 1; i <= 7; i++) assert.ok(!existsSync(new URL(`slider-${i}.jpg`, root)), `slider-${i}.jpg`);
});
