/**
 * Where donations go.
 *
 * Every donate button on this site is a plain link to SGI's own checkout at
 * sgi.ngo. SGI's shared embed script (EMBED_SRC, loaded once in Layout.astro)
 * opens that link in a modal instead of leaving the page. Nothing about a payment
 * happens in this repo — no card fields, no amounts, no gateway, and since
 * 2026-09-27 no modal code either: frame mode, the ready/height handshake and the
 * attribution parameters (utm_*, click ids, sgi_ref, sgi_land) all live in the
 * script, which SGI serves and monitors for every site that embeds its checkout.
 *
 * This file is the whole of the integration surface, which is deliberate: the
 * previous arrangement (a third-party widget, four buttons each carrying its own
 * template id, tenant id and base URL as data attributes) meant the vendor's
 * contract was copy-pasted into four components, and when the vendor deleted
 * their files there was no single place to change.
 *
 * The contract, including the site registry this depends on, is documented in the
 * SGI theme at docs/donate-embed.md.
 */

/** SGI's origin. Must match Donations\Frame\DEFAULT_ORIGIN's counterpart exactly. */
export const DONATE_ORIGIN = 'https://sgi.ngo';

/**
 * The campaign these gifts are attributed to, by SLUG rather than post id.
 *
 * A WordPress post id differs between SGI's local, dev and production installs, so
 * a hardcoded id would be wrong in at least one of them — and wrong quietly: an id
 * that resolves to nothing still takes the gift, it just loses the attribution. A
 * slug is stable across installs.
 *
 * This depends on a published `campaign` post with this slug existing on sgi.ngo.
 * If it does not, donations still complete; they land as unrestricted income with
 * no Itqaan attribution, and nothing in the donor's experience says so.
 *
 * The campaign is post 1048536, "Itqaan Foundation for Education and Development".
 *
 * The slug still reads "itkan-foundationfor-...", and that is correct — do not
 * "tidy" it. It was minted from a title that carried two faults: a missing space in
 * "Foundationfor", and a U+00A0 no-break space after "Itkan" that looked like an
 * ordinary one. Both were fixed in the database on 2026-08-19, and the name was
 * changed to the Itqaan spelling on 2026-08-20, but WordPress does not re-derive an
 * existing post's slug from its title, so the slug outlived all three edits.
 *
 * That is the desirable outcome: the slug is an identifier, not a label, and every
 * link on this site is built from this constant. If anyone ever does change the
 * slug, this constant has to change in the same breath — an unresolvable slug does
 * not break giving, it silently stops attributing it.
 */
export const CAMPAIGN_SLUG = 'itkan-foundationfor-education-and-development';

/**
 * This site's key in SGI's registry of sites allowed to frame the checkout
 * (Donations\Frame\SITES, which maps it to https://itqaan.sgi.ngo). The script
 * sends it as `sgi_parent`. Before 2026-09-27 this site sent none, and SGI
 * resolved the absence to Itqaan (Frame\LEGACY_SITE).
 */
export const SITE = 'itqaan';

/**
 * The shared embed script. Served by the same origin as the checkout it opens,
 * at a fixed, versioned URL: a fix reaches this site without a redeploy here.
 */
export const EMBED_SRC = `${DONATE_ORIGIN}/embed/v1/donate.js`;

export type Lang = 'ar' | 'en';

/**
 * The donation URL for a language: the anchor's href, and the URL the embed
 * script frames (it adds `sgi_frame=1` and the rest itself). A visitor with no
 * JavaScript, or a browser without <dialog>, follows it to a complete donation
 * page. The button is a real link first and a modal trigger second.
 */
export function donateUrl(lang: Lang): string {
  // Arabic is SGI's non-default language and takes a path prefix; English is the
  // default and takes none.
  const path = lang === 'ar' ? '/ar/donate/' : '/donate/';

  const params = new URLSearchParams({ campaign_slug: CAMPAIGN_SLUG });

  return `${DONATE_ORIGIN}${path}?${params.toString()}`;
}
