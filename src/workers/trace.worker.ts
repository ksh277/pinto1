// Trace Worker (no React import)
export type Msg =
  | { type: 'trace', payload: { imageBitmap: ImageBitmap, W:number, H:number,
        xf:{x:number;y:number;scaleX:number;scaleY:number;rotation:number},
        hole:{ mode:'auto'|'manual', side:'top'|'left'|'right', count:1|2,
               holeRpx:number, earRpx:number, safePadPx:number, manual?:{cx:number;cy:number}[] },
        offsets:{ cut:number; white:number } } };

// ===== trace.worker.ts =====
// trace.ts에서 필요한 함수 복사 (OffscreenCanvas/worker 호환)
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

function getMaskBBox(ctx: OffscreenCanvasRenderingContext2D) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const id = ctx.getImageData(0, 0, w, h).data;
  let minX = w, minY = h, maxX = 0, maxY = 0, hit = false;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (id[(y * w + x) * 4 + 3] > 10) { hit = true; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  if (!hit) return null;
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function unionEarAndHole(
  baseMask: OffscreenCanvas,
  opts: {
    mode: 'auto' | 'manual';
    side: 'top' | 'left' | 'right';
    count: 1 | 2;
    holeRpx: number;
    earRpx: number;
    safePadPx: number;
    manualPositions?: { cx: number; cy: number }[];
  }
) {
  const c = new OffscreenCanvas(baseMask.width, baseMask.height);
  const ctx = c.getContext('2d')!; ctx.drawImage(baseMask, 0, 0);
  let holes: { cx: number; cy: number; r: number }[] = [];
  if (opts.mode === 'manual' && opts.manualPositions && opts.manualPositions.length) {
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
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#fff';
      const push = (x: number, y: number) => { ctx.beginPath(); ctx.arc(x, y, opts.earRpx, 0, Math.PI * 2); ctx.fill(); holes.push({ cx: x, cy: y, r: opts.holeRpx }); };
      if (opts.count === 1) push(cx, cy);
      else {
        const gap = opts.safePadPx * 3;
        if (opts.side === 'top') { push(clamp(cx - gap, bbox.x + opts.safePadPx, bbox.x + bbox.w - opts.safePadPx), cy); push(clamp(cx + gap, bbox.x + opts.safePadPx, bbox.x + bbox.w - opts.safePadPx), cy); }
        else { push(cx, clamp(cy - gap, bbox.y + opts.safePadPx, bbox.y + bbox.h - opts.safePadPx)); push(cx, clamp(cy + gap, bbox.y + opts.safePadPx, bbox.y + bbox.h - opts.safePadPx)); }
      }
    }
  }
  ctx.globalCompositeOperation = 'destination-out';
  for (const h of holes) { ctx.beginPath(); ctx.arc(h.cx, h.cy, h.r, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalCompositeOperation = 'source-over';
  return { union: c, holes };
}

function offsetMaskByPixels(src: OffscreenCanvas, deltaPx: number): OffscreenCanvas {
  const w = src.width, h = src.height;
  const c = new OffscreenCanvas(w, h);
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(src, 0, 0);
  let id = ctx.getImageData(0, 0, w, h);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) { const a = d[i + 3]; d[i] = d[i + 1] = d[i + 2] = a; d[i + 3] = 255; }
  ctx.putImageData(id, 0, 0);
  const blur = Math.abs(deltaPx);
  ctx.filter = `blur(${Math.max(1, blur)}px)`; ctx.drawImage(c, 0, 0); ctx.filter = 'none';
  id = ctx.getImageData(0, 0, w, h);
  const dd = id.data;
  for (let i = 0; i < dd.length; i += 4) {
    const v = dd[i];
    const on = deltaPx > 0 ? v > 10 : v > 200;
    dd[i] = dd[i + 1] = dd[i + 2] = 255; dd[i + 3] = on ? 255 : 0;
  }
  ctx.putImageData(id, 0, 0);
  return c;
}

function traceContourFromAlphaCanvas(mask: OffscreenCanvas): { x: number; y: number }[] {
  const w = mask.width, h = mask.height;
  const ctx = mask.getContext('2d')!;
  const data = ctx.getImageData(0, 0, w, h).data;
  const at = (x: number, y: number) => (data[(y * w + x) * 4 + 3] > 10 ? 1 : 0);
  let sx = -1, sy = -1;
  outer: for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (at(x, y)) { sx = x; sy = y; break outer; }
  if (sx < 0) return [];
  const dirs = [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
  let cx = sx, cy = sy, dir = 0;
  const pts: { x: number; y: number }[] = [];
  for (let step = 0; step < w * h * 4; step++) {
    pts.push({ x: cx, y: cy });
    let found = false;
    for (let k = 0; k < 8; k++) {
      const nd = (dir + 7 + k) % 8;
      const nx = cx + dirs[nd][0], ny = cy + dirs[nd][1];
      if (nx >= 0 && ny >= 0 && nx < w && ny < h && at(nx, ny)) { cx = nx; cy = ny; dir = nd; found = true; break; }
    }
    if (!found) break;
    if (cx === sx && cy === sy && pts.length > 10) break;
  }
  return simplifyPolyline(pts, 0.8);
}

function simplifyPolyline(pts: { x: number; y: number }[], tol = 1): { x: number; y: number }[] {
  if (pts.length < 3) return pts;
  const first = pts[0]; const last = pts[pts.length - 1];
  const perpDist = (p: any, a: any, b: any) => {
    const A = p.x - a.x, B = p.y - a.y, C = b.x - a.x, D = b.y - a.y;
    const dot = A * C + B * D; const len = C * C + D * D;
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
    const left = simplifyPolyline(pts.slice(0, idx + 1), tol);
    const right = simplifyPolyline(pts.slice(idx), tol);
    return left.slice(0, -1).concat(right);
  }
  return [first, last];
}

function polyToPathShape(poly: { x: number; y: number }[]) { return { path: poly }; }

// 워커 메시지 핸들러
self.onmessage = async (e: MessageEvent<any>) => {
  if (e.data.type !== 'trace') return;
  const { imageBitmap, W, H, xf, hole, offsets } = e.data.payload;
  // 1. 이미지 비트맵을 OffscreenCanvas에 그림
  const base = new OffscreenCanvas(W, H); const ctx = base.getContext('2d')!;
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.save(); ctx.translate(xf.x, xf.y); ctx.rotate(xf.rotation*Math.PI/180);
  ctx.scale(xf.scaleX, xf.scaleY); ctx.drawImage(imageBitmap, 0, 0); ctx.restore();
  // 2. 귀/구멍 합성
  const { union, holes } = unionEarAndHole(base, {
    mode: hole.mode,
    side: hole.side,
    count: hole.count,
    holeRpx: hole.holeRpx,
    earRpx: hole.earRpx,
    safePadPx: hole.safePadPx,
    manualPositions: hole.manual
  });
  // 3. 컷/화이트 오프셋
  const cutMask = offsetMaskByPixels(union, offsets.cut);
  const whiteMask = offsetMaskByPixels(union, offsets.white);
  // 4. 경로 추출
  const cutPoly = traceContourFromAlphaCanvas(cutMask);
  const whitePoly = traceContourFromAlphaCanvas(whiteMask);
  const boardPoly = traceContourFromAlphaCanvas(union);
  // 5. 결과 반환
  self.postMessage({ type: 'done', payload: {
    cut: polyToPathShape(cutPoly),
    white: polyToPathShape(whitePoly),
    board: polyToPathShape(boardPoly),
    holes
  } });
};
