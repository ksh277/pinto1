'use client';
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, no-unused-vars */
import React, { useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import useImage from 'use-image';
import { useEditorStore } from '@/store/editorStore';
import {
  removeWhiteToCanvas,
  dilateAlpha,
  marchingSquares,
  nearestOnPolyline,
} from '@/lib/editor/trace';
import type { ImageNode, TextNode } from '@/types/editor';
const Stage       = dynamic(() => import('react-konva').then(m => m.Stage),       { ssr: false });
const Layer       = dynamic(() => import('react-konva').then(m => m.Layer),       { ssr: false });
const Rect        = dynamic(() => import('react-konva').then(m => m.Rect),        { ssr: false });
const Line        = dynamic(() => import('react-konva').then(m => m.Line),        { ssr: false });
const Circle      = dynamic(() => import('react-konva').then(m => m.Circle),      { ssr: false });
const KImage      = dynamic(() => import('react-konva').then(m => m.Image),       { ssr: false });
const KText       = dynamic(() => import('react-konva').then(m => m.Text),        { ssr: false });
const Group       = dynamic(() => import('react-konva').then(m => m.Group),       { ssr: false });
const Transformer = dynamic(() => import('react-konva').then(m => m.Transformer), { ssr: false });

const DPI = 300;
const mmToPx = (mm: number) => (mm / 25.4) * DPI;

export function ProductEditor() {
  const {
    state,
    select,
    addImageFromSrc,
    addText,
    duplicateSelected,
    removeSelected,
    setPaths,
    setHole,
    setOffsets,
  } = useEditorStore();
  const [threshold, setThreshold] = useState(240);
  const [assumeTransparent, setAssumeTransparent] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const selSet = new Set(state.selectedIds);

  (window as any).__EDITOR_PAYLOAD__ = useMemo(
    () => ({
      mode: state.mode,
      templateShape: state.templatePlate,
      size: state.size,
      offsets: state.offsets,
      hole: {
        x: state.hole.x,
        y: state.hole.y,
        diameterMM: state.hole.diameterMM,
      },
      paths: {
        boardPath: state.boardPath?.path,
        cutlinePath: state.cutlinePath?.path,
      },
      state,
    }),
    [state],
  );

  const onUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => addImageFromSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const buildBoard = async () => {
    const sel = state.nodes.find(
      (n) => selSet.has(n.id) && n.type === 'image',
    ) as ImageNode | undefined;
    if (!sel) return alert('보드를 생성할 이미지 노드를 선택하세요.');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const base = assumeTransparent
        ? (() => {
            const c = document.createElement('canvas');
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            c.getContext('2d')!.drawImage(img, 0, 0);
            return c;
          })()
        : removeWhiteToCanvas(img, threshold);

      const borderPx = Math.round(mmToPx(state.offsets.borderMM));
      const boardMask = dilateAlpha(base, borderPx);
      const boardPath = marchingSquares(boardMask, 8);

      const cutPx = Math.round(mmToPx(state.offsets.cutOffsetMM));
      const cutMask = dilateAlpha(boardMask, cutPx);
      const cutlinePath = marchingSquares(cutMask, 8);

      setPaths(
        boardPath.length ? { path: boardPath } : undefined,
        cutlinePath.length ? { path: cutlinePath } : undefined,
      );

      if (boardPath.length) {
        const xs = boardPath.map((p) => p.x),
          ys = boardPath.map((p) => p.y);
        const minX = Math.min(...xs),
          maxX = Math.max(...xs),
          minY = Math.min(...ys);
        const cx = (minX + maxX) / 2;
        const p = nearestOnPolyline({ x: cx, y: minY }, boardPath);
        setHole(p.x, p.y);
      }
    };
    img.src = sel.src;
  };

  const holeRadiusPx = mmToPx(state.hole.diameterMM) / 2;
  const onHoleDrag = (e: any) => {
    const x = e.target.x(),
      y = e.target.y();
    const poly = state.boardPath?.path?.length
      ? state.boardPath.path
      : state.cutlinePath?.path || [];
    if (state.hole.snapToPerimeter && poly.length > 1) {
      const p = nearestOnPolyline({ x, y }, poly);
      setHole(p.x, p.y);
    } else setHole(x, y);
  };

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
          }}
        />
        <button
          className="border rounded-xl px-3 py-2"
          onClick={() => fileRef.current?.click()}
        >
          이미지 업로드
        </button>
        <button
          className="border rounded-xl px-3 py-2"
          onClick={() => addText('텍스트')}
        >
          텍스트
        </button>

        <div className="mx-2 h-6 w-px bg-gray-200" />

        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={assumeTransparent}
            onChange={(e) => setAssumeTransparent(e.target.checked)}
          />
          이미 투명 배경으로 간주
        </label>
        {!assumeTransparent && (
          <label className="text-sm">
            화이트 임계값: {threshold}
            <input
              type="range"
              min={200}
              max={255}
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
            />
          </label>
        )}
        <label className="text-sm">
          보드 +mm
          <input
            type="number"
            className="border rounded px-2 py-1 ml-2 w-20"
            value={state.offsets.borderMM}
            onChange={(e) =>
              setOffsets(
                parseFloat(e.target.value || '0'),
                state.offsets.cutOffsetMM,
              )
            }
          />
        </label>
        <label className="text-sm">
          절제선 +mm
          <input
            type="number"
            className="border rounded px-2 py-1 ml-2 w-20"
            value={state.offsets.cutOffsetMM}
            onChange={(e) =>
              setOffsets(
                state.offsets.borderMM,
                parseFloat(e.target.value || '0'),
              )
            }
          />
        </label>
        <button className="border rounded-xl px-3 py-2" onClick={buildBoard}>
          보드/컷라인 생성
        </button>

        <div className="mx-2 h-6 w-px bg-gray-200" />
        <button
          className="border rounded-xl px-3 py-2"
          onClick={duplicateSelected}
        >
          복제
        </button>
        <button
          className="border rounded-xl px-3 py-2"
          onClick={removeSelected}
        >
          삭제
        </button>
      </div>

      <Stage
        width={state.stageWidth}
        height={state.stageHeight}
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
        }}
        onMouseDown={(e: any) => {
          if (e.target === e.target.getStage()) select([]);
        }}
      >
        <Layer>
          {state.showGrid &&
            Array.from({ length: Math.floor(state.stageWidth / 10) }).map(
              (_, i) => (
                <Line
                  key={`v${i}`}
                  points={[i * 10, 0, i * 10, state.stageHeight]}
                  stroke="#f3f4f6"
                />
              ),
            )}
          {state.showGrid &&
            Array.from({ length: Math.floor(state.stageHeight / 10) }).map(
              (_, i) => (
                <Line
                  key={`h${i}`}
                  points={[0, i * 10, state.stageWidth, i * 10]}
                  stroke="#f3f4f6"
                />
              ),
            )}

          {state.boardPath?.path?.length ? (
            <Line
              points={state.boardPath.path.flatMap((p) => [p.x, p.y])}
              closed
              stroke="#9ca3af"
              strokeWidth={2}
              fill="#fff"
            />
          ) : null}
          {state.cutlinePath?.path?.length ? (
            <Line
              points={state.cutlinePath.path.flatMap((p) => [p.x, p.y])}
              closed
              stroke="#3b82f6"
              strokeWidth={2}
            />
          ) : null}

          {state.nodes.map((n) => {
            const isSel = selSet.has(n.id);
            if (n.type === 'image')
              return (
                <ImageNodeView key={n.id} node={n as any} isSelected={isSel} />
              );
            if (n.type === 'text')
              return (
                <TextNodeView key={n.id} node={n as any} isSelected={isSel} />
              );
            return null;
          })}

          <Circle
            x={state.hole.x}
            y={state.hole.y}
            radius={holeRadiusPx}
            stroke="#111"
            strokeWidth={1}
            fill="#fff"
            draggable
            onDragMove={onHoleDrag}
          />
        </Layer>
      </Stage>
    </div>
  );
}

