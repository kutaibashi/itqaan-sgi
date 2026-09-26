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
