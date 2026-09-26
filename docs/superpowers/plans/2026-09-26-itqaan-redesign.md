# Itqaan fundraising page redesign ("The Path") — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild itqaan.sgi.ngo (ar `/`, en `/en/`) as a donor-only fundraising page whose signature section is Itqaan's real learning path drawn as a chain (سند), sourced from Itqaan's own published data.

**Architecture:** Static Astro 5 pages composed of one `.astro` component per section, styled with Tailwind 4 utilities over a 3-tier token layer in `global.css`. Shared facts (programmes, counts, areas, quotes) live in one typed module, `src/data/itqaan.ts`. Photos are cropped once by a sharp script into committed AVIF/WebP files. React is removed. The only JavaScript left is the existing donate modal and a video facade.

**Tech Stack:** Astro 5.17, Tailwind 4 (`@tailwindcss/vite`), `@fontsource-variable/readex-pro`, `@fontsource/amiri`, sharp (already installed via Astro), `node:test` on Node 24.

**Spec:** `docs/superpowers/specs/2026-09-26-itqaan-redesign-design.md`

## Global Constraints

- This is SGI's **fundraising page** for Itqaan, not Itqaan's website. Every section builds donor trust or asks for the gift.
- Do not change `src/config/donate.ts` or the behaviour of `src/components/DonateModal.astro`. Every donate button is `<a href={donateUrl(lang)} data-donate-open …>`.
- Brand hues are locked. Tokens (OKLCH): ink `oklch(34.9% 0.082 246.1)`, ink-deep `oklch(27.3% 0.056 241.3)`, teal `oklch(62.3% 0.102 193.2)`, teal-text `oklch(52.6% 0.086 192.8)`, lime `oklch(75.4% 0.163 130.5)`, lime-hover `oklch(70.5% 0.155 131.4)`, paper `oklch(97.7% 0.003 197.1)`, line `oklch(90.7% 0.013 196.9)`, muted `oklch(47.4% 0.039 234.0)`.
- Contrast pairs used: ink on paper 10.6:1 · muted on paper 6.2:1 · teal-text on white 5.2:1 · **ink-deep on lime 7.1:1 (donate buttons)** · white on ink 11.3:1 · lime focus ring on ink 5.4:1. Never set small text in `teal` (3.4:1).
- Fonts: Readex Pro Variable for all text, Amiri only for Qur'an/hadith lines. No Google Fonts requests.
- Arabic numbers use `Intl.NumberFormat('ar-SY')` (Arabic-Indic digits). Plain `'ar'` yields Latin digits in Node, so never use it.
- Counts are rounded **down** and prefixed «أكثر من» / "More than".
- Logical CSS only (`ms-/me-/ps-/pe-/start-/end-/text-start`). No letter-spacing on Arabic. No `transition: all`.
- No centre names next to photos of children. No avatar photos of named students.
- Outbound links allowed: `sgi.ngo`, `itkan.info`, `www.youtube.com/watch`, `wa.me`, `mailto:`. No social icons.
- Commit after each task, with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Latin inside Arabic (bidi):** "SGI", "501(c)(3)", the Turkish legal name and the phone number inside Arabic sentences must render in the right order. Pinned by a test that every `SGI`/`501(c)(3)` occurrence in the Arabic page is inside `<bdi>` (Task 8).
2. **No JavaScript:** the video must still be reachable as a plain link to YouTube, and donate links must still work (already tested). Pinned by a test that the facade is an `<a href="https://www.youtube.com/watch?v=…">` (Task 7).
3. **Sticky header covering anchor targets:** jumping to `#path` or `#donate` must not hide the heading under the header. Pinned by a test that built CSS contains `scroll-margin-block-start` for `[id]` (Task 3).
4. **Exit links creeping back:** a later edit re-adding social icons or menus. Pinned by an outbound-host allowlist test (Task 8).
5. **Narrow phones (320px) and long English words:** no horizontal scroll. Pinned by a Playwright check that `document.documentElement.scrollWidth <= innerWidth` at 320px in both languages (Task 9).

---

## File map

| File | Status | Responsibility |
|---|---|---|
| `src/data/itqaan.ts` | create | Programmes, counts, areas, quotes, `roundDown`, `formatCount`, `num` |
| `test/data.test.mjs` | create | Unit tests for the data module |
| `scripts/build-assets.mjs` | create | Crop photos → `public/photos/`, OG image → `public/og/`, video thumb → `public/video/` |
| `brand/photos/slider-{1..7}.jpg` | move from `public/` | Photo sources (not deployed) |
| `src/styles/global.css` | rewrite | Tokens, base, components (`.btn-give`, `.link-quiet`, `.skip-link`) |
| `src/layouts/Layout.astro` | rewrite | `<head>`: fonts, meta, canonical, hreflang, OG, JSON-LD |
| `src/components/Picture.astro` | create | `<picture>` for the cropped photos |
| `src/components/Header.astro` | rewrite | Logo, language switch, Donate |
| `src/components/Hero.astro` | rewrite | H1, lead, Donate, SGI line, hero photo |
| `src/components/Path.astro` | create | Signature chain + teacher track |
| `src/components/Areas.astro` | rewrite | Syria / Türkiye / online |
| `src/components/Voices.astro` | create | 3 static quotes |
| `src/components/Gallery.astro` | create | 4-photo grid |
| `src/components/Film.astro` | create | YouTube facade |
| `src/components/Give.astro` | create | Donate band + who receives the gift |
| `src/components/AboutBrief.astro` | create | Mission, registration, link to itkan.info |
| `src/components/Footer.astro` | rewrite | One quiet row |
| `src/pages/index.astro`, `src/pages/en/index.astro` | rewrite | Compose sections |
| `About, Objectives, Projects, StatsSection, Contact, SocialLinks, DonationSection, VideoSection .astro`, `ImageSlider.jsx`, `Testimonials.jsx` | delete | Replaced |
| `test/build.test.mjs` | modify | New page-level assertions |
| `CLAUDE.md`, `README.md` | modify | Fundraising scope, assets script |

---

### Task 1: Data module

**Files:**
- Create: `src/data/itqaan.ts`
- Test: `test/data.test.mjs`

**Interfaces:**
- Produces: `type Lang = 'ar' | 'en'`; `type L10n = Record<Lang, string>`; `roundDown(n: number): number`; `num(n: number, lang: Lang): string`; `formatCount(n: number, lang: Lang): string`; `programmes: Programme[]` where `Programme = { id: 'reading'|'safra'|'mahir'|'maqari'; count: number; countLabel: L10n; name: L10n; teaches: L10n; meta: L10n }`; `ijazaLine: L10n`; `teacherTraining: { count: number }`; `onlineReadingGraduates: number`; `areas: { syria: L10n[]; turkey: L10n[] }`; `voices: { quote: L10n; name: L10n; role: L10n; months: number }[]`; `DATA_SOURCE = { url: 'app.itkan.info', readOn: '2026-09-26' }`.

- [ ] **Step 1: Write the failing test** — `test/data.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  roundDown, num, formatCount, programmes, teacherTraining,
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

test('Arabic numbers use Arabic-Indic digits', () => {
  // Plain 'ar' gives Latin digits in Node; the module must pin ar-SY.
  assert.equal(num(106000, 'ar'), '١٠٦٬٠٠٠');
  assert.equal(num(4, 'ar'), '٤');
  assert.equal(num(106000, 'en'), '106,000');
});

test('formatCount says "more than" and rounds down', () => {
  assert.equal(formatCount(106473, 'ar'), 'أكثر من ١٠٦٬٠٠٠');
  assert.equal(formatCount(106473, 'en'), 'More than 106,000');
});

test('the path is in climbing order with real counts', () => {
  assert.deepEqual(programmes.map((p) => p.id), ['reading', 'safra', 'mahir', 'maqari']);
  assert.deepEqual(programmes.map((p) => p.count), [106473, 11161, 2083, 1325]);
  assert.equal(teacherTraining.count, 14309);
  assert.equal(onlineReadingGraduates, 5088);
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test test/data.test.mjs`
Expected: FAIL — `Cannot find module '…/src/data/itqaan.ts'`.

- [ ] **Step 3: Write the module** — `src/data/itqaan.ts`

