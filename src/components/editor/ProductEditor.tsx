'use client';

/**
 * ProductEditor.tsx (cleaned & type-safe)
 * - Tool system: select / hole(once) / sample
 * - Pan only on Space (no accidental stage drag)
 * - Grid snap toggle (0.5mm), Arrow nudge (Shift=2.5mm)
 * - Hi-DPI preview/export, PNG/PDF export
 * - Alt+Click to sample background color
 * - Safe margin, guides, rulers, center-snap on image drag
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Stage,
  Layer,
  Image as KImage,
  Line,
  Rect,
  Circle,
  Group,
  Transformer,
} from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { jsPDF } from 'jspdf';

// Pinto integrations (경로 별칭 @/* 가 tsconfig에 설정되어 있어야 함)
import TuiImageEditorModal from '@/components/editor/integrations/TuiImageEditorModal';
import ThreePreview from '@/components/editor/integrations/ThreePreview';
import { fitContain } from '@/lib/editor/konvaAdapters';
import { useEditorStore } from '@/store/editorStore';
import {
  autoSampleRGBFromBorder,
  loadHtmlImage,
  mm2px,
  px2mm,
  offsetMaskByPixels,
  paintShapesToMask,
  polyToPathShape,
  traceContourFromAlphaCanvas,
  unionEarAndHole,
} from '@/lib/editor/trace';
import type { AnyShape, ShapeType } from '@/types/editor';

/* ----------------------------- util ------------------------------ */
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const snapTo = (v: number, step: number) => Math.round(v / step) * step;
const GRID_STEP_MM = 0.5;
type Tool = 'select' | 'hole' | 'sample';

function imageNodeToMaskCanvas(
  img: HTMLImageElement,
  W: number,
  H: number,
  xf: { x: number; y: number; scaleX: number; scaleY: number; rotation: number },
): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.save();
  ctx.translate(xf.x, xf.y);
  ctx.rotate((xf.rotation * Math.PI) / 180);
  ctx.scale(xf.scaleX, xf.scaleY);
  ctx.drawImage(img, 0, 0);
  ctx.restore();

  // make alpha-only mask
  const id = ctx.getImageData(0, 0, W, H);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = d[i + 1] = d[i + 2] = 255;
    d[i + 3] = d[i + 3] > 10 ? 255 : 0;
  }
  ctx.putImageData(id, 0, 0);
  return c;
}

const setStageCursor = (node: any, cursor: string) => {
  try {
    const st = node?.getStage?.();
    const el: HTMLDivElement | undefined = st?.container?.();
    if (el) el.style.cursor = cursor;
  } catch {}
};

/** Nearest point on a polyline (for snapping the hole onto path) */
function nearestOnPolyline(
  poly: Array<{ x: number; y: number }>,
  p: { x: number; y: number },
): { x: number; y: number } {
  if (!poly || poly.length < 2) return p;
  let bestX = poly[0].x,
    bestY = poly[0].y,
    bestD = Number.POSITIVE_INFINITY;
  for (let i = 0; i < poly.length - 1; i++) {
    const ax = poly[i].x,
      ay = poly[i].y;
    const bx = poly[i + 1].x,
      by = poly[i + 1].y;
    const abx = bx - ax,
      aby = by - ay;
    const denom = abx * abx + aby * aby || 1;
    const t = Math.max(
      0,
      Math.min(1, ((p.x - ax) * abx + (p.y - ay) * aby) / denom),
    );
    const qx = ax + abx * t,
      qy = ay + aby * t;
    const dx = p.x - qx,
      dy = p.y - qy;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      bestX = qx;
      bestY = qy;
    }
  }
  return { x: bestX, y: bestY };
}

/* ----------------------------- component ------------------------------ */

