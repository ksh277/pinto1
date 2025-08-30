// src/lib/editor/konvaAdapters.ts
// Helpers adapted for Pinto editor to integrate open-source editor patterns
// - fit/cover placement (inspired by common image editors like react-image-editor)
// - nearest point snapping on polyline (used to constrain hole to path)

export function fitContain(
  imgW: number, imgH: number, boardW: number, boardH: number, mode: "fit"|"cover"="fit"
){
  const rFit = Math.min(boardW / imgW, boardH / imgH);
  const rCover = Math.max(boardW / imgW, boardH / imgH);
  const r = mode === "cover" ? rCover : rFit;
  const w = imgW * r, h = imgH * r;
  const x = (boardW - w)/2, y = (boardH - h)/2;
  return { x, y, w, h, scale: r };
}

export type Pt = { x:number; y:number };

export function nearestOnPolyline(poly: Pt[], p: Pt): Pt {
  if (!poly || poly.length < 2) return p;
  let bestX = poly[0].x, bestY = poly[0].y, bestD = Number.POSITIVE_INFINITY;
  for (let i=0;i<poly.length-1;i++){
    const ax = poly[i].x, ay = poly[i].y;
    const bx = poly[i+1].x, by = poly[i+1].y;
    const abx = bx-ax, aby = by-ay;
    const denom = abx*abx + aby*aby || 1;
    const t = Math.max(0, Math.min(1, ((p.x-ax)*abx + (p.y-ay)*aby) / denom));
    const qx = ax + abx*t, qy = ay + aby*t;
    const dx = p.x - qx, dy = p.y - qy;
    const d = dx*dx + dy*dy;
    if (d < bestD){ bestD = d; bestX = qx; bestY = qy; }
  }
  return { x: bestX, y: bestY };
}