```ts
/**
 * Facts about Itqaan shown on this fundraising page, in both languages.
 *
 * Every number here is Itqaan's own published figure, read from
 * app.itkan.info on 2026-09-26: the programme pages' "إحصائيات المشروع" tables
 * where they exist (reading, safra, online), otherwise the home page's graduate
 * banner (mahir, maqari, teacher training). The page never shows these raw —
 * formatCount() rounds them DOWN, so the page can only understate.
 *
 * When Itqaan publishes new totals, change the numbers here and nowhere else.
 */

export type Lang = 'ar' | 'en';
export type L10n = Record<Lang, string>;

export const DATA_SOURCE = { url: 'app.itkan.info', readOn: '2026-09-26' } as const;

/** Round down to a figure nobody can call inflated: 106,473 → 106,000. */
export function roundDown(n: number): number {
  const step = n >= 10000 ? 1000 : n >= 1000 ? 100 : 10;
  return Math.floor(n / step) * step;
}

/**
 * A number in the page's digits. 'ar-SY', NOT 'ar': in Node's ICU plain 'ar'
 * formats with Latin digits, which would mix numeral systems on the page.
 */
export function num(n: number, lang: Lang): string {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-SY' : 'en-US').format(n);
}

/** "أكثر من ١٠٦٬٠٠٠" / "More than 106,000". Written out, never as "+106K". */
export function formatCount(n: number, lang: Lang): string {
  return `${lang === 'ar' ? 'أكثر من' : 'More than'} ${num(roundDown(n), lang)}`;
}

export interface Programme {
  id: 'reading' | 'safra' | 'mahir' | 'maqari';
  count: number;
  countLabel: L10n;
  name: L10n;
  teaches: L10n;
  meta: L10n;
}

/** In the order a student climbs them. Descriptions follow Itqaan's programme pages. */
export const programmes: Programme[] = [
  {
    id: 'reading',
    count: 106473,
    countLabel: { ar: 'عدد الخرّيجين', en: 'graduates' },
    name: { ar: 'بالقراءة نحيا', en: 'Bil-Qira’ah Nahya' },
    teaches: {
      ar: 'القراءة والكتابة العربية السليمة، مع برنامج تربوي مصاحب',
      en: 'Correct Arabic reading and writing, with a character-education programme',
    },
    meta: { ar: 'من عمر ٥ سنوات · ٤–٦ أشهر', en: 'From age 5 · 4–6 months' },
  },
  {
    id: 'safra',
    count: 11161,
    countLabel: { ar: 'عدد الخرّيجين', en: 'graduates' },
    name: { ar: 'السفرة', en: 'Al-Safarah' },
    teaches: {
      ar: 'تلاوة القرآن الكريم كاملًا نظرًا مع أحكام التجويد',
      en: 'Reading the whole Qur’an from the page, with tajweed',
    },
    meta: { ar: 'خمس مراحل · سنتان إلى ثلاث سنوات', en: 'Five stages · 2–3 years' },
  },
  {
    id: 'mahir',
    count: 2083,
    countLabel: { ar: 'عدد الحفّاظ والحافظات', en: 'have memorised the Qur’an' },
    name: { ar: 'الماهر بالقرآن', en: 'Al-Mahir bil-Qur’an' },
    teaches: {
      ar: 'حفظ القرآن الكريم كاملًا غيبًا، مع برنامج شرعي وتربوي',
      en: 'Memorising the whole Qur’an, with Islamic studies',
    },
    meta: { ar: 'من عمر ١١ سنة · سنة ونصف إلى سنتين', en: 'From age 11 · 18 months to 2 years' },
  },
  {
    id: 'maqari',
    count: 1325,
    countLabel: { ar: 'عدد المُجازين والمُجازات', en: 'ijaza holders' },
    name: { ar: 'المقارئ القرآنية', en: 'Al-Maqari’ al-Qur’aniyyah' },
    teaches: {
      ar: 'إقراء القرآن بالقراءات المتواترة للحفّاظ والحافظات',
      en: 'Teaching the canonical readings to those who have memorised the Qur’an',
    },
    meta: { ar: 'سنة إلى سنة ونصف', en: '1 to 1½ years' },
  },
];

/** The chain's last link. */
export const ijazaLine: L10n = {
  ar: 'إجازةٌ بالسند المتصل إلى رسول الله ﷺ',
  en: 'An ijaza, with a chain of teachers unbroken back to the Prophet ﷺ',
};

/** Places taken in teacher-training courses — a parallel track, not a step. */
export const teacherTraining = { count: 14309 } as const;

/** بالقراءة نحيا graduates online: "إلكتروني" 4,996 + "إلكتروني سوريا" 92. */
export const onlineReadingGraduates = 4996 + 92;

export const areas: { syria: L10n[]; turkey: L10n[] } = {
  syria: [
    { ar: 'ريف دمشق', en: 'Rif Dimashq (Damascus countryside)' },
    { ar: 'حلب وأريافها', en: 'Aleppo and its countryside' },
    { ar: 'إدلب وأريافها', en: 'Idlib and its countryside' },
    { ar: 'مدينة حماة', en: 'Hama' },
  ],
  turkey: [
    { ar: 'غازي عنتاب · المركز الرئيسي', en: 'Gaziantep · headquarters' },
    { ar: 'إسطنبول', en: 'Istanbul' },
    { ar: 'كهرمان مرعش', en: 'Kahramanmaraş' },
    { ar: 'نزيب', en: 'Nizip' },
    { ar: 'كلس', en: 'Kilis' },
  ],
};

/**
 * Students' own words, from Itqaan's site. Months are Itqaan's current figures.
 * No photos: these are named young people, and a fundraising page does not
 * need their faces.
 */
export const voices: { quote: L10n; name: L10n; role: L10n; months: number }[] = [
  {
    quote: { ar: 'إتقان الجميلة اسمٌ على مسمّى', en: 'The beautiful Itqaan truly lives up to its name.' },
    name: { ar: 'يمنى شحيبر', en: 'Yumna Shehaiber' },
    role: { ar: 'طالبة', en: 'Student' },
    months: 32,
  },
  {
    quote: { ar: 'الحلقة جميلة، والأستاذ رائع', en: 'The circle is beautiful, and the teacher is wonderful.' },
    name: { ar: 'علي البلخي', en: 'Ali Al-Balkhi' },
    role: { ar: 'طالب', en: 'Student' },
    months: 55,
  },
  {
    quote: {
      ar: 'ما شاء الله عليكم، وبارك الله بكم، ونفعنا ونفع أولادنا من علمكم',
      en: 'Masha’Allah. May Allah bless you, and benefit us and our children through your knowledge.',
    },
    name: { ar: 'أحمد رواس', en: 'Ahmed Rawas' },
    role: { ar: 'طالب', en: 'Student' },
    months: 52,
  },
];
```

- [ ] **Step 4: Run the tests**

Run: `node --test test/data.test.mjs`
Expected: PASS, 5/5.

- [ ] **Step 5: Commit**

```bash
git add src/data/itqaan.ts test/data.test.mjs
git commit -m "feat(data): Itqaan's published figures and copy in one typed module

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Asset pipeline (photos, share image, video thumbnail)

**Files:**
- Move: `public/slider-{1..7}.jpg` → `brand/photos/slider-{1..7}.jpg`
- Delete: `public/avatar-*.png`
- Create: `scripts/build-assets.mjs`
- Create (generated, committed): `public/photos/{hall,lecture,teachers,classroom,women}-{800,1600}.{avif,webp}`, `public/og/itqaan.jpg`, `public/video/intro.webp`
- Modify: `package.json` (add `"assets"` script)
- Test: `test/assets.test.mjs`

**Interfaces:**
- Produces: photo names `hall | lecture | teachers | classroom | women`; files `/photos/<name>-<800|1600>.<avif|webp>` at 1600×1216 intrinsic (ratio 2000:1520); `/og/itqaan.jpg` 1200×630; `/video/intro.webp` 1280×720.

- [ ] **Step 1: Write the failing test** — `test/assets.test.mjs`

```js
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test test/assets.test.mjs`
Expected: FAIL on the first missing `photos/hall-800.avif`.

- [ ] **Step 3: Move sources, delete avatars**

```bash
mkdir -p brand/photos
git mv public/slider-1.jpg public/slider-2.jpg public/slider-3.jpg public/slider-4.jpg public/slider-5.jpg public/slider-6.jpg public/slider-7.jpg brand/photos/
git rm -q public/avatar-ahm.png public/avatar-ali.png public/avatar-hsn.png public/avatar-rf.png public/avatar-ymn.png
```

- [ ] **Step 4: Write the script** — `scripts/build-assets.mjs`

```js
// Builds the page's images from sources in brand/. Run by hand (`npm run assets`)
// when a source changes; the outputs are committed, so deploys never need sharp.
//
// The sources are Itqaan's social-media exports: each has a logo, URL and social
// icons baked into the bottom strip, and some a centre caption above it. Keeping
// the top 1520 of 2000 rows removes all of it.
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const SRC = 'brand/photos';
const CROP = { left: 0, top: 0, width: 2000, height: 1520 };

// Which source becomes which photo. slider-1 and slider-7 are close shots of
// identifiable children and are deliberately not used.
const PHOTOS = {
  hall: 'slider-2',
  lecture: 'slider-3',
  teachers: 'slider-4',
  classroom: 'slider-5',
  women: 'slider-6',
};

await mkdir('public/photos', { recursive: true });
await mkdir('public/og', { recursive: true });
await mkdir('public/video', { recursive: true });