export default function ProductEditor() {
  // --- Integration State ---
  const [showTui, setShowTui] = useState(false);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const [show3D, setShow3D] = useState(false);
  const [stageDataUrl, setStageDataUrl] = useState<string>('');
  const [fitMode, setFitMode] = useState<'fit' | 'cover'>('fit');
  const [useServerRembg, setUseServerRembg] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  // store
  const s = useEditorStore();

  // refs
  const stageRef = useRef<any>(null);
  const imgNodeRef = useRef<any>(null);
  const imgTrRef = useRef<any>(null);
  const shapeTrRef = useRef<any>(null);

  // image
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [imgScale, setImgScale] = useState({ x: 1, y: 1 });

  // shapes
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);

  // viewport
  const [viewScale, setViewScale] = useState(2.5);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const [shiftDown, setShiftDown] = useState(false);

  // tools & display
  const [tool, setTool] = useState<Tool>('select');
  const [snapGrid, setSnapGrid] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [showSafe, setShowSafe] = useState(true);
  const [showRuler, setShowRuler] = useState(true);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  // board size
  const W = Math.round(mm2px(s.size.widthMM, s.dpi));
  const H = Math.round(mm2px(s.size.heightMM, s.dpi));

  // image url
  const currentUrl = useMemo(() => {
    const i = s.images.selected;
    if (i < 0) return null;
    return s.images.processed[i] || s.images.originals[i];
  }, [s.images]);

  /* ------------------------ integrations ------------------------ */
  const openTui = () => {
    if (!imgEl || !currentUrl) return;
    setEditorSrc(currentUrl);
    setShowTui(true);
  };

  const handleTuiApply = (blob: Blob) => {
    if (!imgEl) return;
    const url = URL.createObjectURL(blob);
    if (s.images.selected >= 0 && s.images.processed[s.images.selected]) {
      URL.revokeObjectURL(s.images.processed[s.images.selected]!);
    }
    useEditorStore.getState().setProcessedUrlForSelected(url);
    const { w, x, y } = fitContain(
      imgEl.width,
      imgEl.height,
      W,
      H,
      fitMode,
    );
    useEditorStore
      .getState()
      .setTransform({ x, y, scale: w / imgEl.width, rotation: 0 });
    setShowTui(false);
    setApplied(true);
    setTimeout(() => setApplied(false), 1500);
  };

  const handleRemoveBg = async () => {
    if (!imgEl || !currentUrl) return;
    setLoading('rembg');
    setError(null);
    try {
      let blob: Blob | null = null;
      if (useServerRembg) {
        const fd = new FormData();
        fd.append('file', await (await fetch(currentUrl)).blob());
        const res = await fetch('/api/remove-bg', {
          method: 'POST',
          body: fd,
        });
        if (!res.ok) {
          setError('배경제거 실패');
          console.error(await res.text());
          return;
        }
        blob = await res.blob();
      } else {
        setError('로컬 REMBG 미지원');
        return;
      }
      if (blob) {
        if (s.images.selected >= 0 && s.images.processed[s.images.selected]) {
          URL.revokeObjectURL(s.images.processed[s.images.selected]!);
        }
        const url = URL.createObjectURL(blob);
        useEditorStore.getState().setProcessedUrlForSelected(url);
        const { w, x, y } = fitContain(
          imgEl.width,
          imgEl.height,
          W,
          H,
          fitMode,
        );
        useEditorStore
          .getState()
          .setTransform({ x, y, scale: w / imgEl.width, rotation: 0 });
        setApplied(true);
        setTimeout(() => setApplied(false), 1500);
      }
    } catch (e) {
      setError('배경제거 오류');
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const toggleFitMode = () => {
    if (!imgEl) return;
    const next = fitMode === 'fit' ? 'cover' : 'fit';
    setFitMode(next);
    const { w, x, y } = fitContain(imgEl.width, imgEl.height, W, H, next);
    useEditorStore
      .getState()
      .setTransform({ x, y, scale: w / imgEl.width, rotation: 0 });
  };

  const open3D = () => {
    const ratio = s.ui.previewPixelRatio ?? 2;
    const dataUrl = stageRef.current
      .getStage()
      .toDataURL({ pixelRatio: ratio });
    setStageDataUrl(dataUrl);
    setShow3D(true);
  };

  useEffect(() => {
    const handler = () => setShow3D(false);
    window.addEventListener('close-3d-preview', handler as any);
    return () => window.removeEventListener('close-3d-preview', handler as any);
  }, []);

  /* ----------------------------- image load / bind ------------------------------ */
  useEffect(() => {
    (async () => {
      if (!currentUrl) return setImgEl(null);
      const im = await loadHtmlImage(currentUrl);
      setImgEl(im);
      if (!s.bgSampleRGB) {
        try {
          const sample = await autoSampleRGBFromBorder(im);
          useEditorStore.getState().setBgSample(sample);
        } catch {}
      }
    })();
  }, [currentUrl, s.bgSampleRGB]);

  useEffect(() => {
    if (imgTrRef.current && imgNodeRef.current) {
      imgTrRef.current.nodes([imgNodeRef.current]);
      imgTrRef.current.getLayer().batchDraw();
    }
  }, [imgEl, s.keepRatio]);

  const fitToBoard = () => {
    if (!imgEl) return;
    const scale = Math.min(W / imgEl.width, H / imgEl.height);
    const w = imgEl.width * scale;
    const h = imgEl.height * scale;
    const x = (W - w) / 2;
    const y = (H - h) / 2;
    useEditorStore.getState().setTransform({ x, y, scale, rotation: 0 });
    setImgScale({ x: scale, y: scale });
  };
  useEffect(() => {
    if (imgEl) fitToBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgEl, s.fitToken, W, H]);

  /* -------------------- viewport / keyboard -------------------- */
  useEffect(() => {
    const stage = stageRef.current?.getStage?.();
    if (!stage) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dir = e.deltaY > 0 ? -1 : 1;
      setViewScale((v) => clamp(+(v + dir * 0.5).toFixed(2), 0.5, 6));
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        setPanning(true);
        stage.draggable(true);
      }
      if (e.key === 'Shift') setShiftDown(true);

      // delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShapeId) {
        useEditorStore.getState().removeShape(selectedShapeId);
      }

      // arrow nudge
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        const step = mm2px(e.shiftKey ? 2.5 : GRID_STEP_MM, s.dpi);
        const st = useEditorStore.getState();
        const id = selectedShapeId;
        const sh = st.shapes.find((x: any) => x.id === id);
        if (sh) {
          const dx =
            e.key === 'ArrowRight' ? step : e.key === 'ArrowLeft' ? -step : 0;
          const dy =
            e.key === 'ArrowDown' ? step : e.key === 'ArrowUp' ? -step : 0;
          st.updateShape(id!, { x: sh.x + dx, y: sh.y + dy });
          e.preventDefault();
        }
      }

      if (e.key === '=' || e.key === '+')
        setViewScale((v) => clamp(+(v + 0.5).toFixed(2), 0.5, 6));
      if (e.key === '-')
        setViewScale((v) => clamp(+(v - 0.5).toFixed(2), 0.5, 6));
      if (e.key === 'Escape') {
        setSelectedShapeId(null);
        setTool('select');
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        setPanning(false);
        stage.draggable(false);
      }
      if (e.key === 'Shift') setShiftDown(false);
    };

    const onBlur = () => {
      setPanning(false);
      stage.draggable(false);
    };

    stage.container().addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      stage.container().removeEventListener('wheel', onWheel as any);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [selectedShapeId, s.dpi]);

  // link selected node to transformer
  useEffect(() => {
    if (!shapeTrRef.current) return;
    const node = findShapeNodeById(selectedShapeId);
    if (node) {
      shapeTrRef.current.nodes([node]);
      shapeTrRef.current.getLayer().batchDraw();
    } else {
      shapeTrRef.current.nodes([] as any);
      shapeTrRef.current.getLayer().batchDraw();
    }
  }, [selectedShapeId, s.shapes]);

  const findShapeNodeById = (id: string | null) => {
    if (!id) return null;
    const stage = stageRef.current?.getStage?.();
    return stage?.findOne?.(`#${id}`) || null;
  };

  // add shape (centered)
  const addShape = (t: ShapeType) => {
    useEditorStore.getState().addShape(t);
    setSelectedShapeId(null);
  };

  /* --------------------- path build (image+shapes+holes) --------------------- */
  const [holesPreview, setHolesPreview] = useState<
    { cx: number; cy: number; r: number }[]
  >([]);

  useEffect(() => {
    (async () => {
      if (!imgEl) return;

      const baseMask = imageNodeToMaskCanvas(imgEl, W, H, {
        x: s.transform.x,
        y: s.transform.y,
        scaleX: imgScale.x,
        scaleY: imgScale.y,
        rotation: s.transform.rotation,
      });

      const drawShapes = s.shapes.map((sh: any) => {
        if (sh.type === 'rect')
          return {
            type: 'rect' as const,
            x: sh.x,
            y: sh.y,
            width: (sh as any).width,
            height: (sh as any).height,
            rotation: sh.rotation,
          };
        return {
          type: 'circle' as const,
          x: sh.x,
          y: sh.y,
          radius: (sh as any).radius,
          rotation: sh.rotation,
        };
      });
      const unionWithShapes = paintShapesToMask(baseMask, drawShapes);

      const holeRpx = mm2px(s.hole.diaMM / 2, s.dpi);
      const earRpx = holeRpx + mm2px(s.hole.earExtraMM, s.dpi);
      const safePad = mm2px(2, s.dpi);
      const { union: withEar, holes } = unionEarAndHole(unionWithShapes, {
        mode: s.hole.mode,
        side: s.hole.side,
        count: s.hole.count,
        holeRpx,
        earRpx,
        safePadPx: safePad,
        manualPositions: s.hole.manual,
      });
      setHolesPreview(holes);

      const cutMask = offsetMaskByPixels(withEar, mm2px(s.cutOffsetMM, s.dpi));
      const whiteMask = offsetMaskByPixels(
        withEar,
        -mm2px(s.whiteShrinkMM, s.dpi),
      );

      const cutPoly = traceContourFromAlphaCanvas(cutMask);
      const whitePoly = traceContourFromAlphaCanvas(whiteMask);
      const boardPoly = traceContourFromAlphaCanvas(withEar);

      useEditorStore
        .getState()
        .setPaths(
          polyToPathShape(boardPoly),
          polyToPathShape(cutPoly),
          polyToPathShape(whitePoly),
        );
    })();
  }, [
    imgEl,
    s.transform.x,
    s.transform.y,
    s.transform.rotation,
    imgScale.x,
    imgScale.y,
    s.hole.mode,
    s.hole.count,
    s.hole.side,
    s.hole.diaMM,
    s.hole.earExtraMM,
    s.hole.manual,
    s.cutOffsetMM,
    s.whiteShrinkMM,
    s.dpi,
    W,
    H,
    s.shapes,
  ]);

  /* --------------------------- interactions --------------------------- */

  const onStageClick = (e: KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current?.getStage?.();
    if (!stage) return;
    const isEmpty = e.target === stage;

    if (isEmpty) {
      // hole (one shot)
      if (tool === 'hole') {
        const pos = stage.getPointerPosition();
        if (pos) {
          const realX = (pos.x - stage.x()) / viewScale;
          const realY = (pos.y - stage.y()) / viewScale;
          const pts = [...s.hole.manual, { cx: realX, cy: realY }];
          useEditorStore.getState().setManualHoles(pts);
          useEditorStore.getState().setHoleMode('manual');
        }
        setTool('select');
        return;
      }
      // sample
      if (tool === 'sample') {
        const pos = stage.getPointerPosition();
        if (pos) {
          const realX = Math.round((pos.x - stage.x()) / viewScale);
          const realY = Math.round((pos.y - stage.y()) / viewScale);
          const canvas: HTMLCanvasElement = stage.toCanvas({
            pixelRatio: 1,
          }) as any;
          const ctx = canvas.getContext('2d')!;
          const x = clamp(realX, 0, canvas.width - 1);
          const y = clamp(realY, 0, canvas.height - 1);
          const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
          useEditorStore.getState().setBgSample([r, g, b]);
        }
        setTool('select');
        return;
      }

      // empty click → deselect
      setSelectedShapeId(null);
      return;
    }

    // Alt+click = quick sample anywhere
    if ((e.evt as MouseEvent)?.altKey) {
      const pos = stage.getPointerPosition();
      if (pos) {
        const realX = Math.round((pos.x - stage.x()) / viewScale);
        const realY = Math.round((pos.y - stage.y()) / viewScale);
        const canvas: HTMLCanvasElement = stage.toCanvas({
          pixelRatio: 1,
        }) as any;
        const ctx = canvas.getContext('2d')!;
        const x = clamp(realX, 0, canvas.width - 1);
        const y = clamp(realY, 0, canvas.height - 1);
        const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
        useEditorStore.getState().setBgSample([r, g, b]);
      }
    }
  };

  const onMouseMove = () => {
    const stage = stageRef.current?.getStage?.();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) {
      setCursorPos(null);
      return;
    }
    const realX = (pos.x - stage.x()) / viewScale;
    const realY = (pos.y - stage.y()) / viewScale;
    setCursorPos({ x: clamp(realX, 0, W), y: clamp(realY, 0, H) });
  };

  // image transform
  const onImageTransform = () => {
    const node = imgNodeRef.current;
    let rot = node.rotation();
    if (shiftDown) {
      const step = 15;
      rot = Math.round(rot / step) * step;
      node.rotation(rot);
    }
    setImgScale({ x: node.scaleX(), y: node.scaleY() });
    useEditorStore
      .getState()
      .setTransform({
        x: node.x(),
        y: node.y(),
        scale: (node.scaleX() + node.scaleY()) / 2,
        rotation: rot,
      });
  };

  // drag bound: snap to center (image)
  const dragBound = (pos: { x: number; y: number }) => {
    const node = imgNodeRef.current;
    if (!node || !imgEl) return pos;
    const w = imgEl.width * node.scaleX();
    const h = imgEl.height * node.scaleY();
    const snap = 6;
    const next = { ...pos };
    const cx = next.x + w / 2,
      cy = next.y + h / 2;
    if (Math.abs(cx - W / 2) < snap) next.x = W / 2 - w / 2;
    if (Math.abs(cy - H / 2) < snap) next.y = H / 2 - h / 2;
    return next;
  };

  const exportPdf = () => {
    if (!imgEl) return;
    const ratio = s.ui.previewPixelRatio ?? 2;
    const wMm = s.size.widthMM,
      hMm = s.size.heightMM;
    const doc = new jsPDF({
      unit: 'mm',
      format: [wMm, hMm],
      orientation: 'portrait',
      compress: true,
    });
    const data = stageRef.current.getStage().toDataURL({ pixelRatio: ratio });
    doc.addImage(data, 'PNG', 0, 0, wMm, hMm);
    doc.addPage([wMm, hMm], 'portrait');
    if (s.whitePath?.path?.length)
      drawPolyline(doc, s.whitePath.path, s.dpi, true);
    doc.addPage([wMm, hMm], 'portrait');
    if (s.cutlinePath?.path?.length)
      drawPolyline(doc, s.cutlinePath.path, s.dpi, false);
    doc.save(`ACRYLIC_${wMm}x${hMm}_CWC.pdf`);
  };

  const exportPng = () => {
    const url = stageRef.current
      .getStage()
      .toDataURL({ pixelRatio: s.ui.previewPixelRatio ?? 2 });
    const a = document.createElement('a');
    a.href = url;
    a.download = 'preview.png';
    a.click();
  };

  /* ----------------------------- render ------------------------------ */
  const gridLayer = showGrid ? buildGrid(W, H, s.dpi) : null;
  const guidesLayer = showGuides ? (
    <>
      <Line
        points={[W / 2, 0, W / 2, H]}
        stroke="#60a5fa"
        dash={[6, 6]}
        opacity={0.5}
      />
      <Line
        points={[0, H / 2, W, H / 2]}
        stroke="#60a5fa"
        dash={[6, 6]}
        opacity={0.5}
      />
    </>
  ) : null;
  const pointerStyle =
    panning ? 'grabbing' : tool === 'hole' ? 'crosshair' : tool === 'sample' ? 'copy' : 'default';

  return (
    <div className="flex h-full flex-col gap-2">
      {/* --- Integration Toolbar --- */}
      <div className="mb-2 flex items-center gap-2">
        <button onClick={openTui} disabled={!imgEl}>
          이미지 보정
        </button>
        <button onClick={handleRemoveBg} disabled={!imgEl || !!loading}>
          배경제거{useServerRembg ? '(서버)' : '(로컬)'}
        </button>
        <label className="ml-2 text-xs">
          <input
            type="checkbox"
            checked={useServerRembg}
            onChange={(e) => setUseServerRembg(e.target.checked)}
          />{' '}
          서버 REMBG 사용
        </label>
        <button onClick={toggleFitMode} disabled={!imgEl}>
          Fit/Cover
        </button>
        <button onClick={open3D} disabled={!imgEl}>
          3D 미리보기
        </button>
        {loading && <span className="text-xs text-blue-600">{loading}</span>}
        {error && <span className="text-xs text-red-600">{error}</span>}
        {applied && <span className="text-xs text-green-600">적용됨</span>}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-neutral-500">
          드래그=이동 · 모서리=크기/회전 · 휠/버튼=줌 · <b>Space=Pan</b> · Shift=15° ·
          Delete/Arrow=편집 · Alt+클릭=샘플
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="join">
            <button
              className="btn btn-sm join-item"
              onClick={() =>
                setViewScale((v) => clamp(+(v - 0.5).toFixed(2), 0.5, 6))
              }
            >
              -
            </button>
            <span className="btn no-animation btn-sm join-item">
              {Math.round(viewScale * 100)}%
            </span>
            <button
              className="btn btn-sm join-item"
              onClick={() =>
                setViewScale((v) => clamp(+(v + 0.5).toFixed(2), 0.5, 6))
              }
            >
              +
            </button>
            <button className="btn btn-sm join-item" onClick={() => setViewScale(1)}>
              100%
            </button>
            <button className="btn btn-sm join-item" onClick={fitToBoard}>
              Fit
            </button>
          </div>

          <div className="divider divider-horizontal" />

          {/* Tools */}
          <div className="join">
            <button
              className={`btn btn-sm join-item ${
                tool === 'select' ? 'btn-primary' : 'btn-ghost'
              }`}
              onClick={() => setTool('select')}
            >
              선택
            </button>
            <button
              className={`btn btn-sm join-item ${
                tool === 'hole' ? 'btn-primary' : 'btn-ghost'
              }`}
              onClick={() => setTool('hole')}
            >
              구멍(수동)
            </button>
            <button
              className={`btn btn-sm join-item ${
                tool === 'sample' ? 'btn-primary' : 'btn-ghost'
              }`}
              onClick={() => setTool('sample')}
            >
              샘플
            </button>
          </div>
          <button
            className="btn btn-sm"
            onClick={() => s.clearManualHoles()}
            disabled={s.hole.manual.length === 0}
          >
            구멍 초기화
          </button>

          <div className="divider divider-horizontal" />

          <label className="label cursor-pointer gap-1 text-xs">
            <input
              type="checkbox"
              checked={snapGrid}
              onChange={(e) => setSnapGrid(e.target.checked)}
            />{' '}
            그리드 스냅(0.5mm)
          </label>
          <label className="label cursor-pointer gap-1 text-xs">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />{' '}
            그리드
          </label>
          <label className="label cursor-pointer gap-1 text-xs">
            <input
              type="checkbox"
              checked={showGuides}
              onChange={(e) => setShowGuides(e.target.checked)}
            />{' '}
            가이드
          </label>
          <label className="label cursor-pointer gap-1 text-xs">
            <input
              type="checkbox"
              checked={showSafe}
              onChange={(e) => setShowSafe(e.target.checked)}
            />{' '}
            안전여백
          </label>
          <label className="label cursor-pointer gap-1 text-xs">
            <input
              type="checkbox"
              checked={showRuler}
              onChange={(e) => setShowRuler(e.target.checked)}
            />{' '}
            룰러
          </label>

          <div className="divider divider-horizontal" />
          <button className="btn btn-sm" onClick={() => addShape('rect')}>
            사각형
          </button>
          <button className="btn btn-sm" onClick={() => addShape('circle')}>
            원
          </button>

          <div className="divider divider-horizontal" />
          <button className="btn btn-sm" onClick={exportPng}>
            PNG
          </button>
          <button className="btn btn-sm" onClick={exportPdf}>
            PDF
          </button>
        </div>
      </div>

      {/* Canvas wrapper */}
      {showTui && editorSrc && (
        <TuiImageEditorModal
          src={editorSrc}
          onApply={handleTuiApply}
          onClose={() => setShowTui(false)}
        />
      )}
      {show3D && <ThreePreview dataUrl={stageDataUrl} />}

      <div className="relative h-[calc(100vh-220px)] w-full overflow-hidden rounded-xl border bg-white shadow">
        {showRuler && (
          <Rulers
            width={W}
            height={H}
            dpi={s.dpi}
            scale={viewScale}
            offset={stagePos}
          />
        )}

        <Stage
          ref={stageRef}
          width={W * viewScale}
          height={H * viewScale}
          scaleX={viewScale}
          scaleY={viewScale}
          x={stagePos.x}
          y={stagePos.y}
          draggable={panning}
          onDragMove={(e: KonvaEventObject<DragEvent>) => {
            const st = e.target.getStage();
            if (st && e.target === st) setStagePos({ x: st.x(), y: st.y() });
          }}
          onClick={onStageClick}
          onMouseMove={onMouseMove}
          style={{ cursor: pointerStyle }}
        >
          {/* static background layer (not listening) */}
          <Layer listening={false} hitGraphEnabled={false} perfectDrawEnabled={false}>
            <Rect x={0} y={0} width={W} height={H} fill="#f8fafc" />
            {gridLayer}
            {guidesLayer}
            {showSafe ? (
              <Rect
                x={mm2px(2, s.dpi)}
                y={mm2px(2, s.dpi)}
                width={W - mm2px(4, s.dpi)}
                height={H - mm2px(4, s.dpi)}
                stroke="#22c55e"
                dash={[4, 4]}
                opacity={0.6}
              />
            ) : null}
          </Layer>

          {/* image + transformer */}
          <Layer>
            {imgEl && (
              <>
                <KImage
                  ref={imgNodeRef}
                  image={imgEl as any}
                  x={s.transform.x}
                  y={s.transform.y}
                  width={imgEl.width}
                  height={imgEl.height}
                  scaleX={imgScale.x}
                  scaleY={imgScale.y}
                  rotation={s.transform.rotation}
                  draggable
                  dragBoundFunc={dragBound}
                  onDragMove={(e: KonvaEventObject<DragEvent>) =>
                    useEditorStore
                      .getState()
                      .setTransform({ x: (e.target as any).x(), y: (e.target as any).y() })
                  }
                  onTransform={onImageTransform}
                  onTransformEnd={onImageTransform}
                  onMouseEnter={() => setStageCursor(imgNodeRef.current, 'move')}
                  onMouseLeave={() => setStageCursor(imgNodeRef.current, 'default')}
                />
                <Transformer
                  ref={imgTrRef}
                  rotateEnabled
                  keepRatio={s.keepRatio}
                  anchorSize={Math.max(10, Math.round(16 / viewScale))}
                  padding={Math.max(6, Math.round(10 / viewScale))}
                  rotateAnchorOffset={24}
                  ignoreStroke={false}
                  boundBoxFunc={(oldBox: any, newBox: any): any =>
                    newBox.width < 20 || newBox.height < 20 ? oldBox : newBox
                  }
                />
              </>
            )}

            {/* shapes */}
            {s.shapes.map((sh: any) => (
              <ShapeItem
                key={sh.id}
                shape={sh}
                selected={selectedShapeId === sh.id}
                onSelect={() => setSelectedShapeId(sh.id)}
                onChange={(patch) =>
                  useEditorStore.getState().updateShape(sh.id, patch)
                }
                _onDelete={() => useEditorStore.getState().removeShape(sh.id)}
                trRef={shapeTrRef}
                snapGrid={snapGrid}
                dpi={s.dpi}
              />
            ))}

            {/* outlines */}
            {s.whitePath?.path?.length ? (
              <Line
                points={toPoints(s.whitePath.path)}
                closed
                stroke="#16a34a"
                opacity={0.9}
              />
            ) : null}
            {s.cutlinePath?.path?.length ? (
              <Line
                points={toPoints(s.cutlinePath.path)}
                closed
                stroke="#ff2e7e"
                opacity={0.95}
              />
            ) : null}

            {/* manual holes preview (snap to path) */}
            {holesPreview.map((h, i) => (
              <Circle
                key={i}
                x={h.cx}
                y={h.cy}
                radius={h.r}
                stroke="#ef4444"
                strokeWidth={2}
                fill="rgba(239,68,68,0.18)"
                draggable={s.hole.mode === 'manual'}
                dragBoundFunc={(pos) => {
                  const poly = (s.cutlinePath?.path?.length
                    ? s.cutlinePath.path
                    : s.boardPath?.path?.length
                    ? s.boardPath.path
                    : []) as Array<{ x: number; y: number }>;
                  if (poly.length >= 2) {
                    const q = nearestOnPolyline(poly, pos as any);
                    const pts = s.hole.manual.slice();
                    if (pts[i]) {
                      pts[i] = { cx: q.x, cy: q.y };
                      useEditorStore.getState().setManualHoles(pts);
                    }
                    return q as any;
                  }
                  return pos;
                }}
              />
            ))}
          </Layer>

          {/* separate transformer layer (stable handle size) */}
          <Layer>
            <Transformer
              ref={shapeTrRef}
              rotateEnabled
              keepRatio={false}
              anchorSize={Math.max(10, Math.round(16 / viewScale))}
              padding={Math.max(6, Math.round(10 / viewScale))}
              rotateAnchorOffset={24}
            />
          </Layer>
        </Stage>

        {/* status bar */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex justify-between gap-4 bg-white/70 px-3 py-1 text-xs text-neutral-600">
          <div>
            {cursorPos
              ? `마우스: ${px2mm(cursorPos.x, s.dpi).toFixed(2)}mm, ${px2mm(
                  cursorPos.y,
                  s.dpi,
                ).toFixed(2)}mm`
              : '마우스: -'}
          </div>
          <div>
            {selectedShapeId
              ? `선택: ${selectedShapeId}`
              : imgEl
              ? `이미지: ${Math.round(imgEl.width * imgScale.x)}×${Math.round(
                  imgEl.height * imgScale.y,
                )} px`
              : '선택 없음'}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- shape renderer -------------------------- */
function ShapeItem({
  shape,
  selected,
  onSelect,
  onChange,
  _onDelete, // 이름만 바꿔 unused 경고 방지
  trRef,
  snapGrid,
  dpi,
}: {
  shape: AnyShape;
  selected: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<AnyShape>) => void;
  _onDelete: () => void;
  trRef: any;
  snapGrid: boolean;
  dpi: number;
}) {
  const groupRef = useRef<any>(null);
  const [hover, setHover] = useState(false);

  // hook transformer
  useEffect(() => {
    if (!trRef.current) return;
    if (selected) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selected, trRef]);

  // grid drag bound (optional)
  const dragBound = (pos: { x: number; y: number }) => {
    if (!snapGrid) return pos;
    const step = mm2px(GRID_STEP_MM, dpi);
    return { x: snapTo(pos.x, step), y: snapTo(pos.y, step) };
  };

  const getStageScale = () =>
    groupRef.current?.getStage?.()?.scaleX?.() ?? 1;
  const hitPad = 10 / getStageScale();
  const borderColor = selected ? '#0284c7' : hover ? '#38bdf8' : '#0ea5e9';
  const fillAlpha = (shape as any).fillAlpha ?? 0.2;

  return (
    <Group
      id={shape.id}
      ref={groupRef}
      x={shape.x}
      y={shape.y}
      rotation={shape.rotation}
      draggable
      dragBoundFunc={dragBound}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={onSelect}
      onMouseEnter={() => {
        setHover(true);
        setStageCursor(groupRef.current, 'move');
      }}
      onMouseLeave={() => {
        setHover(false);
        setStageCursor(groupRef.current, 'default');
      }}
      onDragMove={(e: KonvaEventObject<DragEvent>) =>
        onChange({ x: (e.target as any).x(), y: (e.target as any).y() })
      }
      onTransformEnd={() => {
        const node = groupRef.current;
        onChange({ x: node.x(), y: node.y(), rotation: node.rotation() });
      }}
      listening
    >
      {/* invisible hit padding */}
      {shape.type === 'rect' ? (
        <Rect
          x={-hitPad}
          y={-hitPad}
          width={(shape as any).width + hitPad * 2}
          height={(shape as any).height + hitPad * 2}
          opacity={0.01}
          fill="rgba(0,0,0,0.01)"
        />
      ) : (
        <Circle
          x={0}
          y={0}
          radius={(shape as any).radius + hitPad}
          opacity={0.01}
          fill="rgba(0,0,0,0.01)"
        />
      )}

      {/* visual */}
      {shape.type === 'rect' ? (
        <Rect
          width={(shape as any).width}
          height={(shape as any).height}
          cornerRadius={6}
          fill={`rgba(14,165,233,${fillAlpha})`}
          stroke={borderColor}
          strokeWidth={2}
          hitStrokeWidth={Math.max(8, 12 / getStageScale())}
          shadowForStrokeEnabled={false}
          perfectDrawEnabled={false}
        />
      ) : (
        <Circle
          radius={(shape as any).radius}
          fill={`rgba(99,102,241,${fillAlpha})`}
          stroke={borderColor}
          strokeWidth={2}
          hitStrokeWidth={Math.max(8, 12 / getStageScale())}
          shadowForStrokeEnabled={false}
          perfectDrawEnabled={false}
        />
      )}
    </Group>
  );
}

/* --------------------------- rulers ---------------------------- */
function Rulers({
  width,
  height,
  dpi,
  scale,
  offset,
}: {
  width: number;
  height: number;
  dpi: number;
  scale: number;
  offset: { x: number; y: number };
}) {
  const mmW = px2mm(width, dpi);
  const mmH = px2mm(height, dpi);
  const majorColor = '#94a3b8';
  const minorColor = '#cbd5e1';

  const top: JSX.Element[] = [];
  for (let mm = 0; mm <= mmW; mm += 1) {
    const x = Math.round(mm2px(mm, dpi) * scale + offset.x);
    const isMajor = mm % 5 === 0;
    top.push(
      <div
        key={`t${mm}`}
        style={{
          position: 'absolute',
          left: x,
          top: 0,
          width: 1,
          height: isMajor ? 8 : 4,
          background: isMajor ? majorColor : minorColor,
        }}
      />,
    );
    if (isMajor)
      top.push(
        <div
          key={`tn${mm}`}
          style={{
            position: 'absolute',
            left: x + 2,
            top: 8,
            fontSize: 10,
            color: majorColor,
          }}
        >
          {mm}
        </div>,
      );
  }
  const left: JSX.Element[] = [];
  for (let mm = 0; mm <= mmH; mm += 1) {
    const y = Math.round(mm2px(mm, dpi) * scale + offset.y);
    const isMajor = mm % 5 === 0;
    left.push(
      <div
        key={`l${mm}`}
        style={{
          position: 'absolute',
          top: y,
          left: 0,
          width: isMajor ? 8 : 4,
          height: 1,
          background: isMajor ? majorColor : minorColor,
        }}
      />,
    );
    if (isMajor)
      left.push(
        <div
          key={`ln${mm}`}
          style={{
            position: 'absolute',
            top: y + 2,
            left: 10,
            fontSize: 10,
            color: majorColor,
          }}
        >
          {mm}
        </div>,
      );
  }

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 20,
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          zIndex: 5,
        }}
      >
        {top}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: 36,
          background: '#f8fafc',
          borderRight: '1px solid #e2e8f0',
          zIndex: 5,
        }}
      >
        {left}
      </div>
    </>
  );
}

