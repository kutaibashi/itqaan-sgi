/**
 * Where donations go.
 *
 * Every donate button on this site opens SGI's own checkout at sgi.ngo in a modal
 * iframe. Nothing about a payment happens in this repo — no card fields, no
 * amounts, no gateway. This file is the whole of the integration surface, which is
 * deliberate: the previous arrangement (a third-party widget, four buttons each
 * carrying its own template id, tenant id and base URL as data attributes) meant
 * the vendor's contract was copy-pasted into four components, and when the vendor
 * deleted their files there was no single place to change.
 *
 * The theme-side counterpart, and the contract these URLs have to satisfy, is
 * documented in the SGI theme at docs/itqaan-embed.md.
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
 * The query flag that asks SGI to render its checkout without site chrome.
 *
 * `sgi_frame`, not `embed`: `embed` is one of WordPress's own public query vars, so
 * `?embed=1` would make WordPress serve its oEmbed template and the donate page
 * would never run.
 */
export const FRAME_FLAG = 'sgi_frame';

/**
 * Marketing parameters forwarded from THIS page's URL into the checkout.
 *
 * A donor who arrives here from an ad and then opens the modal would otherwise
 * reach a checkout that knows nothing about how they got here.
 */
export const FORWARD_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'fbclid',
  'msclkid',
  'ttclid',
  'twclid',
  'li_fat_id',
] as const;

/**
 * The two parameters that hand SGI *this page's* context, because inside the
 * iframe nothing else can.
 *
 * The framed checkout has its own `sessionStorage`, so SGI's site-wide
 * attribution script starts from nothing in there. And the frame carries
 * `referrerpolicy="strict-origin"`, so its `document.referrer` is only
 * `https://itqaan.sgi.ngo/` — which SGI correctly reads as internal navigation
 * rather than a marketing touch.
 *
 * The result, until 2026-08-24, was that every gift made through this modal was
 * recorded as `direct` with a landing page of `/donate/`. Two real gifts went
 * that way before anyone noticed, because nothing about it looks broken.
 *
 * `sgi_ref` is a REFERRER HOSTNAME ONLY — never a full URL, so no path or query
 * string from another site is handed on. `sgi_land` is this page's own path.
 *
 * SGI honours these only when `sgi_frame=1` is also present, validates both to a
 * shape, and treats them as marketing data carrying no authority — the same
 * standing as `utm_source`, which any visitor can already type for themselves.
 */
export const REF_PARAM = 'sgi_ref';
export const LAND_PARAM = 'sgi_land';

export type Lang = 'ar' | 'en';

/**
 * The donation URL for a language.
 *
 * `framed` is what the modal opens; the un-framed form is what the anchor's href
 * carries, so that a visitor with no JavaScript — or a browser without <dialog> —
 * still reaches a complete, working donation page by simply following the link.
 * The button is a real link first and a modal trigger second.
 */
export function donateUrl(lang: Lang, framed = false): string {
  // Arabic is SGI's non-default language and takes a path prefix; English is the
  // default and takes none.
  const path = lang === 'ar' ? '/ar/donate/' : '/donate/';

  const params = new URLSearchParams({ campaign_slug: CAMPAIGN_SLUG });

  if (framed) params.set(FRAME_FLAG, '1');

  return `${DONATE_ORIGIN}${path}?${params.toString()}`;
}