for (const [name, src] of Object.entries(PHOTOS)) {
  const cropped = await sharp(`${SRC}/${src}.jpg`).extract(CROP).toBuffer();
  for (const w of [800, 1600]) {
    await sharp(cropped).resize(w).avif({ quality: 50 }).toFile(`public/photos/${name}-${w}.avif`);
    await sharp(cropped).resize(w).webp({ quality: 72 }).toFile(`public/photos/${name}-${w}.webp`);
  }
}

// Share image: the hall photo with the logo on a white tile. No text — the
// title comes from og:title in the right language.
const hall = await sharp(`${SRC}/slider-2.jpg`).extract(CROP).resize(1200, 630, { fit: 'cover', position: 'centre' }).toBuffer();
const logo = await sharp('public/logo.png').resize(228).toBuffer();
const tile = await sharp({ create: { width: 276, height: 170, channels: 4, background: '#ffffff' } })
  .composite([{ input: logo, left: 24, top: 24 }]).png().toBuffer();
await sharp(hall).composite([{ input: tile, left: 40, top: 40 }]).jpeg({ quality: 82 }).toFile('public/og/itqaan.jpg');

// Video poster, self-hosted so the page makes no request to YouTube until play.
const res = await fetch('https://i.ytimg.com/vi/9vrkcedB9LM/maxresdefault.jpg');
if (!res.ok) throw new Error(`thumbnail: HTTP ${res.status}`);
await sharp(Buffer.from(await res.arrayBuffer())).resize(1280, 720).webp({ quality: 72 }).toFile('public/video/intro.webp');

console.log('assets built');
```

- [ ] **Step 5: Add the script entry and run it**

In `package.json` `"scripts"` add: `"assets": "node scripts/build-assets.mjs",`

Run: `npm run assets && du -sh public/photos public/og public/video`
Expected: `assets built`, and the three folders together well under 3 MB.

- [ ] **Step 6: Look at the outputs**

Open `public/photos/hall-800.webp` and `public/og/itqaan.jpg` (Read tool). Check that no logo, URL or caption strip remains, and that the logo tile sits cleanly at the top.

- [ ] **Step 7: Run the tests**

Run: `node --test test/assets.test.mjs`
Expected: PASS, 3/3.

The live page still references `/slider-*.jpg` until Tasks 4 and 6, so `npm test` build tests may show broken images in the meantime. That's expected, and no test checks those paths yet.

- [ ] **Step 8: Commit**

```bash
git add -A brand/photos public scripts/build-assets.mjs package.json test/assets.test.mjs
git commit -m "feat(assets): crop watermarks off photos, add share image and video poster

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Design foundation (tokens, fonts, head)

**Files:**
- Rewrite: `src/styles/global.css`
- Rewrite: `src/layouts/Layout.astro`
- Create: `src/components/Picture.astro`
- Modify: `package.json` (deps)
- Test: `test/build.test.mjs` (append)

**Interfaces:**
- Produces: Tailwind colour utilities `ink, ink-deep, teal, teal-text, lime, lime-hover, paper, line, muted`; text utilities `text-step--2 … text-step-5`; font utilities `font-sans`, `font-quran`; classes `.btn-give`, `.btn-give--lg`, `.link-quiet`, `.skip-link`, `.on-dark`; `<Picture name alt sizes eager? class? />`; `<Layout lang title? description?>`.

- [ ] **Step 1: Write the failing tests** — append to `test/build.test.mjs` inside the `for (const { lang, dir, file } of pages)` loop

```js
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
```

And after the loop, append:

```js
test('built CSS keeps anchors clear of the sticky header', () => {
  const dir = new URL('../dist/_astro/', import.meta.url);
  const css = readdirSync(dir).filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(new URL(f, dir), 'utf8')).join('\n');
  assert.match(css, /scroll-margin-block-start/);
});
```

Change the import line at the top of `test/build.test.mjs` to:

```js
import { existsSync, readFileSync, readdirSync } from 'node:fs';
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm test`
Expected: the new canonical, og:image, fonts and scroll-margin tests FAIL; the old tests still pass.

- [ ] **Step 3: Install the fonts**

```bash
npm install @fontsource-variable/readex-pro@^5.3.0 @fontsource/amiri@^5.3.0
```

- [ ] **Step 4: Rewrite `src/styles/global.css`**

```css
/* FDE · shape: long document + one signature (the path as a سند chain)
 * palette: cool paper / Itqaan navy ink / lime reserved for giving
 * type: Readex Pro (Arabic expansion of Lexend, built for reading) + Amiri for Qur'an
 * critique: (stamped in Task 9) */
@import "tailwindcss";

/* ── Tier 1: primitives. Itqaan's logo colours; only functional shades derived. */
:root {
  --navy-800: oklch(34.9% 0.082 246.1);   /* logo navy #0a3d62 */
  --navy-900: oklch(27.3% 0.056 241.3);   /* #072a40 */
  --teal-500: oklch(62.3% 0.102 193.2);   /* logo teal #1a9a98 — 3.4:1 on white: never small text */
  --teal-600: oklch(52.6% 0.086 192.8);   /* #127a78 — 5.2:1 on white */
  --lime-500: oklch(75.4% 0.163 130.5);   /* logo lime #8bc34a */
  --lime-600: oklch(70.5% 0.155 131.4);   /* #7cb342 */
  --grey-50:  oklch(97.7% 0.003 197.1);   /* cool paper — deliberately not warm cream */
  --grey-200: oklch(90.7% 0.013 196.9);
  --grey-600: oklch(47.4% 0.039 234.0);   /* 6.2:1 on paper */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
}

/* ── Tier 2: semantic, exposed to Tailwind as utilities (bg-ink, text-muted…). */
@theme inline {
  --color-ink: var(--navy-800);
  --color-ink-deep: var(--navy-900);
  --color-teal: var(--teal-500);
  --color-teal-text: var(--teal-600);
  --color-lime: var(--lime-500);
  --color-lime-hover: var(--lime-600);
  --color-paper: var(--grey-50);
  --color-line: var(--grey-200);
  --color-muted: var(--grey-600);

  --font-sans: "Readex Pro Variable", "Segoe UI", Tahoma, sans-serif;
  --font-quran: "Amiri", "Traditional Arabic", serif;

  /* 1.25 scale, fluid between 360px and 1280px. */
  --text-step--2: clamp(0.75rem, 0.73rem + 0.08vw, 0.8rem);
  --text-step--1: clamp(0.875rem, 0.85rem + 0.1vw, 0.94rem);
  --text-step-0: clamp(1rem, 0.96rem + 0.2vw, 1.125rem);
  --text-step-1: clamp(1.19rem, 1.12rem + 0.33vw, 1.4rem);
  --text-step-2: clamp(1.42rem, 1.3rem + 0.55vw, 1.76rem);
  --text-step-3: clamp(1.7rem, 1.5rem + 0.9vw, 2.2rem);
  --text-step-4: clamp(2rem, 1.7rem + 1.4vw, 2.75rem);
  --text-step-5: clamp(2.3rem, 1.85rem + 2.1vw, 3.4rem);
}

/* ── Tier 3: component tokens. */
:root {
  --btn-give-bg: var(--color-lime);
  --btn-give-bg-hover: var(--color-lime-hover);
  --btn-give-fg: var(--color-ink-deep);     /* 7.1:1 on lime */
  --radius-control: 0.375rem;
  --focus-ring: var(--color-teal);
  --header-h: 4.25rem;
}

@layer base {
  html { color-scheme: light; -webkit-text-size-adjust: 100%; }
  @media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }
  body {
    font-family: var(--font-sans);
    font-size: var(--text-step-0);
    line-height: 1.8;              /* Arabic needs the room */
    color: var(--color-ink);
    background: var(--color-paper);
    font-feature-settings: "kern" 1;
  }
  :lang(en) body, body:lang(en) { line-height: 1.6; }
  h1, h2, h3 { line-height: 1.3; text-wrap: balance; font-weight: 700; }
  p { text-wrap: pretty; }
  img { max-inline-size: 100%; block-size: auto; }
  [id] { scroll-margin-block-start: calc(var(--header-h) + 1rem); }
  :focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 3px; border-radius: 2px; }
  .on-dark { --focus-ring: var(--color-lime); }
  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
  }
}

@layer components {
  .btn-give {
    display: inline-flex; align-items: center; justify-content: center;
    min-block-size: 2.75rem; padding-inline: 1.25rem;
    border-radius: var(--radius-control);
    background: var(--btn-give-bg); color: var(--btn-give-fg);
    font-weight: 700; text-decoration: none; white-space: nowrap;
    transition: background-color 150ms var(--ease-out), transform 100ms var(--ease-out);
  }
  .btn-give:hover { background: var(--btn-give-bg-hover); }
  .btn-give:active { transform: scale(0.97); }
  .btn-give--lg { min-block-size: 3.25rem; padding-inline: 1.75rem; font-size: var(--text-step-1); }

  .link-quiet {
    font-weight: 600; color: inherit;
    text-decoration: underline; text-decoration-color: var(--color-teal);
    text-decoration-thickness: 2px; text-underline-offset: 0.35em;
  }
  .link-quiet:hover { text-decoration-color: currentColor; }

  .skip-link {
    position: absolute; inset-inline-start: 1rem; inset-block-start: -10rem; z-index: 60;
    background: var(--color-ink); color: #fff; padding: 0.75rem 1rem; border-radius: var(--radius-control);
  }
  .skip-link:focus { inset-block-start: 1rem; }
}
```

