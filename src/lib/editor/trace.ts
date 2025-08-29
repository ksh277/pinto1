// src/lib/editor/trace.ts
// ---------------------------------------------------------------------
export const MM_PER_INCH = 25.4;
export const mm2px = (mm: number, dpi: number): number => (mm / MM_PER_INCH) * dpi;
export const px2mm = (px: number, dpi: number): number => (px / dpi) * MM_PER_INCH;

const clamp = (n: number, a: number, b: number): number => Math.max(a, Math.min(b, n));

// 내부 공통 포인트 타입(중복 방지용)
type Pt = { x: number; y: number };

// ---------------------------------------------------------------------
// Image loader
export function loadHtmlImage(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = url;
  });
}

// ---------------------------------------------------------------------
// Background removal by sampled color
export async function removeBySampleToCanvas(
  img: HTMLImageElement,
  sample: [number, number, number],
  threshold: number = 28,
): Promise<HTMLCanvasElement> {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(img, 0, 0);
  const im = ctx.getImageData(0, 0, c.width, c.height);
  const d = im.data;
  const [sr, sg, sb] = sample;

  for (let i = 0; i < d.length; i += 4) {
    const dr = d[i] - sr, dg = d[i + 1] - sg, db = d[i + 2] - sb;
    const dist = Math.hypot(dr, dg, db);
    if (dist < threshold) d[i + 3] = 0; // 투명 처리
  }
  ctx.putImageData(im, 0, 0);

  // 약간 블러 후 바이너리화(깨끗한 마스크)
  ctx.filter = 'blur(1px)'; ctx.drawImage(c, 0, 0); ctx.filter = 'none';
  const id = ctx.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < id.data.length; i += 4) id.data[i + 3] = id.data[i + 3] > 16 ? 255 : 0;
  ctx.putImageData(id, 0, 0);

  return c;
}

// ---------------------------------------------------------------------
export async function autoSampleRGBFromBorder(img: HTMLImageElement): Promise<[number, number, number]> {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const pts: [number, number][] = [
    [2, 2],
    [img.naturalWidth - 3, 2],
    [2, img.naturalHeight - 3],
    [img.naturalWidth - 3, img.naturalHeight - 3],
  ];

  let r = 0, g = 0, b = 0;
  for (const [x, y] of pts) {
    const d = ctx.getImageData(x, y, 1, 1).data;
    r += d[0]; g += d[1]; b += d[2];
  }
  return [Math.round(r / pts.length), Math.round(g / pts.length), Math.round(b / pts.length)];
}

// ---------------------------------------------------------------------
// Draw image at transform → alpha-only mask
export function alphaToMaskCanvasFromImageAt(
  img: HTMLImageElement,
  stageW: number,
  stageH: number,
  xf: { x: number; y: number; scale: number; rotation: number },
): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = stageW; c.height = stageH;
  const ctx = c.getContext('2d')!;

  ctx.save();
  ctx.translate(xf.x, xf.y);
  ctx.rotate((xf.rotation * Math.PI) / 180);
  ctx.scale(xf.scale, xf.scale);
  ctx.drawImage(img, 0, 0);
  ctx.restore();

  const id = ctx.getImageData(0, 0, stageW, stageH);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = d[i + 1] = d[i + 2] = 255;           // 흑백화
    d[i + 3] = d[i + 3] > 10 ? 255 : 0;         // 바이너리 알파
  }
  ctx.putImageData(id, 0, 0);
  return c;
}

