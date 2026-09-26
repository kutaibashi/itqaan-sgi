// Bakes country outlines for the "where Itqaan teaches" map into
// src/data/map-paths.json. Run by hand (`npm run map`); the output is committed,
// so builds never fetch map data. Outlines: Natural Earth 1:50m via world-atlas.
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { MAIN, INSET, project, size } from '../src/data/map.ts';

const topo = JSON.parse(readFileSync('node_modules/world-atlas/countries-50m.json', 'utf8'));
const countries = feature(topo, topo.objects.countries).features;

const TURKEY = '792', SYRIA = '760';
// Neighbours, drawn faint for context.
const OTHERS = ['300', '100', '196', '422', '376', '275', '400', '368', '364', '268', '051', '031', '682', '818'];

function pathFor(view, geometry) {
  const [w, h] = size(view);
  const pad = 40;
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  let d = '';
  for (const poly of polys) {
    for (const ring of poly) {
      const pts = ring.map(([lon, lat]) => project(view, lon, lat));
      // Skip rings entirely outside the view.
      if (pts.every(([x, y]) => x < -pad || x > w + pad || y < -pad || y > h + pad)) continue;
      let last = null, seg = '';
      for (const [x, y] of pts) {
        if (last && Math.hypot(x - last[0], y - last[1]) < 0.9) continue; // drop sub-pixel detail
        seg += `${seg ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
        last = [x, y];
      }
      if (seg) d += seg + 'Z';
    }
  }
  return d;
}

function bake(view) {
  const byId = (id) => countries.find((c) => c.id === id);
  return {
    tr: pathFor(view, byId(TURKEY).geometry),
    sy: pathFor(view, byId(SYRIA).geometry),
    other: OTHERS.map(byId).filter(Boolean).map((c) => pathFor(view, c.geometry)).filter(Boolean).join(''),
  };
}

const out = { source: 'Natural Earth 1:50m (world-atlas@2)', main: bake(MAIN), inset: bake(INSET) };
writeFileSync('src/data/map-paths.json', JSON.stringify(out));
console.log('map baked', JSON.stringify(out).length, 'bytes');