function ImageNodeView({
  node,
  isSelected,
}: {
  node: ImageNode;
  isSelected: boolean;
}) {
  const { updateNode, select } = useEditorStore();
  const [img] = useImage(node.src, 'anonymous');
  const ref = useRef<any>(null);
  const trRef = useRef<any>(null);
  React.useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([ref.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);
  return (
    <>
      <KImage
        ref={ref}
        image={img || undefined}
        x={node.x}
        y={node.y}
        opacity={node.opacity}
        rotation={node.rotation}
        scaleX={node.scaleX}
        scaleY={node.scaleY}
        draggable={!node.locked}
        onClick={() => select([node.id])}
        onTap={() => select([node.id])}
        onDragEnd={(e: any) =>
          updateNode(node.id, { x: e.target.x(), y: e.target.y() })
        }
        onTransformEnd={() => {
          const n = ref.current;
          updateNode(node.id, {
            x: n.x(),
            y: n.y(),
            rotation: n.rotation(),
            scaleX: n.scaleX(),
            scaleY: n.scaleY(),
          });
        }}
      />
      {isSelected && <Transformer ref={trRef} rotateEnabled />}
    </>
  );
}

function TextNodeView({
  node,
  isSelected,
}: {
  node: TextNode;
  isSelected: boolean;
}) {
  const { updateNode, select } = useEditorStore();
  const ref = useRef<any>(null);
  const trRef = useRef<any>(null);
  React.useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([ref.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);
  return (
    <>
      <KText
        ref={ref}
        text={node.text}
        x={node.x}
        y={node.y}
        rotation={node.rotation}
        scaleX={node.scaleX}
        scaleY={node.scaleY}
        fontFamily={node.fontFamily}
        fontSize={node.fontSize}
        fill={node.fill}
        draggable={!node.locked}
        onClick={() => select([node.id])}
        onTap={() => select([node.id])}
        onDragEnd={(e: any) =>
          updateNode(node.id, { x: e.target.x(), y: e.target.y() })
        }
        onTransformEnd={() => {
          const n = ref.current;
          updateNode(node.id, {
            x: n.x(),
            y: n.y(),
            rotation: n.rotation(),
            scaleX: n.scaleX(),
            scaleY: n.scaleY(),
          });
        }}
      />
      {isSelected && <Transformer ref={trRef} rotateEnabled />}
    </>
  );
}
