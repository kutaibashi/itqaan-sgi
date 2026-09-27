// Checks the built pages in dist/. Run `npm run build` first — `npm test` does.
//
// These guard the failure modes that have already happened once and looked fine
// while they were happening: donate buttons pointing somewhere wrong, and a
// donate modal that never loaded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

import { EMBED_SRC, SITE, donateUrl } from '../src/config/donate.ts';

const pages = [
  { lang: 'ar', dir: 'rtl', file: 'dist/index.html' },
  { lang: 'en', dir: 'ltr', file: 'dist/en/index.html' },
];

const decode = (s) => s.replaceAll('&amp;', '&');

for (const { lang, dir, file } of pages) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

  test(`${file}: html lang and dir`, () => {
    const root = html.match(/<html[^>]*>/)[0];
    assert.match(root, new RegExp(`lang="${lang}"`));
    assert.match(root, new RegExp(`dir="${dir}"`));
  });

  test(`${file}: every donate button is a real link to SGI`, () => {
    const anchors = html.match(/<a\b[^>]*\bdata-sgi-donate\b[^>]*>/g) ?? [];
    // Header, hero and give band. The old mobile-menu duplicate is gone with the menu.
    assert.ok(anchors.length >= 3, `expected at least 3 donate buttons, found ${anchors.length}`);

    for (const a of anchors) {
      const href = decode(a.match(/\bhref="([^"]*)"/)?.[1] ?? '');
      // The plain URL, never the framed one: a no-JS donor follows this href and
      // needs SGI's site chrome.
      assert.equal(href, donateUrl(lang));
    }
  });

  test(`${file}: every local <link> in <head> resolves to a built file`, () => {
    // /favicon.png was linked here for months with no file behind it.
    const links = html.match(/<link\b[^>]*>/g) ?? [];
    const local = links
      .map((l) => l.match(/\bhref="(\/[^"/][^"]*)"/)?.[1])
      .filter(Boolean);
    assert.ok(local.length > 0, 'no local <link> hrefs found');
    for (const href of local) {
      assert.ok(existsSync(new URL(`../dist${href}`, import.meta.url)), `${href} is not in dist/`);
    }
  });

  test(`${file}: SGI's embed script is loaded once, for this site`, () => {
    const tags = html.match(/<script\b[^>]*\bsrc="[^"]*\/embed\/v1\/donate\.js"[^>]*>/g) ?? [];
    assert.equal(tags.length, 1, `expected one embed script, found ${tags.length}`);
    const tag = tags[0];
    assert.match(tag, new RegExp(`src="${EMBED_SRC.replaceAll('.', '\\.')}"`));
    assert.match(tag, new RegExp(`data-sgi-site="${SITE}"`));
    assert.match(tag, /\bdefer\b/);
    // No SRI, on purpose: the script is fixed in place so a fix reaches every site.
    assert.doesNotMatch(tag, /\bintegrity=/);
  });

  test(`${file}: no bespoke donate modal is left behind`, () => {
    // Two modals on one page would both try to open on a click.
    assert.doesNotMatch(html, /itq-donate-modal|data-donate-open|data-donate-frame/);
    assert.doesNotMatch(html, /<iframe\b/);
  });

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

  test(`${file}: exactly one h1 and one high-priority image`, () => {
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
    assert.equal((html.match(/fetchpriority="high"/g) ?? []).length, 1);
  });

  test(`${file}: skip link targets main`, () => {
    assert.match(html, /<a[^>]*class="skip-link"[^>]*href="#main"|<a[^>]*href="#main"[^>]*class="skip-link"/);
    assert.match(html, /<main[^>]*id="main"/);
  });

  test(`${file}: the path shows the four programmes in order, rounded down`, () => {
    const path = html.match(/<section[^>]*id="path"[\s\S]*?<\/section>/)?.[0];
    assert.ok(path, 'section#path missing');
    const items = path.match(/<li\b/g) ?? [];
    assert.equal(items.length, 5, 'four programmes plus the ijaza line');
    const expected = lang === 'ar'
      ? ['106,000', '11,000', '2,000', '1,300']
      : ['106,000', '11,000', '2,000', '1,300'];
    // Both languages set the prefix on its own line above each number.
    const prefix = lang === 'ar' ? /أكثر من/g : /More than/g;
    assert.ok((path.match(prefix) ?? []).length >= 4, 'each count says "more than"');
    if (lang === 'ar') assert.match(path, /خرّيج وخرّيجة/, 'Arabic names the counted noun after the number');
    let at = -1;
    for (const e of expected) {
      const i = path.indexOf(e);
      assert.ok(i > at, `${e} missing or out of order`);
      at = i;
    }
  });

  test(`${file}: no middle dot in Arabic text (Readex draws it like the digit ٠)`, () => {
    if (lang !== 'ar') return;
    const text = html.slice(html.indexOf('<body'))
      .replace(/<script\b[\s\S]*?<\/script>/g, '')
      .replace(/<[^>]+>/g, ' ');
    assert.doesNotMatch(text, /·/);
  });

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

  test(`${file}: the film is a real link until clicked`, () => {
    const film = html.match(/<section[^>]*id="film"[\s\S]*?<\/section>/)?.[0];
    assert.ok(film, 'section#film missing');
    assert.match(film, /<a[^>]*href="https:\/\/www\.youtube\.com\/watch\?v=9vrkcedB9LM"/);
    assert.doesNotMatch(film, /<iframe/, 'no YouTube request before a click');
  });

  test(`${file}: sections in the agreed order`, () => {
    const ids = [...html.matchAll(/<section[^>]*\bid="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(ids, ['path', 'areas', 'voices', 'photos', 'film', 'donate', 'about']);
  });

  test(`${file}: no React left in the page`, () => {
    assert.doesNotMatch(html, /astro-island|client:(visible|load|idle)/);
  });

  test(`${file}: outbound links stay on the allowlist`, () => {
    // Anchored on a following "/" or "?", so a lookalike such as sgi.ngo.evil.example fails.
    const allowed = /^(https:\/\/(sgi\.ngo|itkan\.info|wa\.me)(\/|$)|https:\/\/www\.youtube\.com\/watch\?|mailto:)/;
    const hrefs = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map((m) => m[1])
      .filter((h) => /^(https?:|mailto:)/.test(h));
    for (const h of hrefs) assert.match(h, allowed, `unexpected outbound link: ${h}`);
  });

  test(`${file}: Latin names inside Arabic are isolated`, () => {
    if (lang !== 'ar') return;
    const body = html.slice(html.indexOf('<body'));
    // Strip bdi contents, attributes and URLs; any SGI or 501(c)(3) left is un-isolated.
    const bare = body
      .replace(/<script\b[\s\S]*?<\/script>/g, '')
      .replace(/<bdi\b[^>]*>[\s\S]*?<\/bdi>/g, '')
      .replace(/<[^>]+>/g, ' ');
    assert.doesNotMatch(bare, /\bSGI\b|501\(c\)\(3\)/);
  });

  test(`${file}: one digit system: no Arabic-Indic digits`, () => {
    const text = html.slice(html.indexOf('<body')).replace(/<script\b[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
    assert.doesNotMatch(text, /[٠-٩]/);
  });

  test(`${file}: English spells out the honorific`, () => {
    if (lang !== 'en') return;
    const text = html.slice(html.indexOf('<body')).replace(/<script\b[\s\S]*?<\/script>/g, '');
    assert.doesNotMatch(text, /ﷺ/);
    assert.match(text, /peace be upon him/);
  });

  test(`${file}: Itqaan's own motto and values, and no words put in its mouth`, () => {
    const body = html.slice(html.indexOf('<body'));
    assert.doesNotMatch(body, /يحبّ إذا عمل|يحب إذا عمل/, 'the hadith linkage is not on Itqaan’s site');
    if (lang === 'ar') {
      assert.match(body, /جيلٌ يُسهم في نهضة المجتمع/);
      for (const v of ['الإتقان', 'القدوة', 'الإسناد', 'الأمان']) assert.match(body, new RegExp(v));
    } else {
      assert.match(body, /A generation that helps its community rise/);
    }
  });

  test(`${file}: every section's content sits in the one page frame`, () => {
    const sections = html.match(/<section\b[\s\S]*?<\/section>/g) ?? [];
    assert.ok(sections.length >= 8);
    for (const sec of sections) assert.match(sec, /class="[^"]*\bframe\b/, sec.slice(0, 80));
  });

  test(`${file}: the give band keeps the SGI disclosure`, () => {
    const give = html.match(/<section[^>]*id="donate"[\s\S]*?<\/section>/)?.[0] ?? '';
    assert.match(give, /data-sgi-donate/);
    assert.match(give, /501\(c\)\(3\)/);
  });

  test(`${file}: About states Itqaan's licensing in Syria and Türkiye`, () => {
    const about = html.match(/<section[^>]*id="about"[\s\S]*?<\/section>/)?.[0] ?? '';
    assert.match(about, lang === 'ar' ? /مرخّصة في سوريا وتركيا/ : /licensed foundation in Syria and Türkiye/);
  });

  test(`${file}: footer has no donation-questions line`, () => {
    const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0] ?? '';
    assert.ok(footer, 'footer missing');
    assert.doesNotMatch(footer, /sgi\.ngo|أسئلة عن تبرعكم|Questions about your donation/);
  });

  test(`${file}: film poster draws its focus ring inside the clipped box`, () => {
    const link = html.match(/<a\b[^>]*\bdata-film=[^>]*>/)?.[0] ?? '';
    assert.match(link, /focus-visible:outline-offset-\[-/, 'ring must be inset: the container clips outside it');
  });

  test(`${file}: hero headline clauses are separate blocks, not a <br>`, () => {
    const h1 = html.match(/<h1\b[\s\S]*?<\/h1>/)?.[0] ?? '';
    assert.doesNotMatch(h1, /<br\b/);
    assert.equal((h1.match(/<span class="[^"]*\bblock\b/g) ?? []).length, 2);
  });

  test(`${file}: each chain step names the programme before its count (screen-reader order)`, () => {
    const path = html.match(/<section[^>]*id="path"[\s\S]*?<\/section>/)?.[0] ?? '';
    const steps = path.split(/<li\b/).slice(1, 5);
    assert.equal(steps.length, 4);
    for (const s of steps) assert.ok(s.indexOf('<h3') < s.indexOf('chain-count'), 'h3 must precede the count');
  });

  test(`${file}: every donate button carries the book icon, hidden from screen readers`, () => {
    const buttons = html.match(/<a\b[^>]*\bdata-sgi-donate\b[^>]*>[\s\S]*?<\/a>/g) ?? [];
    assert.ok(buttons.length >= 3);
    for (const b of buttons) {
      assert.match(b, /<svg[^>]*class="[^"]*donate-icon[^"]*"[^>]*aria-hidden="true"/, b.slice(0, 120));
      // The accessible name is still the visible text, not the icon.
      assert.match(b.replace(/<svg[\s\S]*?<\/svg>/, '').replace(/<[^>]+>/g, '').trim(), /\S/);
    }
  });

  test(`${file}: in-page and external links show where they go`, () => {
    const toPath = html.match(/<a[^>]*href="#path"[^>]*>[\s\S]*?<\/a>/)?.[0] ?? '';
    assert.match(toPath, /link-arrow/);
    const ext = html.match(/<a[^>]*href="https:\/\/itkan\.info\/"[^>]*>[\s\S]*?<\/a>/)?.[0] ?? '';
    assert.match(ext, /link-arrow/);
  });

  test(`${file}: the areas map is a labelled real map with an inset, and the lists stay`, () => {
    const areasSec = html.match(/<section[^>]*id="areas"[\s\S]*?<\/section>/)?.[0] ?? '';
    const main = areasSec.match(/<svg[^>]*class="[^"]*areas-map--main[^"]*"[\s\S]*?<\/svg>/)?.[0] ?? '';
    assert.ok(main, 'main map missing');
    assert.match(main, /role="img"/);
    assert.match(main, /aria-label="[^"]+"/);
    assert.match(main, /class="map-land map-land--tr"/, 'Türkiye outline');
    assert.match(main, /class="map-land map-land--sy"/, 'Syria outline');
    assert.equal((main.match(/class="map-dot/g) ?? []).length, 9, 'all nine places on the map');
    const inset = areasSec.match(/<svg[^>]*class="[^"]*areas-map--inset[^"]*"[\s\S]*?<\/svg>/)?.[0] ?? '';
    assert.match(inset, /aria-hidden="true"/, 'inset repeats the main map, so it is hidden from screen readers');
    assert.equal((areasSec.match(/<li\b/g) ?? []).length, 11, '4 + 5 + 2 list items');
  });

  test(`${file}: About sets Itqaan's facts out as a definition list`, () => {
    const about = html.match(/<section[^>]*id="about"[\s\S]*?<\/section>/)?.[0] ?? '';
    const dl = about.match(/<dl\b[\s\S]*?<\/dl>/)?.[0] ?? '';
    assert.equal((dl.match(/<dt\b/g) ?? []).length, 4);
    assert.match(dl, /ITKAN Eğitim ve Kalkınma Derneği/);
  });

  test(`${file}: the give band carries the large book mark`, () => {
    const give = html.match(/<section[^>]*id="donate"[\s\S]*?<\/section>/)?.[0] ?? '';
    assert.match(give, /donate-icon--mark/);
  });

  test(`${file}: voices lead with one quote, show durations as figures, and name their source`, () => {
    const v = html.match(/<section[^>]*id="voices"[\s\S]*?<\/section>/)?.[0] ?? '';
    assert.equal((v.match(/class="[^"]*\bvoice--lead\b/g) ?? []).length, 1);
    assert.equal((v.match(/class="voice-months"/g) ?? []).length, 3);
    assert.match(v, lang === 'ar' ? /من شهادات الطلاب على موقع مؤسسة إتقان/ : /From student reviews on Itqaan/);
  });

  test(`${file}: gallery photos open full size: plain links without JS, a labelled viewer with it`, () => {
    const g = html.match(/<section[^>]*id="photos"[\s\S]*?<\/section>/)?.[0] ?? '';
    const links = g.match(/<a\b[^>]*data-lightbox[^>]*>/g) ?? [];
    assert.equal(links.length, 4);
    for (const a of links) assert.match(a, /href="\/photos\/[a-z]+-1600\.webp"/, a);
    const dlg = g.match(/<dialog\b[^>]*class="[^"]*lightbox[\s\S]*?<\/dialog>/)?.[0] ?? '';
    assert.ok(dlg, 'viewer dialog missing');
    assert.match(dlg.match(/<dialog[^>]*>/)[0], /aria-label="[^"]+"/);
    for (const k of ['data-lb-close', 'data-lb-prev', 'data-lb-next']) {
      assert.match(dlg, new RegExp(`<button[^>]*${k}[^>]*aria-label="[^"]+"|<button[^>]*aria-label="[^"]+"[^>]*${k}`), k);
    }
    assert.equal((g.match(/<figcaption\b/g) ?? []).length, 0, 'no visible captions (alt text still describes each photo)');
    for (const img of g.match(/<img\b[^>]*class="[^"]*gallery-img[^>]*>/g) ?? []) assert.match(img, /alt="[^"]+"/);
  });

  test(`${file}: SGI's Arabic name is مانحو الابتسامة الدولية`, () => {
    if (lang !== 'ar') return;
    assert.doesNotMatch(html, /سمايل/);
    assert.match(html, /مانحو الابتسامة الدولية/);
    assert.doesNotMatch(html, /مانحي الابتسامة/);
  });

  test(`${file}: every Latin run in the Arabic page is isolated (bdi or a lang attribute)`, () => {
    if (lang !== 'ar') return;
    const body = html.slice(html.indexOf('<body'))
      .replace(/<(script|style)\b[\s\S]*?<\/\1>/g, '')
      .replace(/<bdi\b[^>]*>[\s\S]*?<\/bdi>/g, '')
      .replace(/<(\w+)\b[^>]*\blang="(en|tr)"[^>]*>[\s\S]*?<\/\1>/g, '')
      .replace(/<[^>]+>/g, ' ');
    const latin = body.match(/[A-Za-z][A-Za-z.]+/g) ?? [];
    assert.deepEqual(latin, [], `un-isolated Latin: ${latin.slice(0, 5).join(', ')}`);
  });
}

test('built CSS keeps anchors clear of the sticky header', () => {
  const dir = new URL('../dist/_astro/', import.meta.url);
  const css = readdirSync(dir).filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(new URL(f, dir), 'utf8')).join('\n');
  assert.match(css, /scroll-margin-(block-start|top)/);
});

test('motion never hides content without JavaScript, and honours reduced motion', () => {
  const dir = new URL('../dist/_astro/', import.meta.url);
  const css = readdirSync(dir).filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(new URL(f, dir), 'utf8')).join('\n');
  // Any rule that starts .reveal invisible must be scoped under .js (set by the script itself).
  for (const m of css.matchAll(/([^{}]*\.reveal[^{}]*)\{([^}]*)\}/g)) {
    if (/opacity:\s*0(?![.\d])/.test(m[2])) assert.match(m[1], /\.js\b/, `unscoped hidden reveal: ${m[1].trim()}`);
  }
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