// ---------------------------------------------------------------------
export function getMaskBBox(ctx: CanvasRenderingContext2D):
  | { x: number; y: number; w: number; h: number }
  | null {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const id = ctx.getImageData(0, 0, w, h).data;

  let minX = w, minY = h, maxX = 0, maxY = 0, hit = false;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (id[(y * w + x) * 4 + 3] > 10) {
        hit = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!hit) return null;
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

// ---------------------------------------------------------------------
// Shapes → union mask paint
type PaintShape =
  | { type: 'rect'; x: number; y: number; width: number; height: number; rotation?: number }
  | { type: 'circle'; x: number; y: number; radius: number; rotation?: number };

export function paintShapesToMask(base: HTMLCanvasElement, shapes: PaintShape[]): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = base.width; c.height = base.height;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(base, 0, 0);
  ctx.fillStyle = '#fff';
  ctx.globalCompositeOperation = 'source-over';

  for (const sh of shapes) {
    ctx.save();
    ctx.translate(sh.x, sh.y);
    if (sh.rotation) ctx.rotate((sh.rotation * Math.PI) / 180);

    if (sh.type === 'rect') {
      ctx.fillRect(0, 0, sh.width, sh.height);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, sh.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  return c;
}

// ---------------------------------------------------------------------
// Ear + hole union (auto / manual)
export function unionEarAndHole(
  baseMask: HTMLCanvasElement,
  opts: {
    mode: 'auto' | 'manual';
    side: 'top' | 'left' | 'right';
    count: 1 | 2;
    holeRpx: number;
    earRpx: number;
    safePadPx: number;
    manualPositions?: { cx: number; cy: number }[];
  }
): { union: HTMLCanvasElement; holes: { cx: number; cy: number; r: number }[] } {
  const c = document.createElement('canvas');
  c.width = baseMask.width; c.height = baseMask.height;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(baseMask, 0, 0);

  const holes: { cx: number; cy: number; r: number }[] = [];

  if (opts.mode === 'manual' && opts.manualPositions?.length) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#fff';
    for (const p of opts.manualPositions) {
      ctx.beginPath(); ctx.arc(p.cx, p.cy, opts.earRpx, 0, Math.PI * 2); ctx.fill();
      holes.push({ cx: p.cx, cy: p.cy, r: opts.holeRpx });
    }
  } else {
    const bbox = getMaskBBox(ctx);
    if (bbox) {
      let cx = (bbox.x + bbox.x + bbox.w) / 2;
      let cy = bbox.y + opts.safePadPx;
      if (opts.side === 'left') { cx = bbox.x + opts.safePadPx; cy = (bbox.y + bbox.y + bbox.h) / 2; }
      if (opts.side === 'right') { cx = bbox.x + bbox.w - opts.safePadPx; cy = (bbox.y + bbox.y + bbox.h) / 2; }

      const push = (x: number, y: number) => {
        ctx.beginPath(); ctx.arc(x, y, opts.earRpx, 0, Math.PI * 2); ctx.fill();
        holes.push({ cx: x, cy: y, r: opts.holeRpx });
      };

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#fff';

      if (opts.count === 1) push(cx, cy);
      else {
        const gap = opts.safePadPx * 3;
        if (opts.side === 'top') {
          push(clamp(cx - gap, bbox.x + opts.safePadPx, bbox.x + bbox.w - opts.safePadPx), cy);
          push(clamp(cx + gap, bbox.x + opts.safePadPx, bbox.x + bbox.w - opts.safePadPx), cy);
        } else {
          push(cx, clamp(cy - gap, bbox.y + opts.safePadPx, bbox.y + bbox.h - opts.safePadPx));
          push(cx, clamp(cy + gap, bbox.y + opts.safePadPx, bbox.y + bbox.h - opts.safePadPx));
        }
      }
    }
  }

  // drill holes
  ctx.globalCompositeOperation = 'destination-out';
  for (const h of holes) { ctx.beginPath(); ctx.arc(h.cx, h.cy, h.r, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalCompositeOperation = 'source-over';

  return { union: c, holes };
}

// ---------------------------------------------------------------------
export function offsetMaskByPixels(src: HTMLCanvasElement, deltaPx: number): HTMLCanvasElement {
  const w = src.width, h = src.height;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;

  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(src, 0, 0);

  // 알파 → 값 채널로 복사
  let id = ctx.getImageData(0, 0, w, h);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3];
    d[i] = d[i + 1] = d[i + 2] = a;
    d[i + 3] = 255;
  }
  ctx.putImageData(id, 0, 0);

  // blur로 팽창/수축
  const blur = Math.abs(deltaPx);
  ctx.filter = `blur(${Math.max(1, blur)}px)`; ctx.drawImage(c, 0, 0); ctx.filter = 'none';

  id = ctx.getImageData(0, 0, w, h);
  const dd = id.data;
  for (let i = 0; i < dd.length; i += 4) {
    const v = dd[i];
    const on = deltaPx > 0 ? v > 10 : v > 200;
    dd[i] = dd[i + 1] = dd[i + 2] = 255;
    dd[i + 3] = on ? 255 : 0;
  }
  ctx.putImageData(id, 0, 0);
  return c;
}

// ---------------------------------------------------------------------
export function traceContourFromAlphaCanvas(mask: HTMLCanvasElement): Pt[] {
  const w = mask.width, h = mask.height;
  const ctx = mask.getContext('2d')!;
  const data = ctx.getImageData(0, 0, w, h).data;
  const at = (x: number, y: number): 0 | 1 => (data[(y * w + x) * 4 + 3] > 10 ? 1 : 0);

  // 시작점 찾기
  let sx = -1, sy = -1;
  outer: for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (at(x, y)) { sx = x; sy = y; break outer; }
    }
  }
  if (sx < 0) return [];

  const dirs: Array<[number, number]> = [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
  let cx = sx, cy = sy, dir = 0;
  const pts: Pt[] = [];

  for (let step = 0; step < w * h * 4; step++) {
    pts.push({ x: cx, y: cy });
    let found = false;
    for (let k = 0; k < 8; k++) {
      const nd = (dir + 7 + k) % 8;
      const nx = cx + dirs[nd][0], ny = cy + dirs[nd][1];
      if (nx >= 0 && ny >= 0 && nx < w && ny < h && at(nx, ny)) {
        cx = nx; cy = ny; dir = nd; found = true; break;
      }
    }
    if (!found) break;
    if (cx === sx && cy === sy && pts.length > 10) break;
  }
  return simplifyPolyline(pts, 0.8);
}

// RDP 단순화
export function simplifyPolyline(pts: Pt[], tol: number = 1): Pt[] {
  if (pts.length < 3) return pts;
  const first = pts[0];
  const last = pts[pts.length - 1];

  const perpDist = (p: Pt, a: Pt, b: Pt): number => {
    const A = p.x - a.x, B = p.y - a.y, C = b.x - a.x, D = b.y - a.y;
    const dot = A * C + B * D;
    const len = C * C + D * D;
    const t = clamp(len ? dot / len : 0, 0, 1);
    const x = a.x + C * t, y = a.y + D * t;
    return Math.hypot(p.x - x, p.y - y);
  };

  let idx = 0, maxDist = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpDist(pts[i], first, last);
    if (d > maxDist) { maxDist = d; idx = i; }
  }

  if (maxDist > tol) {
    const leftPts: Pt[] = simplifyPolyline(pts.slice(0, idx + 1), tol);
    const rightPts: Pt[] = simplifyPolyline(pts.slice(idx), tol);
    return leftPts.slice(0, -1).concat(rightPts);
  }
  return [first, last];
}

// ---------------------------------------------------------------------
export const polyToPathShape = (poly: Pt[]): { path: Pt[] } => ({ path: poly });
