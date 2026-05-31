/** Crisp SVG dot-matrix world map (vector, no raster). */

const WORLD_MAP_SIZE = { w: 960, h: 520 };
const WORLD_MAP_DOT_STEP = 9;
const WORLD_MAP_DOT_R = 2.15;
const WORLD_MAP_DOT_FILL = "#b8bcc2";

let worldMapDotsCache = null;

function inEllipse(x, y, cx, cy, rx, ry) {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  return dx * dx + dy * dy <= 1;
}

/** Simplified land mask — equirectangular-style blobs. */
function isWorldLand(x, y) {
  if (inEllipse(x, y, 168, 158, 88, 72)) return true;
  if (inEllipse(x, y, 248, 188, 52, 58)) return true;
  if (inEllipse(x, y, 198, 88, 38, 26)) return true;
  if (inEllipse(x, y, 262, 368, 58, 102)) return true;
  if (inEllipse(x, y, 458, 138, 40, 34)) return true;
  if (inEllipse(x, y, 448, 122, 10, 7)) return true;
  if (inEllipse(x, y, 478, 268, 50, 88)) return true;
  if (inEllipse(x, y, 538, 178, 38, 42)) return true;
  if (inEllipse(x, y, 598, 210, 32, 38)) return true;
  if (inEllipse(x, y, 668, 168, 118, 72)) return true;
  if (inEllipse(x, y, 712, 238, 42, 36)) return true;
  if (inEllipse(x, y, 808, 188, 14, 9)) return true;
  if (inEllipse(x, y, 768, 388, 52, 30)) return true;
  if (inEllipse(x, y, 818, 268, 22, 18)) return true;
  return false;
}

function buildWorldMapDots() {
  const { w, h } = WORLD_MAP_SIZE;
  const step = WORLD_MAP_DOT_STEP;
  const dots = [];
  let row = 0;
  for (let y = step; y < h - step; y += step, row += 1) {
    const x0 = step + (row % 2) * (step / 2);
    for (let x = x0; x < w - step; x += step) {
      if (isWorldLand(x, y)) dots.push([Math.round(x), Math.round(y)]);
    }
  }
  return dots;
}

function getWorldMapDots() {
  if (!worldMapDotsCache) worldMapDotsCache = buildWorldMapDots();
  return worldMapDotsCache;
}

function renderWorldMapDotsSvg() {
  const { w, h } = WORLD_MAP_SIZE;
  const circles = getWorldMapDots()
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${WORLD_MAP_DOT_R}"/>`)
    .join("");

  return `<svg class="pdf-map__svg" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" aria-hidden="true"><g class="pdf-map__land" fill="${WORLD_MAP_DOT_FILL}">${circles}</g></svg>`;
}
