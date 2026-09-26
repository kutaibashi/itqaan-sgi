/**
 * The schematic map's projection, shared by scripts/build-map.mjs (which bakes
 * the country outlines) and Areas.astro (which places the cities). A plain
 * equirectangular projection with longitude scaled by cos 37°, the latitude of
 * Gaziantep, so the region keeps its real proportions.
 */
export interface View { lon0: number; lon1: number; lat0: number; lat1: number; k: number }

/** Türkiye and Syria whole, so Istanbul fits. */
export const MAIN: View = { lon0: 25.6, lon1: 42.8, lat0: 31.8, lat1: 42.2, k: 36 };
/** The crowded border region, magnified: Kahramanmaraş to Idlib. */
export const INSET: View = { lon0: 36.15, lon1: 38.15, lat0: 35.7, lat1: 37.8, k: 130 };

const COS = Math.cos((37 * Math.PI) / 180);

export function project(v: View, lon: number, lat: number): [number, number] {
  return [(lon - v.lon0) * v.k * COS, (v.lat1 - lat) * v.k];
}

export function size(v: View): [number, number] {
  return [(v.lon1 - v.lon0) * v.k * COS, (v.lat1 - v.lat0) * v.k];
}

export function inView(v: View, lon: number, lat: number): boolean {
  return lon >= v.lon0 && lon <= v.lon1 && lat >= v.lat0 && lat <= v.lat1;
}