Until Task 8, keep the legacy classes that the old components still use by appending this block (Task 8 deletes it):

```css
/* LEGACY — used by components deleted in Task 8. Remove with them. */
.gradient-text { color: var(--color-teal-text); }
.islamic-pattern { display: none; }
```

- [ ] **Step 5: Create `src/components/Picture.astro`**

```astro
---
/**
 * One of the cropped photos built by scripts/build-assets.mjs.
 * Intrinsic size 1600×1216 (the 2000×1520 crop), so the browser reserves the
 * right box before the image arrives.
 */
interface Props {
  name: 'hall' | 'lecture' | 'teachers' | 'classroom' | 'women';
  alt: string;
  sizes: string;
  /** Only the hero photo. It is the LCP image: eager + high priority. */
  eager?: boolean;
  class?: string;
}
const { name, alt, sizes, eager = false, class: cls } = Astro.props;
const set = (ext: string) => `/photos/${name}-800.${ext} 800w, /photos/${name}-1600.${ext} 1600w`;
---
<picture>
  <source type="image/avif" srcset={set('avif')} sizes={sizes} />
  <source type="image/webp" srcset={set('webp')} sizes={sizes} />
  <img
    src={`/photos/${name}-800.webp`}
    alt={alt}
    width="1600"
    height="1216"
    loading={eager ? 'eager' : 'lazy'}
    fetchpriority={eager ? 'high' : undefined}
    decoding="async"
    class={cls}
  />
</picture>
```

- [ ] **Step 6: Rewrite `src/layouts/Layout.astro`**

```astro
---
import '@fontsource-variable/readex-pro';
import '@fontsource/amiri/400.css';
import '@fontsource/amiri/700.css';
import '../styles/global.css';

interface Props {
  lang?: 'ar' | 'en';
  title?: string;
  description?: string;
}

const { lang = 'ar' } = Astro.props;
const isEn = lang === 'en';

const SITE = 'https://itqaan.sgi.ngo';
const self = isEn ? `${SITE}/en/` : `${SITE}/`;

// This is SGI's fundraising page for Itqaan, and the metadata says so.
const {
  title = isEn
    ? 'Support Itqaan’s Qur’an and Arabic circles in Syria and Türkiye'
    : 'ادعم حلقات مؤسسة إتقان لتعليم القرآن والعربية في سوريا وتركيا',
  description = isEn
    ? 'Itqaan teaches children to read Arabic, then walks with them to reading and memorising the Qur’an. Give through Smile Givers International (SGI), a US 501(c)(3).'
    : 'تعلّم مؤسسة إتقان الأطفال القراءة العربية السليمة، ثم ترافقهم حتى يتلوا القرآن الكريم ويحفظوه. تبرّع عبر مؤسسة سمايل جيفرز إنترناشيونال (SGI).',
} = Astro.props;

// About Itqaan itself, whose own site is itkan.info.
const schemaOrg = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: isEn ? 'Itqaan Foundation for Education and Development' : 'مؤسسة إتقان للتعليم والتنمية',
  alternateName: 'ITKAN Eğitim ve Kalkınma Derneği',
  url: 'https://itkan.info/',
  logo: `${SITE}/logo.png`,
  email: 'info@itkan.info',
  telephone: '+905378980555',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'TR',
    addressLocality: isEn ? 'Gaziantep' : 'غازي عنتاب',
  },
  sameAs: [
    'https://www.facebook.com/ITKANDERNEGI',
    'https://www.instagram.com/itkan_tr',
    'https://www.youtube.com/@ITKANDERNEGI',
    'https://t.me/s/ITKANDERNEGI',
  ],
};
---
<!doctype html>
<html lang={lang} dir={isEn ? 'ltr' : 'rtl'} style="color-scheme: light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={self} />
    <link rel="alternate" hreflang="ar" href={`${SITE}/`} />
    <link rel="alternate" hreflang="en" href={`${SITE}/en/`} />
    <link rel="alternate" hreflang="x-default" href={`${SITE}/`} />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={isEn ? 'Itqaan · SGI' : 'إتقان · SGI'} />
    <meta property="og:locale" content={isEn ? 'en_US' : 'ar_AR'} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={self} />
    <meta property="og:image" content={`${SITE}/og/itqaan.jpg`} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content={`${SITE}/og/itqaan.jpg`} />

    <link rel="icon" type="image/png" sizes="96x96" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="theme-color" content="#0a3d62" />

    <script type="application/ld+json" set:html={JSON.stringify(schemaOrg)}></script>
  </head>
  <body>
    <slot />
  </body>
</html>
```

(The previous head comment about the Infaque history is dropped. That story is kept in `src/config/donate.ts`.)

- [ ] **Step 7: Run the tests**

Run: `npm test`
Expected: all tests PASS, including the new canonical, og:image, fonts and scroll-margin tests.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json src/styles/global.css src/layouts/Layout.astro src/components/Picture.astro test/build.test.mjs
git commit -m "feat(design): token layer, self-hosted Readex Pro and Amiri, share-ready head

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Header and hero

**Files:**
- Rewrite: `src/components/Header.astro`, `src/components/Hero.astro`
- Modify: `test/build.test.mjs` (the donate-count assertion)

**Interfaces:**
- Consumes: `donateUrl(lang)` from `src/config/donate.ts`; `Picture` (Task 3).
- Produces: `<Header lang />` and `<Hero lang />`. The hero links to `#path` (Task 5).

- [ ] **Step 1: Update the test** — in `test/build.test.mjs` replace the donate-count lines with:

```js
    // Header, hero and give band. The old mobile-menu duplicate is gone with the menu.
    assert.ok(anchors.length >= 3, `expected at least 3 donate buttons, found ${anchors.length}`);
```

and add inside the page loop:

```js
  test(`${file}: exactly one h1 and one high-priority image`, () => {
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
    assert.equal((html.match(/fetchpriority="high"/g) ?? []).length, 1);
  });

  test(`${file}: skip link targets main`, () => {
    assert.match(html, /<a[^>]*class="skip-link"[^>]*href="#main"|<a[^>]*href="#main"[^>]*class="skip-link"/);
    assert.match(html, /<main[^>]*id="main"/);
  });
```

- [ ] **Step 2: Run to verify the new tests fail**

Run: `npm test`
Expected: skip-link FAILS. The h1 and priority tests may fail too (the old hero sets `fetchpriority` and the page has no `main#main`).

- [ ] **Step 3: Rewrite `src/components/Header.astro`**

```astro
---
import { donateUrl } from '../config/donate';

// A fundraising page's header: who, which language, give. No section menu —
// on a donation page every nav link is an exit (see the spec).
interface Props { lang?: 'ar' | 'en'; }
const { lang = 'ar' } = Astro.props;
const isEn = lang === 'en';

const t = isEn
  ? { home: '/en/', logoAlt: 'Itqaan Foundation', switchHref: '/', switchLang: 'ar', switchLabel: 'العربية', donate: 'Donate', skip: 'Skip to content' }
  : { home: '/', logoAlt: 'مؤسسة إتقان', switchHref: '/en/', switchLang: 'en', switchLabel: 'English', donate: 'تبرّع', skip: 'تخطَّ إلى المحتوى' };
---
<a class="skip-link" href="#main">{t.skip}</a>
<header class="sticky top-0 z-40 border-b border-line bg-white">
  <div class="mx-auto flex h-(--header-h) max-w-6xl items-center gap-3 px-4 sm:px-6">
    <a href={t.home} class="shrink-0 rounded-sm">
      <img src="/logo.png" alt={t.logoAlt} width="190" height="102" class="h-11 w-auto" />
    </a>
    <span class="flex-1"></span>
    <a
      href={t.switchHref}
      hreflang={t.switchLang}
      lang={t.switchLang}
      class="inline-flex min-h-11 items-center rounded-sm px-3 text-step--1 font-medium text-ink underline-offset-4 hover:underline"
    >{t.switchLabel}</a>
    <a href={donateUrl(lang)} data-donate-open class="btn-give">{t.donate}</a>
  </div>
</header>
```

- [ ] **Step 4: Rewrite `src/components/Hero.astro`**

