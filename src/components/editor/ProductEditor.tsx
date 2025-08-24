'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useRef, useEffect, useMemo, useState } from 'react'
import { Stage, Layer, Line, Circle, Image as KImage, Text as KText, Transformer } from 'react-konva'
import useImage from 'use-image'
import JSZip from 'jszip'
import { useEditorStore } from '@/store/editorStore'
import type { ImageNode, TextNode } from '@/types/editor'

// --- 유틸 함수 직접 정의 (원래 '@/utils/geom'에서 import하던 것들) ---
const mmToPx = (mm: number, dpi = 300) => (mm / 25.4) * dpi;
const boundsOf = (poly: {x: number; y: number}[]) => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of poly) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
};
const closestPointOnPolyline = (poly: {x: number; y: number}[], pos: {x: number; y: number}) => {
  let best = poly[0], bestD = Infinity;
  for (const p of poly) {
    const d = Math.hypot(p.x - pos.x, p.y - pos.y);
    if (d < bestD) { bestD = d; best = p; }
  }
  return best;
};
const estimateBgRGBA = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  // 네 귀퉁이 평균값
  const img = ctx.getImageData(0, 0, w, h).data;
  const idxs = [0, (w-1)*4, (w*(h-1))*4, (w*h-1)*4];
  let r=0,g=0,b=0,a=0;
  for (const i of idxs) {
    r += img[i]; g += img[i+1]; b += img[i+2]; a += img[i+3];
  }
  return [r/4, g/4, b/4, a/4];
};
const loadHTMLImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});
const polyLength = (poly: {x: number; y: number}[]) => {
  let len = 0;
  for (let i = 1; i < poly.length; i++) {
    len += Math.hypot(poly[i].x - poly[i-1].x, poly[i].y - poly[i-1].y);
  }
  return len;
};
const pointAt = (poly: {x: number; y: number}[], t: number) => {
  const L = polyLength(poly);
  let d = t * L, i = 1;
  while (i < poly.length && d > 0) {
    const seg = Math.hypot(poly[i].x - poly[i-1].x, poly[i].y - poly[i-1].y);
    if (d < seg) {
      const ratio = d / seg;
      return {
        x: poly[i-1].x + (poly[i].x - poly[i-1].x) * ratio,
        y: poly[i-1].y + (poly[i].y - poly[i-1].y) * ratio
      };
    }
    d -= seg; i++;
  }
  return poly[poly.length-1];
};
const offsetPolyline = (poly: {x: number; y: number}[], offset: number) => {
  // 단순 평행이동(법선방향) - 실제 구현은 더 복잡해야 하지만 임시로 각 점을 중심에서 밀어냄
  const cx = poly.reduce((a, p) => a + p.x, 0) / poly.length;
  const cy = poly.reduce((a, p) => a + p.y, 0) / poly.length;
  return poly.map(p => {
    const dx = p.x - cx, dy = p.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return { x: p.x + (dx/len)*offset, y: p.y + (dy/len)*offset };
  });
};

/* ---------------------------------------------
 * Web Worker (배경제거)
 * ------------------------------------------- */
const makeWorker = () =>
  // ⚠️ 경로는 이 파일 위치 기준: src/components/editor → src/workers
  new Worker(new URL('../../workers/removeBg.worker.ts', import.meta.url), { type: 'module' })

/* ---------------------------------------------
 * marching squares (알파 외곽선 추출)
 * - 워커 결과(알파마스크)에서 컨투어를 뽑아 컷라인으로 사용
 * ------------------------------------------- */
