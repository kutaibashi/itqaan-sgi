# CLAUDE.md

Static Astro 5 + Tailwind 4 landing page for Itqaan Foundation, deployed to
Cloudflare Workers Builds from `main` (every branch also gets a build check on GitHub). See README.md for layout and commands.

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