```astro
---
import { donateUrl } from '../config/donate';
import Picture from './Picture.astro';

interface Props { lang?: 'ar' | 'en'; }
const { lang = 'ar' } = Astro.props;
const isEn = lang === 'en';

const t = isEn
  ? {
      kicker: 'Itqaan Foundation for Education and Development · Syria and Türkiye',
      h1a: 'We teach reading first,',
      h1b: 'then walk with each student to memorising the Qur’an',
      lead: 'Circles in mosques, centres and online, teaching correct Arabic and the reading and memorisation of the Qur’an.',
      donate: 'Donate to Itqaan’s circles',
      toPath: 'See the student’s path',
      alt: 'Boys reading the Qur’an in rows on a mosque carpet',
      caption: 'A circle at one of Itqaan’s centres',
    }
  : {
      kicker: 'مؤسسة إتقان للتعليم والتنمية · سوريا وتركيا',
      h1a: 'نعلّم القراءة أولًا،',
      h1b: 'ثم نرافق الطالب حتى يحفظ القرآن',
      lead: 'حلقاتٌ في المساجد والمراكز وعلى الإنترنت، لتعليم العربية السليمة، وتلاوة القرآن الكريم وحفظه.',
      donate: 'تبرّع لحلقات إتقان',
      toPath: 'اعرف طريق الطالب',
      alt: 'فتيان يقرؤون القرآن في صفوف على سجاد مسجد',
      caption: 'حلقة في أحد مراكز إتقان',
    };
---
<section class="grid bg-paper lg:min-h-[34rem] lg:grid-cols-[1fr_1.15fr]" aria-labelledby="hero-title">
  <div class="flex flex-col justify-center gap-5 px-4 py-10 sm:px-8 lg:px-12 lg:py-16">
    <p class="text-step--1 font-semibold text-teal-text">{t.kicker}</p>
    <h1 id="hero-title" class="text-step-5 text-ink">
      {t.h1a}<br class="hidden sm:inline" /> {t.h1b}
    </h1>
    <p class="max-w-[38ch] text-step-1 text-muted">{t.lead}</p>
    <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
      <a href={donateUrl(lang)} data-donate-open class="btn-give btn-give--lg">{t.donate}</a>
      <a href="#path" class="link-quiet">{t.toPath}</a>
    </div>
    <p class="max-w-[54ch] border-t border-line pt-3 text-step--1 text-muted">
      {isEn
        ? <>Smile Givers International (<bdi>SGI</bdi>) receives donations to this campaign and issues the receipt, on behalf of Itqaan.</>
        : <>تستقبل مؤسسة سمايل جيفرز إنترناشيونال (<bdi>SGI</bdi>) تبرعات هذه الحملة وتُصدر الإيصال، بالنيابة عن مؤسسة إتقان.</>}
    </p>
  </div>
  <figure class="relative order-first m-0 aspect-[4/3] lg:order-none lg:aspect-auto">
    <Picture name="hall" alt={t.alt} sizes="(min-width: 1024px) 55vw, 100vw" eager class="size-full object-cover" />
    <figcaption class="absolute bottom-3 start-3 rounded-sm bg-ink-deep/85 px-2.5 py-1 text-step--2 text-white">{t.caption}</figcaption>
  </figure>
</section>
```

- [ ] **Step 5: Wire both pages** — in `src/pages/index.astro` and `src/pages/en/index.astro` change `<main>` to `<main id="main">`, and remove `<StatsSection />` together with its import (the path in Task 5 replaces it). Header and Hero keep their existing imports and props (`lang="en"` on the English page).

- [ ] **Step 6: Run the tests**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 7: Look at it**

Run `npm run dev` and screenshot `/` and `/en/` at 390px and 1280px with Playwright. Check that the photo sits above the text on mobile and at the inline end on desktop, the H1 wraps cleanly, and Donate is visible in the header after scrolling.

- [ ] **Step 8: Commit**

```bash
git add src/components/Header.astro src/components/Hero.astro src/pages test/build.test.mjs
git commit -m "feat(ui): slim donor header and a split hero led by Itqaan's own photo

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: The path (signature)

**Files:**
- Create: `src/components/Path.astro`
- Modify: `src/pages/index.astro`, `src/pages/en/index.astro` (insert after `<Hero>`, remove `<Projects />` and its import)
- Test: `test/build.test.mjs`

**Interfaces:**
- Consumes: `programmes`, `ijazaLine`, `teacherTraining`, `formatCount`, `DATA_SOURCE` from `src/data/itqaan.ts`.
- Produces: `<section id="path">`; links to `#donate` (Task 8).

- [ ] **Step 1: Write the failing test** — inside the page loop

```js
  test(`${file}: the path shows the four programmes in order, rounded down`, () => {
    const path = html.match(/<section[^>]*id="path"[\s\S]*?<\/section>/)?.[0];
    assert.ok(path, 'section#path missing');
    const items = path.match(/<li\b/g) ?? [];
    assert.equal(items.length, 5, 'four programmes plus the ijaza line');
    const expected = lang === 'ar'
      ? ['أكثر من ١٠٦٬٠٠٠', 'أكثر من ١١٬٠٠٠', 'أكثر من ٢٬٠٠٠', 'أكثر من ١٬٣٠٠']
      : ['More than 106,000', 'More than 11,000', 'More than 2,000', 'More than 1,300'];
    let at = -1;
    for (const e of expected) {
      const i = path.indexOf(e);
      assert.ok(i > at, `${e} missing or out of order`);
      at = i;
    }
  });
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — `section#path missing`.

- [ ] **Step 3: Create `src/components/Path.astro`**

```astro
---
/**
 * The signature: a student's path through Itqaan, drawn as a chain (سند) —
 * one line, one node per programme, ending at the ijaza. Nodes, not shrinking
 * bars: each stage is its own longer programme with its own students, and bars
 * would read as dropout.
 */
import { programmes, ijazaLine, teacherTraining, formatCount, DATA_SOURCE } from '../data/itqaan';

interface Props { lang?: 'ar' | 'en'; }
const { lang = 'ar' } = Astro.props;
const isEn = lang === 'en';
const digit = (i: number) => new Intl.NumberFormat(isEn ? 'en-US' : 'ar-SY').format(i);

const t = isEn
  ? {
      h2: 'A long road, walked with each student one step at a time',
      intro: 'A child starts with the alphabet at five. Some continue for years, until they receive an ijaza in the Qur’an. Each stage is longer and deeper than the one before, and each has its own students.',
      source: `Graduates since each programme began, as published by Itqaan (${DATA_SOURCE.url}), rounded down.`,
      track: 'places taken in teacher-training courses, by men and women aged 18 and over who teach the next circles.',
      give: 'Help keep this road open',
    }
  : {
      h2: 'طريقٌ طويل، نقطعه مع الطالب خطوةً خطوة',
      intro: 'يبدأ الطفل بالحروف في الخامسة من عمره، ويواصل بعضهم سنواتٍ حتى يُجاز في القرآن الكريم. كل مرحلةٍ أطول وأعمق من التي قبلها، ولكلٍّ منها طلابها.',
      source: `أعداد الخرّيجين منذ انطلاق كل برنامج، كما تنشرها مؤسسة إتقان (${DATA_SOURCE.url})، مقرّبةً إلى الأدنى.`,
      track: 'مشاركة في دورات تأهيل الكوادر التعليمية، لمعلّمين ومعلّمات من عمر ١٨ سنة فما فوق، يدرّسون الحلقات القادمة.',
      give: 'ساهم في إبقاء هذا الطريق مفتوحًا',
    };
---
<section id="path" class="border-y border-line bg-white" aria-labelledby="path-title">
  <div class="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_2fr] lg:gap-14 lg:py-20">
    <div>
      <h2 id="path-title" class="text-step-3">{t.h2}</h2>
      <p class="mt-4 max-w-[42ch] text-muted">{t.intro}</p>
      <p class="mt-4 text-step--1 text-muted">{t.source}</p>
    </div>

    <div>
      <ol class="chain">
        {programmes.map((p, i) => (
          <li class="chain-step">
            <span class="chain-dot" aria-hidden="true">{digit(i + 1)}</span>
            <p class="chain-count">
              <span class="block text-step--2 font-normal text-muted">{p.countLabel[lang]}</span>
              {formatCount(p.count, lang)}
            </p>
            <div>
              <h3 class="text-step-1">{p.name[lang]}</h3>
              <p class="text-step--1 text-muted">{p.teaches[lang]}</p>
              <p class="text-step--1 text-teal-text">{p.meta[lang]}</p>
            </div>
          </li>
        ))}
        <li class="chain-step chain-end">
          <span class="chain-dot" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </span>
          <p class="chain-ijaza font-quran">{ijazaLine[lang]}</p>
        </li>
      </ol>

      <p class="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-md bg-paper px-4 py-3 text-step--1">
        <strong class="text-step-2 font-semibold tabular-nums">{formatCount(teacherTraining.count, lang)}</strong>
        <span>{t.track}</span>
      </p>

      <p class="mt-6"><a href="#donate" class="link-quiet">{t.give}</a></p>
    </div>
  </div>
</section>

<style>
  .chain { list-style: none; margin: 0; padding: 0; position: relative; }
  /* The سند itself: one continuous line through every node. */
  .chain::before {
    content: '';
    position: absolute;
    inset-inline-start: calc(0.875rem - 1px);
    inset-block: 1.5rem 1.75rem;
    inline-size: 2px;
    background: var(--color-teal);
  }
  .chain-step {
    display: grid;
    grid-template-columns: 1.75rem 1fr;
    column-gap: 1rem;
    row-gap: 0.25rem;
    align-items: start;
    padding-block: 1rem;
    border-block-end: 1px dashed var(--color-line);
  }
  .chain-step > div { grid-column: 2; }
  .chain-dot {
    position: relative; z-index: 1;
    display: grid; place-items: center;
    inline-size: 1.75rem; block-size: 1.75rem;
    border-radius: 50%;
    border: 2px solid var(--color-teal);
    background: #fff;
    color: var(--color-teal-text);
    font-size: var(--text-step--2);
    font-weight: 700;
  }
  .chain-count {
    margin: 0;
    font-size: var(--text-step-2);
    font-weight: 600;
    line-height: 1.2;
    font-variant-numeric: tabular-nums;
  }
  .chain-end { border-block-end: 0; align-items: center; }
  .chain-end .chain-dot { background: var(--color-lime); border-color: var(--color-lime); color: var(--color-ink-deep); }
  .chain-ijaza { margin: 0; font-size: var(--text-step-2); font-weight: 700; line-height: 1.5; }

  /* From 40rem the count gets its own column: dot · count · programme. */
  @media (min-width: 40rem) {
    .chain-step { grid-template-columns: 1.75rem 11rem 1fr; align-items: baseline; }
    .chain-step > div { grid-column: 3; }
    .chain-dot { align-self: center; }
    .chain-end .chain-ijaza { grid-column: 2 / -1; }
  }
</style>
```