function marchingSquaresAlpha(data: Uint8ClampedArray, w: number, h: number) {
  const inside = (x: number, y: number) => data[(y * w + x) * 4 + 3] > 0
  const path: { x: number; y: number }[] = []

  // 시작점(좌상단 첫 non-zero)
  let sx = -1, sy = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) { if (inside(x, y)) { sx = x; sy = y; break } }
    if (sx !== -1) break
  }
  if (sx === -1) return path

  // 경로 추적
  let x = sx, y = sy, dir = 0 // 0:R 1:D 2:L 3:U
  const seen = new Set<string>()
  for (let k = 0; k < w * h * 6; k++) {
    const key = `${x},${y},${dir}`
    if (seen.has(key)) break
    seen.add(key)
    path.push({ x, y })

    const R = inside(Math.min(w - 1, x + 1), y)
    const D = inside(x, Math.min(h - 1, y + 1))
    const L = inside(Math.max(0, x - 1), y)
    const U = inside(x, Math.max(0, y - 1))

    if (dir === 0) { if (R) x++; else if (D) { dir = 1; y++; } else { dir = 3; y--; } }
    else if (dir === 1) { if (D) y++; else if (L) { dir = 2; x--; } else { dir = 0; x++; } }
    else if (dir === 2) { if (L) x--; else if (U) { dir = 3; y--; } else { dir = 1; y++; } }
    else { if (U) y--; else if (R) { dir = 0; x++; } else { dir = 2; x--; } }

    if (x === sx && y === sy && path.length > 12) break
  }

  // RDP 단순화 (유틸에 있음)
  // 여기선 간단히 그대로 반환 → 이후 offsetPolyline에서 부드럽게 보정됨
  return path
}

/* ---------------------------------------------
 * SVG path helper
 * ------------------------------------------- */
function toPathD(poly: { x: number; y: number }[]) {
  return `M ${poly.map(p => `${p.x},${p.y}`).join(' L ')} Z`
}

/* ---------------------------------------------
 * 기본 템플릿(라운드 사각 바디 + 상단 탭 + 기본 홀)
 * ------------------------------------------- */
function makeKeyringTemplatePaths(
  W: number, H: number, BLEED: number, bodyR = 24, tabR = 36
) {
  const x = BLEED, y = BLEED + tabR
  const w = W - 2 * BLEED, h = (H - 2 * BLEED) - tabR
  const cx = W / 2, cy = BLEED + tabR
  const hole = { x: cx, y: cy }

  const circlePts: { x: number; y: number }[] = []
  const N = 48
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2
    circlePts.push({ x: cx + tabR * Math.cos(t), y: cy + tabR * Math.sin(t) })
  }
  const arc = (cx: number, cy: number, r: number, from: number, to: number, steps = 10) => {
    const out: { x: number; y: number }[] = []
    for (let i = 0; i <= steps; i++) {
      const t = from + (to - from) * (i / steps)
      out.push({ x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) })
    }
    return out
  }
  const rectPts: { x: number; y: number }[] = []
  rectPts.push({ x: x + bodyR, y })
  rectPts.push({ x: x + w - bodyR, y })
  rectPts.push(...arc(x + w - bodyR, y + bodyR, bodyR, -Math.PI / 2, 0))
  rectPts.push({ x: x + w, y: y + bodyR })
  rectPts.push({ x: x + w, y: y + h - bodyR })
  rectPts.push(...arc(x + w - bodyR, y + h - bodyR, bodyR, 0, Math.PI / 2))
  rectPts.push({ x: x + w - bodyR, y: y + h })
  rectPts.push({ x: x + bodyR, y: y + h })
  rectPts.push(...arc(x + bodyR, y + h - bodyR, bodyR, Math.PI / 2, Math.PI))
  rectPts.push({ x: x, y: y + h - bodyR })
  rectPts.push({ x: x, y: y + bodyR })
  rectPts.push(...arc(x + bodyR, y + bodyR, bodyR, Math.PI, 3 * Math.PI / 2))

  return { polyline: [...circlePts, ...rectPts], hole }
}

/* =================================================================
 * ProductEditor
 * ================================================================= */
