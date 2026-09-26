import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  roundDown, num, formatCount, countPrefix, programmes, teacherTraining,
  onlineReadingGraduates, areas, voices, ijazaLine,
} from '../src/data/itqaan.ts';

test('roundDown never overstates', () => {
  assert.equal(roundDown(106473), 106000);
  assert.equal(roundDown(11161), 11000);
  assert.equal(roundDown(2083), 2000);
  assert.equal(roundDown(1325), 1300);
  assert.equal(roundDown(999), 990);
  for (const n of [106473, 11161, 2083, 1325, 14309, 5088]) assert.ok(roundDown(n) <= n);
});

test('Arabic web copy uses Western digits (charity-web practice, and Itqaan’s own site)', () => {
  assert.equal(num(106000, 'ar'), '106,000');
  assert.equal(num(4, 'ar'), '4');
  assert.equal(num(106000, 'en'), '106,000');
});

test('formatCount says "more than" and rounds down', () => {
  assert.equal(formatCount(106473, 'ar'), 'أكثر من 106,000');
  assert.equal(formatCount(106473, 'en'), 'More than 106,000');
});

test('an exact round figure says "at least", never "more than"', () => {
  assert.equal(formatCount(1300, 'ar'), 'لا يقل عن 1,300');
  assert.equal(formatCount(1300, 'en'), 'At least 1,300');
  assert.equal(countPrefix(1300, 'en'), 'At least');
  assert.equal(countPrefix(1325, 'en'), 'More than');
});

test('the path is in climbing order with real counts', () => {
  assert.deepEqual(programmes.map((p) => p.id), ['reading', 'safra', 'mahir', 'maqari']);
  assert.deepEqual(programmes.map((p) => p.count), [106473, 11161, 2083, 1325]);
  assert.equal(teacherTraining.count, 14309);
  assert.equal(onlineReadingGraduates, 5088);
});

test('no Arabic-Indic digits anywhere in the copy', () => {
  const all = JSON.stringify({ programmes, areas, voices, ijazaLine });
  assert.doesNotMatch(all, /[٠-٩]/);
});

test('students are named by first name only', () => {
  for (const v of voices) for (const n of [v.name.ar, v.name.en]) assert.doesNotMatch(n.trim(), /\s/, n);
});

test('every string exists in both languages', () => {
  const l10n = [
    ijazaLine,
    ...programmes.flatMap((p) => [p.countLabel, p.name, p.teaches, p.meta]),
    ...areas.syria, ...areas.turkey,
    ...voices.flatMap((v) => [v.quote, v.name, v.role]),
  ];
  for (const s of l10n) {
    assert.ok(s.ar && s.ar.trim(), `missing ar: ${JSON.stringify(s)}`);
    assert.ok(s.en && s.en.trim(), `missing en: ${JSON.stringify(s)}`);
  }
  assert.equal(areas.syria.length, 4);
  assert.equal(areas.turkey.length, 5);
  assert.equal(voices.length, 3);
});