- [ ] **Step 4: Wire both pages** — import `Path from '../components/Path.astro'` (`'../../components/Path.astro'` in `en/`), place `<Path />` / `<Path lang="en" />` directly after the Hero, and remove `<Projects />` and its import.

- [ ] **Step 5: Run the tests**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 6: Look at it**

Screenshot `#path` at 390px and 1280px in both languages. Check that the line passes through every dot's centre, the lime node closes it, the numbers are Arabic-Indic on `/`, and nothing wraps awkwardly in the count column.

- [ ] **Step 7: Commit**

```bash
git add src/components/Path.astro src/pages test/build.test.mjs
git commit -m "feat(ui): the student's path as a sanad chain, from Itqaan's published figures

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Where Itqaan teaches, voices, photos

**Files:**
- Rewrite: `src/components/Areas.astro`
- Create: `src/components/Voices.astro`, `src/components/Gallery.astro`
- Modify: both pages (replace `<ImageSlider client:visible …>` and `<Testimonials client:visible …>` with `<Voices>` and `<Gallery>`; order: Path → Areas → Voices → Gallery)
- Test: `test/build.test.mjs`

**Interfaces:**
- Consumes: `areas`, `voices`, `onlineReadingGraduates`, `formatCount`, `num` (Task 1); `Picture` (Task 3).
- Produces: `section#areas`, `section#voices`, `section#photos`.

- [ ] **Step 1: Write the failing test** — inside the page loop

```js
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
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm test`
Expected: FAIL — the old testimonial renders `avatar-` images and `section#voices` is missing.

- [ ] **Step 3: Rewrite `src/components/Areas.astro`**

```astro
---
import { areas, onlineReadingGraduates, formatCount, num } from '../data/itqaan';

interface Props { lang?: 'ar' | 'en'; }
const { lang = 'ar' } = Astro.props;
const isEn = lang === 'en';

const t = isEn
  ? {
      h2: 'Where Itqaan teaches',
      syria: 'Syria', syriaCount: `${num(areas.syria.length, lang)} areas`,
      turkey: 'Türkiye', turkeyCount: `${num(areas.turkey.length, lang)} cities`,
      online: 'Online centre', onlineCount: 'worldwide',
      onlineItems: ['Online circles for students anywhere in the world', `${formatCount(onlineReadingGraduates, lang)} online graduates of Bil-Qira’ah Nahya`],
    }
  : {
      h2: 'أين تعلّم إتقان',
      syria: 'سوريا', syriaCount: `${num(areas.syria.length, lang)} مناطق`,
      turkey: 'تركيا', turkeyCount: `${num(areas.turkey.length, lang)} مدن`,
      online: 'المركز الإلكتروني', onlineCount: 'عالميًا',
      onlineItems: ['حلقات عبر الإنترنت لطلاب من أنحاء العالم', `${formatCount(onlineReadingGraduates, lang)} خرّيج في «بالقراءة نحيا» عبر الإنترنت`],
    };

const columns = [
  { title: t.syria, count: t.syriaCount, items: areas.syria.map((a) => a[lang]) },
  { title: t.turkey, count: t.turkeyCount, items: areas.turkey.map((a) => a[lang]) },
  { title: t.online, count: t.onlineCount, items: t.onlineItems },
];
---
<section id="areas" aria-labelledby="areas-title">
  <div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
    <h2 id="areas-title" class="text-step-3">{t.h2}</h2>
    <div class="mt-8 grid gap-8 md:grid-cols-3">
      {columns.map((c) => (
        <div>
          <h3 class="flex items-baseline justify-between border-b-2 border-ink pb-2 text-step-1">
            {c.title}<span class="text-step--1 font-normal text-muted">{c.count}</span>
          </h3>
          <ul class="m-0 list-none p-0">
            {c.items.map((item) => <li class="border-b border-line py-2">{item}</li>)}
          </ul>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 4: Create `src/components/Voices.astro`**

```astro
---
import { voices, num } from '../data/itqaan';

interface Props { lang?: 'ar' | 'en'; }
const { lang = 'ar' } = Astro.props;
const isEn = lang === 'en';
const h2 = isEn ? 'In their students’ words' : 'بكلمات طلابها';
const months = (m: number) => (isEn ? `${m} months at Itqaan` : `${num(m, lang)} شهرًا في إتقان`);
---
<section id="voices" class="border-y border-line bg-white" aria-labelledby="voices-title">
  <div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
    <h2 id="voices-title" class="text-step-3">{h2}</h2>
    <div class="mt-8 grid gap-8 md:grid-cols-3">
      {voices.map((v) => (
        <figure class="m-0 border-s-2 border-teal ps-5">
          <blockquote class="m-0 text-step-1 font-medium leading-relaxed">
            <p>{isEn ? `“${v.quote.en}”` : `«${v.quote.ar}»`}</p>
          </blockquote>
          <figcaption class="mt-3 text-step--1 text-muted">
            <span class="font-semibold text-ink">{v.name[lang]}</span> · {v.role[lang]} · {months(v.months)}
          </figcaption>
        </figure>
      ))}
    </div>
  </div>
</section>
```

The teal inline-start rule on each quote carries meaning (it marks a quotation), so it isn't the decorative card-edge stripe the design references forbid.

- [ ] **Step 5: Create `src/components/Gallery.astro`**

```astro
---
import Picture from './Picture.astro';

interface Props { lang?: 'ar' | 'en'; }
const { lang = 'ar' } = Astro.props;
const isEn = lang === 'en';

