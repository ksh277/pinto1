import { create } from 'zustand';
import { AnyShape, HoleMode, HoleSide, PathShape, ShapeType } from '@/types/editor';

const mm = (v: number) => Math.max(1, Math.round(v)); // guard

type ImagesState = {
  originals: (string | null)[];
  processed: (string | null)[];
  selected: number;
};

type Transform = { x: number; y: number; scale: number; rotation: number };

type EditorState = {
  size: { widthMM: number; heightMM: number };
  dpi: 300 | 600;
  keepRatio: boolean;

  // image
  images: ImagesState;
  bgSampleRGB: [number, number, number] | null;
  bgThreshold: number;

  // transform
  transform: Transform;
  fitToken: number;

  // hole/ear
  hole: {
    mode: HoleMode;
    count: 1 | 2;
    side: HoleSide;
    diaMM: number;        // hole diameter
    earExtraMM: number;   // extra radius around the hole
    manual: { cx: number; cy: number }[];
  };

  // offsets
  cutOffsetMM: number;
  whiteShrinkMM: number;

  // additional shapes
  shapes: AnyShape[];

  // paths
  boardPath: PathShape | null;
  whitePath: PathShape | null;
  cutlinePath: PathShape | null;

  ui: { previewPixelRatio: 1 | 2 };

  // actions
  setDpi: (d: 300 | 600) => void;
  setSizeMM: (w: number, h: number) => void;
  setKeepRatio: (v: boolean) => void;

  setBgSample: (rgb: [number, number, number]) => void;
  setBgThreshold: (t: number) => void;

  addImageFromFile: (file: File) => Promise<void>;
  setProcessedUrlForSelected: (url: string | null) => void;

  setTransform: (t: Partial<Transform>) => void;
  requestFit: () => void;

  setHoleMode: (m: HoleMode) => void;
  setHoleCount: (c: 1 | 2) => void;
  setHoleSide: (s: HoleSide) => void;
  setHoleDiaMM: (d: number) => void;
  setEarExtraMM: (d: number) => void;
  setManualHoles: (pts: { cx: number; cy: number }[]) => void;
  clearManualHoles: () => void;

  setCutOffsetMM: (m: number) => void;
  setWhiteShrinkMM: (m: number) => void;

  addShape: (t: ShapeType) => void;
  updateShape: (id: string, patch: Partial<import("@/types/editor").RectShape> | Partial<import("@/types/editor").CircleShape>) => void;
  removeShape: (id: string) => void;

  setPaths: (board: PathShape, cut: PathShape, white: PathShape) => void;
};

const genId = () => `id_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;

export const useEditorStore = create<EditorState>((set, get) => ({
  size: { widthMM: 20, heightMM: 20 },
  dpi: 300,
  keepRatio: false,

  images: { originals: [], processed: [], selected: -1 },
  bgSampleRGB: null,
  bgThreshold: 28,

  transform: { x: 0, y: 0, scale: 1, rotation: 0 },
  fitToken: 0,

  hole: {
    mode: 'auto',
    count: 1,
    side: 'top',
    diaMM: 2.5,
    earExtraMM: 2.5,
    manual: [],
  },

  cutOffsetMM: 10,
  whiteShrinkMM: 0.08,

  shapes: [],

  boardPath: { path: [] },
  whitePath: { path: [] },
  cutlinePath: { path: [] },

  ui: { previewPixelRatio: 1 },

  setDpi: (d) => set({ dpi: d }),
  setSizeMM: (w, h) => set({ size: { widthMM: mm(w), heightMM: mm(h) } }),
  setKeepRatio: (v) => set({ keepRatio: v }),

  setBgSample: (rgb) => set({ bgSampleRGB: rgb }),
  setBgThreshold: (t) => set({ bgThreshold: t }),

  addImageFromFile: async (file: File) => {
    const url = URL.createObjectURL(file);
    const imgs = get().images;
    set({
      images: {
        originals: [url],
        processed: [null],
        selected: 0,
      },
    });
  },

  setProcessedUrlForSelected: (url) => {
    const imgs = get().images;
    if (imgs.selected < 0) return;
    const processed = imgs.processed.slice();
    processed[imgs.selected] = url;
    set({ images: { ...imgs, processed } });
  },

  setTransform: (t) => set({ transform: { ...get().transform, ...t } }),
  requestFit: () => set((s) => ({ fitToken: s.fitToken + 1 })),

  setHoleMode: (m) => set((s) => ({ hole: { ...s.hole, mode: m } })),
  setHoleCount: (c) => set((s) => ({ hole: { ...s.hole, count: c } })),
  setHoleSide: (side) => set((s) => ({ hole: { ...s.hole, side } })),
  setHoleDiaMM: (d) => set((s) => ({ hole: { ...s.hole, diaMM: d } })),
  setEarExtraMM: (d) => set((s) => ({ hole: { ...s.hole, earExtraMM: d } })),
  setManualHoles: (pts) => set((s) => ({ hole: { ...s.hole, manual: pts } })),
  clearManualHoles: () => set((s) => ({ hole: { ...s.hole, manual: [] } })),

  setCutOffsetMM: (m) => set({ cutOffsetMM: m }),
  setWhiteShrinkMM: (m) => set({ whiteShrinkMM: m }),

  addShape: (t) =>
    set((s) => {
      const id = genId();
      const cx = (s.size.widthMM / 2) * (s.dpi / 25.4);
      const cy = (s.size.heightMM / 2) * (s.dpi / 25.4);
      const base = { id, x: cx - 40, y: cy - 30, rotation: 0, fillAlpha: 0.2 };
      const sh: AnyShape =
        t === 'rect' ? { ...base, type: 'rect', width: 80, height: 60 } : { ...base, type: 'circle', radius: 40 };
      return { shapes: [...s.shapes, sh] };
    }),
  updateShape: (id, patch) =>
    set((s) => ({ shapes: s.shapes.map((sh) => (sh.id === id ? { ...sh, ...patch } as AnyShape : sh)) })),
  removeShape: (id) => set((s) => ({ shapes: s.shapes.filter((sh) => sh.id !== id) })),

  setPaths: (board, cut, white) => set({ boardPath: board, cutlinePath: cut, whitePath: white }),
}));
