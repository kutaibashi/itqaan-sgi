# Itqaan landing page redesign: "The Path" (المسار)

Date: 2026-09-26 · Status: awaiting review

## Intent

- **What this page is:** SGI's **fundraising page** for the Itqaan campaign, at itqaan.sgi.ngo,
  in Arabic (`/`, right-to-left, default) and English (`/en/`). It is **not** Itqaan's website
  and doesn't replace it. Itqaan's own site (itkan.info / app.itkan.info) stays the place for
  enrolment, courses, apps, publications and the full organisation profile. This page links
  there once, clearly, and otherwise stays on its one job.
- **The one job:** turn a visitor into a donor. Every section either builds trust (the work is
  real, measured and long-running, and the receiving organisation is accountable) or asks for the
  gift. Anything that doesn't do one of those is cut.
- **Audience:** donors only. That means Arabic-speaking donors in the Gulf, Türkiye and the
  diaspora, plus English readers who reach the page through SGI's campaign. Families looking for
  classes are pointed to Itqaan's site, not served here.
- **Success:** within one screen a donor knows who Itqaan is, that the work is real, who receives
  the money, and how to give. The page no longer reads as a template, and every fact on it
  matches what Itqaan publishes about itself.

### Decisions already made

| Decision | Choice | Source |
|---|---|---|
| Audience | Donors first | User |
| Photos | Crop the 7 existing photos; children never close-up in the hero or large crops | User |
| Numbers and content | Take from Itqaan's own site, app.itkan.info | User |
| Direction | A, "The Path", refined into a chain (سند) | User delegated; chosen after re-review |

## Design direction

**Macrostructure: long document with one signature section.** A left-to-right reading order in
English and right-to-left in Arabic. No centred-everything, no badge above every heading, no
icon-card grids, no carousels.

**Signature element: the path as a chain.** One vertical line with four nodes, each an Itqaan
programme in the order a student climbs them, ending at a lime node: «إجازةٌ بالسند المتصل إلى
رسول الله ﷺ». Each node shows the graduate count (rounded down, written as «أكثر من …»), the
programme name, what it teaches, the age and the duration. The shape comes from how a sanad is
traced, which is Itqaan's own world. It avoids shrinking bars, which would wrongly suggest
dropout. Teacher training sits beside the chain as a parallel track, not a fifth step.

**What stays quiet:** everything else. Hairline rules and plain lists. One photo in the hero and
one small photo grid. Lime appears only on donate buttons and the chain's final node.

### Tokens (3 tiers, in `src/styles/global.css` via Tailwind 4 `@theme`)

Brand colours are locked to the logo. Only functional shades are derived.

| Role | Value | Use |
|---|---|---|
| `--ink` | navy `#0a3d62` | text, headings, dark bands |
| `--ink-deep` | `#072a40` | footer, text on lime |
| `--teal` | `#1a9a98` (logo) | chain line, rules, focus ring. Not used for small text (3.4:1 on white) |
| `--teal-text` | `#127a78` | small teal text (≥ 4.5:1 on white and paper) |
| `--lime` | `#8bc34a` (logo) | donate buttons only (navy on lime is 6.9:1) |
| `--paper` | cool off-white `#f5f8f8` | page background (deliberately not warm cream) |
| `--line` | `#d7e3e3` | hairlines |
| `--muted` | `#46606f` | secondary text (≥ 4.5:1 on paper) |

The primitive values are converted to OKLCH, and components use only the semantic names.
Spacing uses a 4px scale. Card radius is at most 8px.

### Type

- **Readex Pro** (variable, Arabic and Latin, harmonised weights) for everything. It is the
  Arabic expansion of Lexend, a typeface built and tested for reading proficiency, which suits a
  foundation whose first programme teaches reading. Self-hosted via
  `@fontsource-variable/readex-pro`.
- **Amiri** (already on the site) only for Qur'an and hadith text and the chain's final line.
  Self-hosted via `@fontsource/amiri`.
- Replaces Tajawal, Poppins, and Amiri used as a heading font. This removes Google Fonts from
  `<head>` entirely.
- Fluid type scale with `clamp()` at a 1.25 ratio. Arabic body line-height is about 1.8, English
  about 1.6. No letter-spacing on Arabic. `text-wrap: balance` on headings.

## Page structure

Both languages share the same sections in the same order. Sections marked * are new or rebuilt
from scratch.