const h2 = isEn ? 'Inside the circles' : 'من داخل الحلقات';
const photos = [
  { name: 'lecture', alt: isEn ? 'Young men at a lesson with a projector in a mosque' : 'شباب في درس أمام شاشة عرض داخل مسجد' },
  { name: 'women', alt: isEn ? 'Women and girls reading the Qur’an on wooden stands in a women’s circle' : 'نساء وفتيات يقرأن القرآن على الرحلات في حلقة نسائية' },
  { name: 'classroom', alt: isEn ? 'Children writing at desks in a learning centre' : 'أطفال يكتبون على طاولات في مركز تعليمي' },
  { name: 'teachers', alt: isEn ? 'Adult men in a classroom during a course' : 'رجال في قاعة دراسية خلال دورة' },
] as const;
---
<section id="photos" aria-labelledby="photos-title">
  <div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
    <h2 id="photos-title" class="text-step-3">{h2}</h2>
    <div class="mt-8 grid grid-cols-2 gap-2 md:grid-cols-4 md:grid-rows-2">
      {photos.map((p, i) => (
        <figure class:list={['m-0 overflow-hidden rounded-md', i === 0 && 'col-span-2 md:row-span-2']}>
          <Picture
            name={p.name}
            alt={p.alt}
            sizes={i === 0 ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 25vw, 50vw'}
            class="size-full object-cover"
          />
        </figure>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 6: Wire both pages** — import `Voices` and `Gallery`, place `<Areas />`, `<Voices />`, `<Gallery />` after `<Path />` (with `lang="en"` on the English page), remove `ImageSlider` and `Testimonials` and their imports, and move `<Areas />` to sit directly after `<Path />`.

- [ ] **Step 7: Run the tests**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/Areas.astro src/components/Voices.astro src/components/Gallery.astro src/pages test/build.test.mjs
git commit -m "feat(ui): where Itqaan teaches, students' words, and a static photo grid

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Film (YouTube facade)

**Files:**
- Create: `src/components/Film.astro`
- Modify: both pages (replace `<VideoSection>` with `<Film>` after `<Gallery>`)
- Test: `test/build.test.mjs`

**Interfaces:**
- Consumes: `/video/intro.webp` (Task 2).
- Produces: `section#film`.

- [ ] **Step 1: Write the failing test** — inside the page loop

```js
  test(`${file}: the film is a real link until clicked`, () => {
    const film = html.match(/<section[^>]*id="film"[\s\S]*?<\/section>/)?.[0];
    assert.ok(film, 'section#film missing');
    assert.match(film, /<a[^>]*href="https:\/\/www\.youtube\.com\/watch\?v=9vrkcedB9LM"/);
    assert.doesNotMatch(film, /<iframe/, 'no YouTube request before a click');
  });
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — `section#film missing`.

- [ ] **Step 3: Create `src/components/Film.astro`**

```astro
---
// Itqaan's introductory film. A poster that is a plain link to YouTube; with
// JavaScript, a click swaps in the player. Nothing is fetched from YouTube
// before that click.
interface Props { lang?: 'ar' | 'en'; }
const { lang = 'ar' } = Astro.props;
const isEn = lang === 'en';
const id = '9vrkcedB9LM';

const t = isEn
  ? { h2: 'Itqaan’s introductory film', play: 'Play Itqaan’s introductory film', frame: 'Itqaan introductory film' }
  : { h2: 'فيلم تعريفي بمؤسسة إتقان', play: 'شغّل الفيلم التعريفي بمؤسسة إتقان', frame: 'الفيلم التعريفي بمؤسسة إتقان' };
---
<section id="film" class="bg-white" aria-labelledby="film-title">
  <div class="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:py-16">
    <h2 id="film-title" class="text-step-3">{t.h2}</h2>
    <div class="mt-8 aspect-video overflow-hidden rounded-md bg-ink-deep" data-film-box>
      <a
        href={`https://www.youtube.com/watch?v=${id}`}
        class="group relative block size-full"
        data-film={id}
        data-film-title={t.frame}
        aria-label={t.play}
      >
        <img src="/video/intro.webp" alt="" width="1280" height="720" loading="lazy" decoding="async" class="size-full object-cover" />
        <span class="absolute inset-0 grid place-items-center" aria-hidden="true">
          <span class="grid size-18 place-items-center rounded-full bg-white/95 text-ink shadow-lg transition-transform duration-150 group-hover:scale-105">
            <svg viewBox="0 0 24 24" width="28" height="28"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
          </span>
        </span>
      </a>
    </div>
  </div>
</section>

<script>
  document.querySelectorAll<HTMLAnchorElement>('[data-film]').forEach((link) => {
    link.addEventListener('click', (event) => {
      // Modified clicks keep their meaning: open YouTube in a new tab.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      const frame = document.createElement('iframe');
      frame.src = `https://www.youtube-nocookie.com/embed/${link.dataset.film}?autoplay=1&rel=0`;
      frame.title = link.dataset.filmTitle ?? '';
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      frame.allowFullscreen = true;
      frame.className = 'size-full border-0';
      link.replaceWith(frame);
      frame.focus();
    });
  });
</script>
```

- [ ] **Step 4: Wire both pages** — import `Film`, place `<Film />` after `<Gallery />`, and remove `<VideoSection />` and its import.

- [ ] **Step 5: Run the tests**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 6: Check the click in a browser**

With `npm run dev`, click the poster in Playwright. Expect an `iframe[src*="youtube-nocookie.com/embed/9vrkcedB9LM"]`. Before the click, expect no request to `youtube.com` or `ytimg.com` (check the network request list).

- [ ] **Step 7: Commit**

```bash
git add src/components/Film.astro src/pages test/build.test.mjs
git commit -m "feat(ui): introductory film behind a click-to-load poster

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Give, about, footer; remove the old site

**Files:**
- Create: `src/components/Give.astro`, `src/components/AboutBrief.astro`
- Rewrite: `src/components/Footer.astro`, `src/pages/index.astro`, `src/pages/en/index.astro`
- Delete: `src/components/{About,Objectives,Projects,StatsSection,Contact,SocialLinks,DonationSection,VideoSection}.astro`, `src/components/{ImageSlider,Testimonials}.jsx`
- Modify: `astro.config.mjs`, `tsconfig.json`, `package.json` (remove React), `src/styles/global.css` (remove the LEGACY block)
- Test: `test/build.test.mjs`

**Interfaces:**
- Consumes: `donateUrl` (config); everything above.
- Produces: `section#donate`, `section#about`; final section order `path, areas, voices, photos, film, donate, about`.

- [ ] **Step 1: Write the failing tests** — inside the page loop

```js
  test(`${file}: sections in the agreed order`, () => {
    const ids = [...html.matchAll(/<section[^>]*\bid="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(ids, ['path', 'areas', 'voices', 'photos', 'film', 'donate', 'about']);
  });

  test(`${file}: no React left in the page`, () => {
    assert.doesNotMatch(html, /astro-island|client:(visible|load|idle)/);
  });

  test(`${file}: outbound links stay on the allowlist`, () => {
    const allowed = /^(https:\/\/(sgi\.ngo|itkan\.info|www\.youtube\.com\/watch|wa\.me)\b|mailto:)/;
    const hrefs = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map((m) => m[1])
      .filter((h) => /^(https?:|mailto:)/.test(h));
    for (const h of hrefs) assert.match(h, allowed, `unexpected outbound link: ${h}`);
  });

  test(`${file}: Latin names inside Arabic are isolated`, () => {
    if (lang !== 'ar') return;
    const body = html.slice(html.indexOf('<body'));
    // Strip bdi contents, attributes and URLs; any SGI or 501(c)(3) left is un-isolated.
    const bare = body.replace(/<bdi\b[^>]*>[\s\S]*?<\/bdi>/g, '').replace(/<[^>]+>/g, ' ');
    assert.doesNotMatch(bare, /\bSGI\b|501\(c\)\(3\)/);
  });

  test(`${file}: the give band keeps the SGI disclosure`, () => {
    const give = html.match(/<section[^>]*id="donate"[\s\S]*?<\/section>/)?.[0] ?? '';
    assert.match(give, /data-donate-open/);
    assert.match(give, /501\(c\)\(3\)/);
  });
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm test`
Expected: FAIL — section order (old sections still present), outbound links (facebook/instagram), bdi (old footer and contact).

- [ ] **Step 3: Create `src/components/Give.astro`**

```astro
---
import { donateUrl } from '../config/donate';

interface Props { lang?: 'ar' | 'en'; }
const { lang = 'ar' } = Astro.props;
const isEn = lang === 'en';

const t = isEn
  ? {
      h2: 'Your gift keeps a circle open, and a teacher in front of their students',
      p: 'Gifts to this campaign support Itqaan’s education programmes in Syria and Türkiye.',
      donate: 'Donate to Itqaan’s circles',
      whoTitle: 'Who receives your gift',
    }
  : {
      h2: 'تبرّعك يُبقي الحلقة مفتوحة، والمعلّمَ أمام طلابه',
      p: 'تدعم تبرعات هذه الحملة برامج مؤسسة إتقان التعليمية في سوريا وتركيا.',
      donate: 'تبرّع لحلقات إتقان',
      whoTitle: 'من يستلم تبرعك',
    };
---
<section id="donate" class="on-dark bg-ink text-white" aria-labelledby="donate-title">
  <div class="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:py-20">
    <div>
      <h2 id="donate-title" class="text-step-4">{t.h2}</h2>
      <p class="mt-4 max-w-[46ch] text-step-1 text-white/85">{t.p}</p>
    </div>
    <div class="rounded-md border border-white/20 bg-white/5 p-5">
      <a href={donateUrl(lang)} data-donate-open class="btn-give btn-give--lg w-full">{t.donate}</a>
      <h3 class="mt-5 text-step-0">{t.whoTitle}</h3>
      <p class="mt-1 text-step--1 text-white/85">
        {isEn
          ? <>Smile Givers International (<bdi>SGI</bdi>), a registered US <bdi>501(c)(3)</bdi>, receives donations to this campaign on behalf of Itqaan, and issues your receipt.</>
          : <>تستقبل مؤسسة سمايل جيفرز إنترناشيونال (<bdi>SGI</bdi>) تبرعات هذه الحملة بالنيابة عن مؤسسة إتقان، وتُصدر إيصال تبرعك. وهي مؤسسة خيرية مسجّلة في الولايات المتحدة بموجب البند <bdi>501(c)(3)</bdi>.</>}
      </p>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Create `src/components/AboutBrief.astro`**

```astro
---
// Just enough for a donor who wants to check who Itqaan is. Everything else —
// enrolment, courses, apps, the full profile — lives on Itqaan's own site.
interface Props { lang?: 'ar' | 'en'; }
const { lang = 'ar' } = Astro.props;
const isEn = lang === 'en';

const t = isEn
  ? {
      h2: 'About Itqaan',
      mission: 'An educational foundation teaching correct Arabic and the accurate reading and memorisation of the Qur’an, and raising students on its values, to bring up an aware generation that helps its community rise.',
      reg: <>A licensed foundation in Syria and Türkiye, registered in Türkiye as <bdi lang="tr">ITKAN Eğitim ve Kalkınma Derneği</bdi>, with its headquarters in Kartaş, Gaziantep.</>,
      more: 'To enrol, or for courses, apps and publications:',
      link: 'Itqaan’s website',
    }
  : {
      h2: 'عن مؤسسة إتقان',
      mission: 'مؤسسة تعليمية تهتم بتعليم العربية السليمة، وضبط القرآن الكريم وحفظه، والتربية على قيمه ومبادئه؛ لإخراج جيلٍ واعٍ يسهم في نهضة المجتمع ورقيّه.',
      reg: <>مؤسسة مرخّصة في سوريا وتركيا، مسجّلة في تركيا باسم <bdi lang="tr">ITKAN Eğitim ve Kalkınma Derneği</bdi>، ومركزها الرئيسي في غازي عنتاب، حي كرتاش.</>,
      more: 'للتسجيل في الحلقات، وللاطلاع على الدورات والتطبيقات والمطبوعات:',
      link: 'موقع مؤسسة إتقان',
    };
---
<section id="about" aria-labelledby="about-title">
  <div class="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-16">
    <h2 id="about-title" class="text-step-2">{t.h2}</h2>
    <p class="mt-4">{t.mission}</p>
    <p class="mt-3 text-muted">{t.reg}</p>
    <p class="mt-5">{t.more} <a href="https://itkan.info/" class="link-quiet">{t.link}</a></p>
  </div>
</section>
```

- [ ] **Step 5: Rewrite `src/components/Footer.astro`**

```astro
---
interface Props { lang?: 'ar' | 'en'; }
const { lang = 'ar' } = Astro.props;
const isEn = lang === 'en';
const year = new Intl.NumberFormat(isEn ? 'en-US' : 'ar-SY', { useGrouping: false }).format(new Date().getFullYear());

const t = isEn
  ? { rights: `© ${year} Itqaan Foundation for Education and Development`, circles: 'Questions about the circles:', giving: 'Questions about your donation or receipt:' }
  : { rights: `© ${year} مؤسسة إتقان للتعليم والتنمية`, circles: 'أسئلة عن الحلقات:', giving: 'أسئلة عن تبرعك أو إيصالك:' };
---
<footer class="on-dark bg-ink-deep text-step--1 text-white/85">
  <div class="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:px-6 md:flex-row md:flex-wrap md:items-center md:justify-between">
    <p>{t.rights}</p>
    <p>
      {t.circles}{' '}
      <a href="https://wa.me/905378980555" class="underline underline-offset-4 hover:text-white"><bdi dir="ltr">+90 537 898 05 55</bdi></a>
      {' · '}
      <a href="mailto:info@itkan.info" class="underline underline-offset-4 hover:text-white"><bdi>info@itkan.info</bdi></a>
    </p>
    <p>{t.giving} <a href="https://sgi.ngo/" class="underline underline-offset-4 hover:text-white"><bdi>sgi.ngo</bdi></a></p>
  </div>
</footer>
```

- [ ] **Step 6: Rewrite the pages**

`src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import Hero from '../components/Hero.astro';
import Path from '../components/Path.astro';
import Areas from '../components/Areas.astro';
import Voices from '../components/Voices.astro';
import Gallery from '../components/Gallery.astro';
import Film from '../components/Film.astro';
import Give from '../components/Give.astro';
import AboutBrief from '../components/AboutBrief.astro';
import Footer from '../components/Footer.astro';
import DonateModal from '../components/DonateModal.astro';
---
<Layout lang="ar">
  <Header lang="ar" />
  <main id="main">
    <Hero lang="ar" />
    <Path lang="ar" />
    <Areas lang="ar" />
    <Voices lang="ar" />
    <Gallery lang="ar" />
    <Film lang="ar" />
    <Give lang="ar" />
    <AboutBrief lang="ar" />
  </main>
  <Footer lang="ar" />
  <DonateModal lang="ar" />
</Layout>
```

`src/pages/en/index.astro`: identical, with `'../../layouts/…'` and `'../../components/…'` imports and `lang="en"` on every component.

- [ ] **Step 7: Delete the old components and React**

```bash
git rm -q src/components/About.astro src/components/Objectives.astro src/components/Projects.astro src/components/StatsSection.astro src/components/Contact.astro src/components/SocialLinks.astro src/components/DonationSection.astro src/components/VideoSection.astro src/components/ImageSlider.jsx src/components/Testimonials.jsx
npm uninstall @astrojs/react react react-dom @types/react @types/react-dom
```

`astro.config.mjs` — remove the `react` import and the `integrations: [react()],` line.

`tsconfig.json` — remove the `"compilerOptions"` block (`jsx`, `jsxImportSource`), which only served React.

`src/styles/global.css` — delete the `/* LEGACY … */` block.

- [ ] **Step 8: Run the tests**

Run: `npm test`
Expected: all PASS. `grep -r "react" dist/ | head` prints nothing.

- [ ] **Step 9: Commit**

```bash
git add -A src astro.config.mjs tsconfig.json package.json package-lock.json test/build.test.mjs
git commit -m "feat(ui): give band, brief about, quiet footer; remove the old sections and React

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Copy review, visual QA, docs, preview

**Files:**
- Modify: copy inside components if the reviews find issues; `CLAUDE.md`; `README.md`; `src/styles/global.css` (critique stamp)
- Test: Playwright checks (not committed)

- [ ] **Step 1: Arabic copy review.** Invoke the `arabic-writing` skill. Review every Arabic string in `src/data/itqaan.ts` and `src/components/*.astro` for agreement, number–noun agreement, punctuation («» and the Arabic comma), register (accessible fuṣḥā) and bidi. Apply fixes in place.

- [ ] **Step 2: Donor copy review.** Invoke the `ngo-communications` skill. Review the hero, give band, meta description and the SGI/501(c)(3) wording in both languages. In particular, make no tax-deductibility claim beyond "a registered US 501(c)(3)", and promise nothing about where each dollar goes. Apply fixes.

- [ ] **Step 3: Visual QA with Playwright.** `npm run build && npm run preview`. For each of `/` and `/en/`, at widths 320, 390 and 1280:
  - screenshot the full page and look at it: spacing, hierarchy, the chain alignment, no clipped text;
  - run `document.documentElement.scrollWidth <= window.innerWidth` and expect `true` (no horizontal scroll);
  - press Tab from the top and confirm the skip link appears first, then logo, language, Donate, and that focus rings are visible on the navy bands;
  - click a Donate button and confirm the SGI modal opens (existing behaviour).
  Fix anything found, re-run `npm test`.

- [ ] **Step 4: Self-critique and stamp.** Score Philosophy, Hierarchy, Execution, Specificity, Restraint and Variety 1–5 from the screenshots. Any axis below 3 gets a revision pass first. Replace the `critique:` line at the top of `global.css` with the scores, e.g. `* critique P4 H4 E4 S5 R5 V5`.

- [ ] **Step 5: Docs.** Append to `CLAUDE.md` under a new `## Scope` heading, placed first after the intro:

```markdown
## Scope

- This is SGI's **fundraising page** for Itqaan, not Itqaan's website (that is itkan.info).
  Every section must build donor trust or ask for the gift. Enrolment, courses and the full
  profile link to itkan.info.
- Facts and numbers live in `src/data/itqaan.ts`, sourced from app.itkan.info, and are always
  rounded down. Update them there only.
- Photos: sources in `brand/photos/`, built by `npm run assets` into `public/photos/`.
  Never show a centre name next to photos of children.
```

In `README.md`, add the row `| npm run assets | Rebuild cropped photos, share image and video poster |` to the commands table, and update the Layout block (the `brand/` line now covers `brand/photos/`, and add `src/data/itqaan.ts`).

- [ ] **Step 6: Commit and preview**

```bash
git add -A src CLAUDE.md README.md
git commit -m "docs, polish: copy review, visual QA fixes, fundraising scope in CLAUDE.md

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -u origin feat/redesign-path
```

Wait for the Cloudflare branch build (`gh api repos/kutaibashi/itqaan-sgi/commits/<sha>/check-runs`), open the preview URL from its log, and repeat the 390px and 1280px screenshots there.
