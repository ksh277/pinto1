// ===== components/editor/EditorLayout.tsx =====
'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { HoleSide } from '@/types/editor';

// 유틸
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

// 간단 배경제거(샘플 RGB + 임계값 기반) - 업로드 즉시 투명 배경 버전 생성
async function removeBgFromFile(
  file: File,
  sample: [number, number, number] | undefined,
  threshold: number
) {
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = url;
  });

  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const id = ctx.getImageData(0, 0, c.width, c.height);
  const d = id.data;

  // 샘플이 없으면 모서리 평균
  let [sr, sg, sb]: [number, number, number] = sample ?? [255, 255, 255];
  if (!sample) {
    const pick = (x: number, y: number) => {
      const i = (y * c.width + x) * 4;
      return [d[i], d[i + 1], d[i + 2]] as [number, number, number];
    };
    const P = [
      pick(1, 1),
      pick(c.width - 2, 1),
      pick(1, c.height - 2),
      pick(c.width - 2, c.height - 2),
    ];
    sr = Math.round(P.reduce((s, p) => s + p[0], 0) / P.length);
    sg = Math.round(P.reduce((s, p) => s + p[1], 0) / P.length);
    sb = Math.round(P.reduce((s, p) => s + p[2], 0) / P.length);
  }

  const thr = clamp(threshold, 0, 128);
  for (let i = 0; i < d.length; i += 4) {
    const dr = d[i] - sr,
      dg = d[i + 1] - sg,
      db = d[i + 2] - sb;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    if (dist < thr) d[i + 3] = 0; // 투명
  }
  ctx.putImageData(id, 0, 0);

  const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), 'image/png', 1)!);
  const processedUrl = URL.createObjectURL(blob);
  const originalUrl = url; // 원본은 호출부에서 관리

  return { processedUrl, originalUrl };
}

// named + default 둘 다 제공
export function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full">
      <LeftPanel />
      <div className="flex-1 overflow-auto bg-neutral-50 p-4">{children}</div>
    </div>
  );
}
export default EditorLayout;