export function ProductEditor() {
  const store = useEditorStore() as any
  const { nodes, selectedIds } = store.state
  const selSet = new Set(selectedIds)
  const stageRef = useRef<any>(null)

  const dpi = store.state.size.dpi
  const cutMM = store.state.size.cutMM ?? 8
  const bleedMM = store.state.size.bleedMM ?? 15
  const CUT = mmToPx(cutMM, dpi)
  const BLEED = mmToPx(bleedMM, dpi)
  const W = store.state.stageWidth
  const H = store.state.stageHeight

  /* ---------- 초기 템플릿 ---------- */
  useEffect(() => {
    if (!store.state.boardPath?.path?.length && !store.state.cutlinePath?.path?.length) {
      const { polyline, hole } = makeKeyringTemplatePaths(W, H, BLEED, 24, 36)
      store.setPaths({ path: polyline }, { path: polyline })
      store.setHole(hole.x, hole.y)
      if (store.setHoles) store.setHoles([{ ...hole, diameterMM: store.state.hole?.diameterMM ?? 5 }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---------- 배경제거(워커) + 자동맞춤 ---------- */
  const [rmThresh, setRmThresh] = useState(28)
  const [removing, setRemoving] = useState(false)
  const [worker, setWorker] = useState<Worker | null>(null)
  useEffect(() => { const w = makeWorker(); setWorker(w); return () => w.terminate() }, [])

  const handleRemoveBg = async () => {
    const firstImg = nodes.find((n: any) => n.type === 'image') as ImageNode | undefined
    if (!firstImg || !worker) return
    setRemoving(true)
    try {
      const imgEl = await loadHTMLImage(firstImg.src)
      const w = imgEl.naturalWidth, h = imgEl.naturalHeight
      const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!
      ctx.drawImage(imgEl, 0, 0)

      const bg = estimateBgRGBA(ctx, w, h)
      const img = ctx.getImageData(0, 0, w, h)

      const poly = await new Promise<{ x: number; y: number }[]>((resolve, reject) => {
        worker.onmessage = (ev: MessageEvent<ImageData>) => {
          try {
            const imgOut = ev.data
            ctx.putImageData(imgOut, 0, 0)
            const p = marchingSquaresAlpha(imgOut.data, w, h)
            if (p.length < 3) return reject(new Error('Contour not found'))
            resolve(p)
          } catch (err) { reject(err) }
        }
        worker.postMessage({ imgData: img, bg, thresh: rmThresh, feather: 6, matte: [255, 255, 255] }, [img.data.buffer])
      })

      // BLEED 사각 안에 최대 맞춤
      const bbox = boundsOf(poly)
      const target = { x: BLEED, y: BLEED, w: W - 2 * BLEED, h: H - 2 * BLEED }
      const scale = Math.min(target.w / bbox.w, target.h / bbox.h)
      const offset = {
        x: target.x + (target.w - bbox.w * scale) / 2 - bbox.x * scale,
        y: target.y + (target.h - bbox.h * scale) / 2 - bbox.y * scale
      }
      const fittedPoly = poly.map(p => ({ x: p.x * scale + offset.x, y: p.y * scale + offset.y }))

      // 이미지 교체 & 위치/스케일 적용
      const newSrc = canvas.toDataURL('image/png')
      store.updateNode(firstImg.id, {
        src: newSrc,
        x: (firstImg.x || 0) * scale + offset.x,
        y: (firstImg.y || 0) * scale + offset.y,
        scaleX: (firstImg.scaleX || 1) * scale,
        scaleY: (firstImg.scaleY || 1) * scale,
      })

      // 컷라인/보드 = 컨투어로 업데이트
      store.setPathsAfterAutoFit({ boardPath: { path: fittedPoly }, cutlinePath: { path: fittedPoly } })
    } finally { setRemoving(false) }
  }

  /* ---------- 줌/팬 ---------- */
  const onWheel = (e: any) => {
    e.evt.preventDefault()
    const stage = stageRef.current; if (!stage) return
    const old = store.ui.zoom
    const by = 1.05
    const ns = e.evt.deltaY > 0 ? old / by : old * by
    const pointer = stage.getPointerPosition()
    if (pointer) {
      const mouse = { x: (pointer.x - stage.x()) / old, y: (pointer.y - stage.y()) / old }
      stage.scale({ x: ns, y: ns })
      stage.position({ x: pointer.x - mouse.x * ns, y: pointer.y - mouse.y * ns })
      stage.batchDraw()
    }
    store.setZoom(ns)
  }

  /* ---------- 컷라인/안전경로/홀 ---------- */
  const cutPolyline = useMemo(() => {
  if (store.state.cutlinePath?.path?.length) return store.state.cutlinePath.path as { x: number; y: number }[]
    return [{ x: CUT, y: CUT }, { x: W - CUT, y: CUT }, { x: W - CUT, y: H - CUT }, { x: CUT, y: H - CUT }]
  }, [store.cutlinePath, W, H, CUT])

  // 안전경로(safe), kiss-cut (있으면 표시)
  const safePath = useMemo(() => cutPolyline.length ? offsetPolyline(cutPolyline, -mmToPx(2, dpi)) : [], [cutPolyline, dpi])
  const kissPath = useMemo(() => cutPolyline.length ? offsetPolyline(cutPolyline, -mmToPx(0.3, dpi)) : [], [cutPolyline, dpi])

  const projectHole = (pos: { x: number; y: number }) => closestPointOnPolyline(cutPolyline, pos)
  const holeRadiusPx = mmToPx(store.state.hole?.diameterMM ?? 5, dpi) / 2
  const onHoleDrag = (i: number) => (e: any) => {
    const stage = e.target.getStage()
    const pointer = stage?.getPointerPosition()
    if (!pointer) return
    const p = projectHole(pointer)
    store.updateHoleAt?.(i, { x: p.x, y: p.y })
  }

  /* =================================================================
   * UI
   * ================================================================= */
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* 상단 툴바 */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-3 bg-white/85 backdrop-blur border-b px-4 py-2">
        <button
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          onClick={() => store.setPanning(!store.ui.isPanning)}
        >
          {store.ui.isPanning ? '팬(이동) ON' : '팬 OFF'}
        </button>

        <button
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          onClick={handleRemoveBg}
          disabled={removing}
        >
          {removing ? '배경제거 중…' : '배경제거'}
        </button>

        <div className="ml-2 flex items-center gap-2 text-xs">
          <span className="text-gray-500">임계값</span>
          <input type="range" min={10} max={60} value={rmThresh} onChange={(e) => setRmThresh(Number(e.target.value))} />
          <span className="w-8 text-center">{rmThresh}</span>
        </div>

        <div className="ml-2 flex items-center gap-2">
          <button className="border rounded px-2 py-1" onClick={() => (useEditorStore as any).temporal.undo()}>
            되돌리기
          </button>
          <button className="border rounded px-2 py-1" onClick={() => (useEditorStore as any).temporal.redo()}>
            다시하기
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
          <span>줌</span>
          <button className="border rounded px-2 py-0.5" onClick={() => store.setZoom(store.ui.zoom / 1.1)}>-</button>
          <span className="w-10 text-center">{Math.round(store.ui.zoom * 100)}%</span>
          <button className="border rounded px-2 py-0.5" onClick={() => store.setZoom(store.ui.zoom * 1.1)}>+</button>
        </div>
      </div>

      {/* 캔버스 */}
      <div className="relative mx-auto min-h-[560px] w-full max-w-[1400px] bg-neutral-100">
        <div className="m-6 rounded-md border border-dashed border-gray-300 bg-white/90 p-4 shadow-inner">
          <Stage
            ref={stageRef}
            width={W}
            height={H}
            scaleX={store.ui.zoom}
            scaleY={store.ui.zoom}
            draggable={store.ui.isPanning}
            onWheel={onWheel}
            onMouseDown={(e: any) => { if (e.target === e.target.getStage()) store.select([]) }}
            style={{ background: '#f7f7f7', borderRadius: 8 }}
          >
            {/* 가이드 + 컷라인 */}
            <Layer listening={false}>
              <Line
                points={[BLEED, BLEED, W - BLEED, BLEED, W - BLEED, H - BLEED, BLEED, H - BLEED]}
                closed stroke="#f59e0b" dash={[4, 4]} strokeWidth={2}
              />
              <Line
                points={[CUT, CUT, W - CUT, CUT, W - CUT, H - CUT, CUT, H - CUT]}
                closed stroke="#ef4444" dash={[8, 6]} strokeWidth={2}
              />

              {store.boardPath?.path?.length
                ? <Line points={store.boardPath.path.flatMap((p: any) => [p.x, p.y])} closed stroke="#9ca3af" strokeWidth={2} fill="#fff" />
                : null}

              {store.cutlinePath?.path?.length
                ? <Line points={store.cutlinePath.path.flatMap((p: any) => [p.x, p.y])} closed stroke="#3b82f6" strokeWidth={2} />
                : null}

              {safePath?.length
                ? <Line points={safePath.flatMap((p: {x: number; y: number}) => [p.x, p.y])} closed stroke="#10b981" dash={[6, 6]} strokeWidth={1} />
                : null}

              {kissPath?.length
                ? <Line points={kissPath.flatMap((p: {x: number; y: number}) => [p.x, p.y])} closed stroke="#8b5cf6" dash={[6, 6]} strokeWidth={1} />
                : null}
            </Layer>

            {/* 디자인 노드들 */}
            <Layer>
              {nodes.map((n: any) => {
                const isSel = selSet.has(n.id)
                if (n.type === 'image') return <ImageNodeView key={n.id} node={n} isSelected={isSel} />
                if (n.type === 'text') return <TextNodeView key={n.id} node={n} isSelected={isSel} />
                return null
              })}

              {/* 드릴홀(여러개 지원) */}
              {(store.holes && store.holes.length ? store.holes : (store.hole ? [store.hole] : []))
                .map((h: any, i: number) => (
                  <Circle
                    key={`hole-${i}`}
                    x={h.x}
                    y={h.y}
                    radius={mmToPx((h.diameterMM ?? store.hole?.diameterMM ?? 5), dpi) / 2}
                    stroke="#111"
                    strokeWidth={1}
                    fill="#fff"
                    draggable
                    dragBoundFunc={(pos) => projectHole(pos)}
                    onDragMove={onHoleDrag(i)}
                  />
                ))}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* 하단 컨트롤 */}
      <ToolbarBottom
        W={W} H={H} dpi={dpi}
        cutMM={cutMM} bleedMM={bleedMM}
        cutPolyline={cutPolyline}
        holeRadiusPx={holeRadiusPx}
      />
    </div>
  )
}

/* =================================================================
 * 하단 툴바 (사이즈/여백/홀/배치/내보내기)
 * ================================================================= */
function ToolbarBottom({
  W, H, dpi, cutMM, bleedMM, cutPolyline, holeRadiusPx
}: {
  W: number; H: number; dpi: number; cutMM: number; bleedMM: number;
  cutPolyline: { x: number; y: number }[]; holeRadiusPx: number
}) {
  const store = useEditorStore() as any

  // 홀 등간 배치
  const [count, setCount] = useState(1)
  const [dir, setDir] = useState<'top' | 'bottom' | 'left' | 'right' | 'around'>('top')

  const applyHoles = () => {
    const bb = boundsOf(cutPolyline)
    const pad = holeRadiusPx + 2
    const pts: { x: number; y: number }[] = []
    if (dir === 'around') {
      const step = 1 / (count)
      for (let i = 0; i < count; i++) pts.push(pointAt(cutPolyline, (i + 0.5) * step))
    } else if (dir === 'top') {
      for (let i = 0; i < count; i++) {
        const t = (i + 1) / (count + 1)
        const x = bb.x + pad + t * (bb.w - pad * 2)
        const y = bb.y + pad
        pts.push(closestPointOnPolyline(cutPolyline, { x, y }))
      }
    } else if (dir === 'bottom') {
      for (let i = 0; i < count; i++) {
        const t = (i + 1) / (count + 1)
        const x = bb.x + pad + t * (bb.w - pad * 2)
        const y = bb.y + bb.h - pad
        pts.push(closestPointOnPolyline(cutPolyline, { x, y }))
      }
    } else if (dir === 'left') {
      for (let i = 0; i < count; i++) {
        const t = (i + 1) / (count + 1)
        const x = bb.x + pad
        const y = bb.y + pad + t * (bb.h - pad * 2)
        pts.push(closestPointOnPolyline(cutPolyline, { x, y }))
      }
    } else {
      for (let i = 0; i < count; i++) {
        const t = (i + 1) / (count + 1)
        const x = bb.x + bb.w - pad
        const y = bb.y + pad + t * (bb.h - pad * 2)
        pts.push(closestPointOnPolyline(cutPolyline, { x, y }))
      }
    }
    store.setHoles?.(pts.map(p => ({ ...p, diameterMM: store.hole?.diameterMM ?? 5 })))
  }

  // 내보내기 (PNG + SVG 컷라인)
  async function exportPrintReady(filename = 'print_ready.zip') {
    const stage = (document.querySelector('canvas') as any)?.__konvaNode?.getStage?.()
    if (!stage) return
    const prev = { sx: stage.scaleX(), sy: stage.scaleY(), x: stage.x(), y: stage.y() }
    stage.scale({ x: 1, y: 1 }); stage.position({ x: 0, y: 0 }); stage.draw()
    const png = stage.toDataURL({ pixelRatio: 1 })
    stage.scale({ x: prev.sx, y: prev.sy }); stage.position({ x: prev.x, y: prev.y }); stage.draw()

    const holes = (store.holes && store.holes.length ? store.holes : (store.hole ? [store.hole] : []))
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
        <path d="${toPathD(cutPolyline)}" fill="none" stroke="#FF00FF" stroke-width="1" data-spot="CutContour"/>
        ${holes.map((h: any) => `<circle cx="${h.x}" cy="${h.y}" r="${mmToPx((h.diameterMM ?? 5), dpi) / 2}" fill="none" stroke="#FF00FF" stroke-width="1"/>`).join('\n')}
      </svg>`.trim()

    const zip = new JSZip()
    zip.file('design_300dpi.png', png.split(',')[1], { base64: true })
    zip.file('cutline.svg', svg)
    const blob = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click()
  }

  return (
    <div className="sticky bottom-0 z-20 border-t bg-white/90 backdrop-blur px-4 py-2">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        {/* 사이즈 */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500">사이즈</span>
          <select
            className="border rounded px-2 py-1"
            value={`${store.state.size.widthMM}x${store.state.size.heightMM}`}
            onChange={(e) => {
              const [wmm, hmm] = e.target.value.split('x').map(Number)
              store.setSizeMM(wmm, hmm)
            }}
          >
            {[20, 25, 30, 35, 40, 45, 50, 60].map(mm => (
              <option key={mm} value={`${mm}x${mm}`}>{mm} x {mm} mm</option>
            ))}
          </select>
        </div>

        {/* 절단/안전 여백 */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500">절단여백</span>
     <input className="w-16 border rounded px-2 py-1 text-right" defaultValue={cutMM}
       onBlur={(e) => store.setOffsets(Number(e.target.value) || 8, store.state.offsets.cutOffsetMM)} /> <span>mm</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">안전여백</span>
     <input className="w-16 border rounded px-2 py-1 text-right" defaultValue={bleedMM}
       onBlur={(e) => store.setOffsets(store.state.offsets.borderMM, Number(e.target.value) || 15)} /> <span>mm</span>
        </div>

        {/* 홀 지름 */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500">홀 지름</span>
     <input className="w-16 border rounded px-2 py-1 text-right" defaultValue={store.state.hole?.diameterMM || 5}
       onBlur={(e) => store.setHole(store.state.hole.x, store.state.hole.y, Number(e.target.value) || 5)} /> <span>mm</span>
        </div>

        {/* 홀 배치 컨트롤 */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500">홀 배치</span>
          <input className="w-14 border rounded px-2 py-1 text-right" type="number" min={1} max={10}
                 value={count} onChange={(e) => setCount(Math.max(1, Math.min(10, Number(e.target.value) || 1)))} />
          <select className="border rounded px-2 py-1" value={dir} onChange={(e) => setDir(e.target.value as any)}>
            <option value="top">상단</option>
            <option value="bottom">하단</option>
            <option value="left">좌측</option>
            <option value="right">우측</option>
            <option value="around">둘레 등간</option>
          </select>
          <button className="border rounded px-3 py-1 hover:bg-gray-50" onClick={applyHoles}>배치</button>
        </div>

        {/* 내보내기 */}
        <div className="flex items-center gap-2">
          <button className="border rounded px-3 py-1 hover:bg-gray-50" onClick={() => exportPrintReady()}>
            내보내기(PNG+SVG)
          </button>
        </div>
      </div>
    </div>
  )
}

/* =================================================================
 * 노드 뷰
 * ================================================================= */
function ImageNodeView({ node, isSelected }: { node: ImageNode, isSelected: boolean }) {
  const ref = useRef<any>(null)
  const trRef = useRef<any>(null)
  const [img] = useImage(node.src, 'anonymous')
  const { select, updateNode } = useEditorStore() as any

  useEffect(() => {
    if (isSelected && trRef.current && ref.current) {
      trRef.current.nodes([ref.current]); trRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected])

  return (
    <>
      <KImage
        ref={ref} image={img || undefined}
        x={node.x} y={node.y} rotation={node.rotation} opacity={node.opacity}
        scaleX={node.scaleX} scaleY={node.scaleY} draggable={!node.locked}
        onClick={() => select([node.id])} onTap={() => select([node.id])}
        onDragEnd={(e: any) => updateNode(node.id, { x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const n = ref.current
          updateNode(node.id, { x: n.x(), y: n.y(), rotation: n.rotation(), scaleX: n.scaleX(), scaleY: n.scaleY() })
        }}
      />
      {isSelected && <Transformer ref={trRef} rotateEnabled boundBoxFunc={(o, n) => ({ ...n, width: Math.max(n.width, 10), height: Math.max(n.height, 10) })} />}
    </>
  )
}

function TextNodeView({ node, isSelected }: { node: TextNode, isSelected: boolean }) {
  const ref = useRef<any>(null)
  const trRef = useRef<any>(null)
  const { select, updateNode } = useEditorStore() as any

  useEffect(() => {
    if (isSelected && trRef.current && ref.current) {
      trRef.current.nodes([ref.current]); trRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected])

  return (
    <>
      <KText
        ref={ref} text={node.text}
        x={node.x} y={node.y} rotation={node.rotation}
        scaleX={node.scaleX} scaleY={node.scaleY}
        fontFamily={node.fontFamily} fontSize={node.fontSize} fill={node.fill}
        draggable={!node.locked}
        onClick={() => select([node.id])} onTap={() => select([node.id])}
        onDragEnd={(e: any) => useEditorStore.getState().updateNode(node.id, { x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const n = ref.current
          updateNode(node.id, { x: n.x(), y: n.y(), rotation: n.rotation(), scaleX: n.scaleX(), scaleY: n.scaleY() })
        }}
      />
      {isSelected && <Transformer ref={trRef} rotateEnabled boundBoxFunc={(o, n) => ({ ...n, width: Math.max(n.width, 8), height: Math.max(n.height, 8) })} />}
    </>
  )
}
