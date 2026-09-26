# CLAUDE.md

Static Astro 5 + Tailwind 4 landing page for Itqaan Foundation, deployed to
Cloudflare Workers Builds from `main` (every branch also gets a build check on GitHub). See README.md for layout and commands.

## Scope

- This is SGI's **fundraising page** for Itqaan, not Itqaan's website (that is itkan.info).
  Every section must build donor trust or ask for the gift. Enrolment, courses and the full
  profile link to itkan.info.
- Facts and numbers live in `src/data/itqaan.ts`, sourced from app.itkan.info, and are always
  rounded down. Update them there only.
- Photos: sources in `brand/photos/`, built by `npm run assets` into `public/photos/`.
  Never show a centre name next to photos of children. Students are quoted by first name only.
- SGI's Arabic name is «مانحو الابتسامة الدولية» (never the transliteration «سمايل جيفرز»); a test enforces it.
- Arabic copy: Western digits, donors addressed as أنتم, no "·" separator (Readex draws it like
  the digit ٠; a test enforces this). Latin runs inside Arabic go in `<bdi>`.

## Layout and motion

- Every section's content sits in `.frame` (72rem); only colour bands run edge to edge. Section
  padding comes from `--space-section`, heading gaps from `.section-head`. Don't hand-roll widths.
- Motion is transform/opacity only. `.reveal` is hidden **only under `.js`**, which the reveal
  script in `Layout.astro` adds itself; without JavaScript nothing is hidden (a test enforces it).
- Reduced motion turns movement into crossfades. Never count numbers up: mid-animation they'd
  show figures that aren't true.
- Don't attribute words to Itqaan that it hasn't published (the hadith band was dropped for that).

## Verify changes

`npm test` builds the site and runs `test/*.test.mjs` (plain `node:test`, Node 24
strips the types from `src/config/donate.ts` on import). Run it before committing.

## Bilingual rules

- Arabic is the default locale at `/` and is right-to-left. English is at `/en/`.
- Each component takes `lang` and carries both languages' copy in a
  `t = isEn ? {...} : {...}` object. Change both languages together.
- `pages/index.astro` and `pages/en/index.astro` must list the same sections.
- Use logical CSS (`inset-inline-end`, `padding-inline`, `ms-`/`me-`), not
  left/right, unless the element really is direction-specific.
- Arabic copy is formal, accessible fuṣḥā. Use the `arabic-writing` skill.

## Donation flow — do not break

- All donation config lives in `src/config/donate.ts`. Don't scatter URLs, ids or
  vendor attributes across components.
- Donate buttons are real `<a href={donateUrl(lang)} data-donate-open>` links.
  The href is the **plain** URL. `sgi_frame=1` is added only by the modal script.
- `CAMPAIGN_SLUG` keeps its typo (`itkan-foundationfor-...`). It is an identifier.
  A wrong slug still takes the gift but silently drops the attribution.
- The modal iframe must **never** get `loading="lazy"` (it deadlocks, because the
  frame is hidden until SGI posts `ready`) and must have no `src` in the markup.
  Tests enforce both.
- Reveal the frame only on a `ready`/`height` postMessage from `DONATE_ORIGIN`.
  Never treat the iframe's `load` event as success.
- Keep the "SGI receives this donation" disclosure visible, both in the modal and
  in the donation section.

## Repo hygiene

- `node_modules/`, `.astro/` and `dist/` are ignored and must stay untracked.
- `.gitattributes` forces LF. The working tree was once converted to CRLF
  wholesale, which made every file show as modified.
- The foundation's own email domain is `itkan.info` (Turkish registration:
  ITKAN Eğitim ve Kalkınma Derneği). It is not a typo for Itqaan.

## Deploy

- `wrangler.jsonc` makes the Worker assets-only (serves `dist/`). Keep its `name`
  equal to the Worker name, `itqaan-sgi`. Don't add `@astrojs/cloudflare`: the site
  is static and needs no server code.
- Workers Builds runs `npm run build`, then `npx wrangler deploy` on `main` and
  `npx wrangler versions upload` (a non-live preview version) on other branches.