1. **Header.** Slim: logo, language switch, Donate. No section menu, since a fundraising page is
   read top to bottom and a nav mostly offers exits. That also removes the mobile menu and its
   JavaScript. Skip link to `<main>`. On mobile, once the hero's Donate button scrolls out of
   view, the header's Donate button stays visible (the header is sticky and short).
2. **Hero\*.** A split layout: text at the inline start, photo at the inline end. The kicker
   gives the name and "Syria · Türkiye". The H1 is «نعلّم القراءة أولًا، ثم نرافق الطالب حتى يحفظ
   القرآن» (English: "We teach reading first, then walk with each student to memorising the
   Qur'an"). Then one lead sentence, the Donate button (primary, lime), a text link to the path,
   and the SGI disclosure line. The photo is `slider-2` (a wide mosque hall where the children are
   small), cropped, with a generic caption («حلقة في أحد مراكز إتقان»). Centre names are never shown next to photos of children, `fetchpriority="high"`, and width and height set.
3. **The path\*** (signature, `id="path"`). An intro column plus an `<ol>` chain with 4 stages and
   the ijaza line. A source note: «أعداد الخرّيجين منذ التأسيس، كما تنشرها المؤسسة». Teacher
   training appears as a track beneath it.
4. **Where we work\*** (`id="areas"`). Three columns: Syria (4 areas), Türkiye (5 cities, with
   Gaziantep marked as headquarters), and Online. Plain lists, with one real figure for online
   (more than 5,000 online graduates in بالقراءة نحيا: 4,996 + 92). No emoji, no orbs.
5. **Voices\*.** Three real student quotes, static, set in a row on desktop and stacked on mobile.
   Months of study are updated to Itqaan's current figures. Replaces the auto-rotating React
   testimonial.
6. **Photos\*.** Four cropped photos in a fixed asymmetric grid with real `alt` text and lazy
   loading. Replaces the auto-advancing React slider.
7. **Video\*.** A YouTube facade that shows a self-hosted thumbnail (downloaded once into `public/`,
   so nothing is fetched from YouTube before a click) and play button and loads the iframe only
   on click. It's the introductory film, which is proof of the work, not a channel promotion. The
   "subscribe" button is dropped.
8. **Give\*** (`id="donate"`). A dark navy band with one sentence on why to give, the Donate
   button, and a short "who receives your gift" block: SGI, US 501(c)(3), issues the receipt, on
   behalf of Itqaan. Replaces DonationSection. The disclosure must stay visible (see CLAUDE.md).
9. **About Itqaan, briefly\*** (`id="about"`). Two or three lines: the mission sentence, founded
   and registered in Türkiye (ITKAN Eğitim ve Kalkınma Derneği), headquarters in Gaziantep. Then
   one clear link, «موقع مؤسسة إتقان» → itkan.info, for enrolment, courses and everything else.
   The full vision, values and goals stay on Itqaan's site.
10. **Footer.** SGI and Itqaan names, a question line (WhatsApp and email for Itqaan's programmes;
    a link to sgi.ngo for donation and receipt questions) and the Itqaan site link. No social
    icons: each one is an exit, and fundraising-page research says to remove them (iDonate: 195%
    more conversions with the site header removed). One row, quiet.

**Removed:** StatsSection (its round numbers are replaced by the path), the header section menu
and mobile menu, the About and Objectives sections (reduced to section 9), the Contact section
(reduced to the footer line), the YouTube subscribe button, the orbs, `.gradient-text`, the
dotted `islamic-pattern` overlay, and the custom scrollbar.

**Section order rationale:** proof (hero → path → where → voices → photos → video), then the ask
(give), then the minimum context for someone who wants to check the organisation (about → footer).
Donate buttons appear in the header, the hero and the give band. The path section ends with a
text link to the give band.

## Content corrections (from Itqaan's own programme pages)

| Programme | Current page says | Itqaan says (used in the redesign) |
|---|---|---|
| السفرة | group khatma / Qur'anic sufra | Reading the whole Qur'an from the page with tajweed, 5 stages of 6 juz, 2–3 years |
| الماهر بالقرآن | (EN) "the ten Qira'at" | Memorising the whole Qur'an, with a sharia and character programme, age 11+, 1.5–2 years |
| المقارئ القرآنية | equipping recitation halls | Ijaza in the mutawatir readings with a connected sanad, for huffaz, 1–1.5 years |
| بالقراءة نحيا | reading and tajweed for beginners | Correct Arabic reading and writing, age 5+, 4–6 months |
| Stats | 15,000+ students, 40+ centres, 30+ cities | Replaced by programme graduate counts; the unverified totals are dropped |

The English goals and values are re-translated from the Arabic. Today they say different
things, for example "Islamic sciences" in place of "combating illiteracy among Syrians". Quoted
testimonials keep the students' words. Only obvious typos inside the quotes are left alone,
since they are quotations.

**Numbers used** (rounded down, «أكثر من»): reading 106,000; safra 11,000; mahir 2,000; maqari
1,300; teacher training 14,000 participations. Source: app.itkan.info stats banner and
programme pages, read 2026-09-26.

## Images and safeguarding

- A build-time crop removes the bottom watermark strip (top 76% kept). The crops are written as
  AVIF/WebP at 2 sizes into `public/photos/`. The originals stay in place.
- The hero and large crops use shots where children are distant or seen from behind (slider-2,
  slider-3, slider-4). Close shots of identifiable children (slider-1, slider-7) are used only
  small in the grid, or not at all.
- **Follow-up for Itqaan (not blocking):** written consent for minors in fundraising imagery, and
  clean original files.

## Technical changes

- **React removed.** Both islands are replaced by static Astro markup, which removes about 187 KB
  of client JavaScript. `@astrojs/react`, `react`, `react-dom` and their `@types` packages are
  uninstalled.
- **Remaining JavaScript:** the donate modal (unchanged) and the video facade. Both vanilla,
  both progressive enhancement. The header has no menu, so there's no menu script.
- **Copy stays inline** in `t = isEn ? … : …` objects, per CLAUDE.md. Programme and area data
  shared by several sections moves to `src/data/itqaan.ts`, typed, with both languages side by
  side.
- **Accessibility (WCAG 2.2 AA):** skip link, one H1, `:focus-visible` rings in teal, targets
  ≥ 44px, `prefers-reduced-motion` honoured (the only motion is hover and focus transitions),
  `color-scheme: light` on `<html>`, logical properties only.
- **Sharing and SEO:** a 1200×630 `og:image` per language (cropped photo plus logo and headline,
  generated at build time into `public/og/`), `twitter:image`, per-language `og:url` and
  `<link rel=canonical>`, and `hreflang` alternates (ar, en, x-default=ar). WhatsApp previews are
  the main way this page will be shared.
- **Performance:** one LCP image with `fetchpriority="high"`, self-hosted fonts with
  `font-display: swap`, lazy images below the fold, no third-party requests until the video is
  clicked.
- **Stays exactly as it is:** `src/config/donate.ts`, `DonateModal.astro` behaviour, every donate
  button as a real `<a href={donateUrl(lang)} data-donate-open>`.

## Repo notes

- Add to CLAUDE.md: this is SGI's fundraising page for Itqaan, not Itqaan's site. Every section
  must build trust or ask for the gift. Enrolment and profile content link to itkan.info.

## Testing

- Existing tests stay green: the donate href contract, modal present, iframe not lazy and without
  `src`, local head links resolve. The minimum donate-button count drops from 4 to 3 (header,
  hero, give band), because the separate mobile-menu button goes away with the menu.
- New build tests:
  - Both pages contain the same section ids in the same order (`path`, `areas`, `donate`,
    `about`).
  - No `react` or `client:` output in `dist/`.
  - Every `<img>` has `alt`, `width` and `height`.
  - Exactly one element has `fetchpriority="high"`.
  - Each page has exactly one `<h1>`.
- **Visual check** with Playwright screenshots at 390px and 1280px in both languages, before
  calling it done. Then a self-critique on Philosophy, Hierarchy, Execution, Specificity,
  Restraint and Variety (every axis ≥ 3), stamped at the top of `global.css`.
- **Before merge:** a Cloudflare preview build on the branch.

## Out of scope

Multi-page site, CMS, new donation flow or amounts, dark mode, the Turkish language, new photo
shoots.

## Skills applied during implementation

`frontend-design-excellence` (tokens, a11y, polish), `arabic-writing` (Arabic copy, RTL/bidi,
numerals), `ngo-communications` (donor copy, the 501(c)(3) wording),
`child-sponsorship-safeguarding` (image choices), `nonprofit-seo` (meta, JSON-LD, hreflang).