/* ------------------------- Left Panel ------------------------- */
function LeftPanel() {
  const s = useEditorStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  // 썸네일 (현재 한 장 기준)
  const thumbUrl = useMemo(() => {
    const i = s.images.selected;
    if (i < 0) return null;
    return s.images.processed[i] || s.images.originals[i];
  }, [s.images]);

  // 파일 선택/드롭
  const handlePick = async (file: File) => {
    setFileName(file.name);

    // 배경제거 + 원본 등록
    const { processedUrl, originalUrl } = await removeBgFromFile(
      file,
      s.bgSampleRGB ?? undefined,
      s.bgThreshold
    );

    // 스토어: 파일에서 이미지 추가
    await s.addImageFromFile(file);

    // 추가된 이미지에 processedUrl 연결
    const nextIndex = useEditorStore.getState().images.originals.length - 1;
    if (nextIndex >= 0) {
      useEditorStore.getState().setProcessedUrlForSelected(processedUrl);
    }

    // 보드 맞추기
    s.requestFit();
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void handlePick(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void handlePick(f);
  };

  const restoreOriginal = () => {
    // processed 대신 original 사용하도록 null
    s.setProcessedUrlForSelected(null);
  };

  const applyBgRemove = async () => {
    // 현재 original에서 다시 배경제거
    const i = s.images.selected;
    const src = i >= 0 ? s.images.originals[i] : null;
    if (!src) return;

    const blob = await fetch(src).then((r) => r.blob());
    const file = new File([blob], fileName || 'image.png', {
      type: blob.type || 'image/png',
    });
    const { processedUrl } = await removeBgFromFile(file, s.bgSampleRGB ?? undefined, s.bgThreshold);
    s.setProcessedUrlForSelected(processedUrl);
  };

  const fitContain = () => {
    s.requestFit();
  };

  // 사이즈 프리셋
  const presets = [
    { w: 20, h: 20 },
    { w: 30, h: 30 },
    { w: 50, h: 50 },
    { w: 70, h: 70 },
    { w: 100, h: 100 },
  ];

  const setSize = (w: number, h: number) => s.setSizeMM(w, h);

  const NumberField = ({
    label,
    value,
    onChange,
    min = 0,
    max = 999,
    step = 1,
    unit = 'mm',
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
  }) => (
    <label className="flex items-center gap-2">
      <span className="w-16 text-sm text-neutral-600">{label}</span>
      <input
        type="number"
        className="input input-bordered w-24"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(clamp(Number(e.target.value), min, max))}
      />
      <span className="text-xs text-neutral-500">{unit}</span>
    </label>
  );

  const SliderRow = ({
    label,
    value,
    onChange,
    min,
    max,
    step,
    suffix,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min: number;
    max: number;
    step: number;
    suffix?: string;
  }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm">{label}</span>
        <span className="text-xs text-neutral-500">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range range-xs w-full"
      />
    </div>
  );

  return (
    <aside className="w-[320px] shrink-0 border-r bg-white p-4">
      {/* 사이즈 */}
      <section className="mb-6 space-y-2">
        <h3 className="font-semibold">자율형</h3>
        <div className="flex items-center gap-3">
          <NumberField
            label="가로"
            value={s.size.widthMM}
            onChange={(v) => s.setSizeMM(v, s.size.heightMM)}
          />
          <NumberField
            label="세로"
            value={s.size.heightMM}
            onChange={(v) => s.setSizeMM(s.size.widthMM, v)}
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {presets.map((p) => (
            <button
              key={`${p.w}x${p.h}`}
              onClick={() => setSize(p.w, p.h)}
              className="btn btn-xs"
            >
              {p.w}×{p.h}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-neutral-500">DPI</span>
            <select
              className="select select-bordered select-xs"
              value={s.dpi}
              onChange={(e) => s.setDpi(Number(e.target.value) as 300 | 600)}
            >
              <option value={300}>300</option>
              <option value={600}>600</option>
            </select>
          </div>
        </div>
      </section>

      {/* 이미지 */}
      <section className="mb-6 space-y-2">
        <div className="font-medium">이미지</div>

        <div
          className={`rounded border p-3 text-center ${
            dragOver ? 'bg-teal-50 border-teal-400' : 'bg-gray-50'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <div className="mb-2 text-xs text-neutral-500">
            파일을 여기로 드래그하거나 아래 버튼으로 선택하세요
          </div>
          <div className="flex justify-center">
            <button className="btn btn-sm" onClick={() => inputRef.current?.click()}>
              파일 선택
            </button>
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={onInput} />
          </div>
          <div className="mt-2 text-xs text-neutral-600 truncate">
            {fileName || '선택된 파일 없음'}
          </div>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-xs" onClick={applyBgRemove}>
            배경이미지 제거
          </button>
          <button className="btn btn-xs" onClick={restoreOriginal}>
            배경 제거 해제(원본)
          </button>
          <button className="btn btn-xs" onClick={fitContain}>
            보드에 맞추기(Contain)
          </button>
        </div>

        <div className="rounded border p-2 text-[11px] text-neutral-500">
          썸네일 클릭으로 대상 선택 · 캔버스 클릭 시 배경색 샘플링
          <br />
          팁 · 드래그/핸들로 이동·크기·회전
        </div>

        {thumbUrl && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbUrl}
              alt="thumb"
              className="h-12 w-12 rounded bg-white object-contain"
            />
            <div className="text-xs text-neutral-600">
              샘플 RGB:{' '}
              {s.bgSampleRGB ? s.bgSampleRGB.join(', ') : '샘플 미지정'}
            </div>
          </div>
        )}

        <SliderRow
          label="배경제거 임계값"
          value={s.bgThreshold}
          onChange={(v) => s.setBgThreshold(v)}
          min={0}
          max={128}
          step={1}
        />
      </section>

      {/* 구멍/귀 */}
      <section className="mb-6 space-y-2">
        <div className="font-medium">키링 구멍/귀</div>
        <div className="flex items-center justify-between">
          <span className="text-sm">모드</span>
          <select
            className="select select-bordered select-xs w-28"
            value={s.hole.mode}
            onChange={(e) => s.setHoleMode(e.target.value as 'auto' | 'manual')}
          >
            <option value="auto">자동</option>
            <option value="manual">수동(캔버스 클릭)</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">구멍 개수</span>
          <select
            className="select select-bordered select-xs w-24"
            value={s.hole.count}
            onChange={(e) => s.setHoleCount(Number(e.target.value) as 1 | 2)}
          >
            <option value={1}>1개</option>
            <option value={2}>2개</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">방향</span>
          <select
            className="select select-bordered select-xs w-24"
            value={s.hole.side}
            onChange={(e) => s.setHoleSide(e.target.value as HoleSide)}
          >
            <option value="top">상단</option>
            <option value="left">좌측</option>
            <option value="right">우측</option>
          </select>
        </div>

        <SliderRow
          label="구멍 지름"
          value={s.hole.diaMM}
          onChange={(v) => s.setHoleDiaMM(v)}
          min={2}
          max={6}
          step={0.5}
          suffix="mm"
        />
        <SliderRow
          label="귀 추가 반경"
          value={s.hole.earExtraMM}
          onChange={(v) => s.setEarExtraMM(v)}
          min={1}
          max={5}
          step={0.5}
          suffix="mm"
        />

        {s.hole.mode === 'manual' && (
          <div className="rounded-md bg-amber-50 p-2 text-[11px] text-amber-700">
            수동 모드입니다. 캔버스에서 원하는 위치를 클릭하면 구멍이 추가됩니다. 드래그로 이동 가능.
          </div>
        )}
      </section>

      {/* 컷/화이트 */}
      <section className="mb-6 space-y-2">
        <div className="font-medium">컷/화이트</div>
        <SliderRow
          label="컷 오프셋"
          value={s.cutOffsetMM}
          onChange={(v) => s.setCutOffsetMM(v)}
          min={2}
          max={12}
          step={0.5}
          suffix="mm"
        />
        <SliderRow
          label="화이트 수축"
          value={s.whiteShrinkMM}
          onChange={(v) => s.setWhiteShrinkMM(v)}
          min={0.06}
          max={0.1}
          step={0.01}
          suffix="mm"
        />
      </section>

      <div className="pt-2 text-xs text-neutral-400">
        ⓘ 배경색은 캔버스에서 클릭해 샘플링할 수 있습니다. (상단 안내문 참조)
      </div>
    </aside>
  );
}
