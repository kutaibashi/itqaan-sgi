# Itqaan Foundation — website

SGI's bilingual fundraising page for **Itqaan Foundation for Education and Development**
(مؤسسة إتقان للتعليم والتنمية), a Qur'an and Arabic teaching foundation in
Gaziantep, Türkiye. Live at <https://itqaan.sgi.ngo>.

- Arabic (default, right-to-left): `/`
- English (left-to-right): `/en/`

Built with Astro 5 as a static site, styled with Tailwind 4, with two small React
islands (the image slider and testimonials). Hosted on Cloudflare (Workers Builds), which
builds and deploys every push to `main`.

## Commands

| Command           | What it does                                       |
| :---------------- | :------------------------------------------------- |
| `npm ci`          | Install dependencies from the lockfile             |
| `npm run dev`     | Dev server at `http://localhost:4321`              |
| `npm run build`   | Build the static site into `dist/`                 |
| `npm run preview` | Serve the built `dist/` locally                    |
| `npm test`        | Build, then run the tests in `test/` (Node 24+)    |
| `npm run assets`  | Rebuild cropped photos, share image, video poster  |

## Layout

```text
src/
  pages/index.astro       Arabic page
  pages/en/index.astro    English page — same sections, lang="en"
  layouts/Layout.astro    <head>: meta, Open Graph, JSON-LD, fonts
  components/             One file per section; copy for both languages inline
  config/donate.ts        Everything about where donations go
  data/itqaan.ts          Itqaan's published figures and shared copy
  styles/global.css       Tailwind import, brand colours, fonts
public/                   Images served as-is
brand/                    Source logo and photos (not deployed)
scripts/build-assets.mjs  Crops photos into public/photos/
test/                     node:test — the donation URL contract and built HTML
```

## Donations

This site takes no payments. Every donate button is a plain link to Smile Givers
International's (SGI) checkout at `sgi.ngo/donate/`. SGI is a US 501(c)(3) that
receives gifts for this campaign and issues the receipts. With JavaScript,
`DonateModal.astro` opens that checkout in a modal iframe instead of leaving the page.

`src/config/donate.ts` is the whole integration surface. Read its comments before
changing it. In particular, the campaign slug's odd spelling is deliberate. The other
half of the contract is documented in the SGI theme at `docs/itqaan-embed.md`.
