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
 * The campaign is post 1048536, "Itkan Foundation for Education and Development".
 * Note the slug's missing space in "foundationfor" — it comes from a typo in the
 * campaign TITLE (which also carries a non-breaking space after "Itkan"). Fixing
 * that title is worth doing, but WordPress does not re-derive an existing post's
 * slug from its title, so the slug survives a title fix. If anyone changes the
 * slug itself, this constant has to change in the same breath — an unresolvable
 * slug does not break giving, it silently stops attributing it.
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