/* ----------------------------- helpers ------------------------------ */
function buildGrid(W: number, H: number, dpi: number) {
  const elems: JSX.Element[] = [];
  const mmW = px2mm(W, dpi);
  const mmH = px2mm(H, dpi);
  for (let mm = 0; mm <= mmW; mm += 1) {
    const x = mm2px(mm, dpi);
    const major = mm % 5 === 0;
    elems.push(
      <Line
        key={`vx-${mm}`}
        points={[x, 0, x, H]}
        stroke={major ? '#d4d4d8' : '#eee'}
        strokeWidth={major ? 1 : 0.5}
      />,
    );
  }
  for (let mm = 0; mm <= mmH; mm += 1) {
    const y = mm2px(mm, dpi);
    const major = mm % 5 === 0;
    elems.push(
      <Line
        key={`hz-${mm}`}
        points={[0, y, W, y]}
        stroke={major ? '#d4d4d8' : '#eee'}
        strokeWidth={major ? 1 : 0.5}
      />,
    );
  }
  return <>{elems}</>;
}

function toPoints(path: { x: number; y: number }[]) {
  const pts: number[] = [];
  for (const p of path) pts.push(p.x, p.y);
  return pts;
}

function drawPolyline(
  doc: jsPDF,
  pts: { x: number; y: number }[],
  dpi: number,
  fill: boolean,
) {
  if (!pts.length) return;
  doc.setDrawColor(0, 0, 0);
  doc.setFillColor(0, 0, 0);
  doc.setLineWidth(0.25);
  doc.lines(
    pts.map((p, i, arr) => {
      const prev = i ? arr[i - 1] : arr[0];
      return [px2mm(p.x - prev.x, dpi), px2mm(p.y - prev.y, dpi)];
    }),
    px2mm(pts[0].x, dpi),
    px2mm(pts[0].y, dpi),
    [1, 1],
    fill ? 'F' : 'S',
    true,
  );
}
