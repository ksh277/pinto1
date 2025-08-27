'use client'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { produce } from 'immer'
import type {
  EditorNode, EditorState, ImageNode, TextNode, ShapeNode, ShapeKind, TemplatePlate, PathPoint
} from '@/types/editor'

const DPI = 300
const mmToPx = (mm: number, dpi = DPI) => (mm / 25.4) * dpi
const uuid = () => (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2))

const initialState: EditorState = {
  nodes: [],
  selectedIds: [],
  stageWidth: mmToPx(70),
  stageHeight: mmToPx(70),
  size: { widthMM: 70, heightMM: 70, dpi: DPI, bleedMM: 3, safeMM: 3 },
  showGrid: false,
  showGuides: false,
  mode: 'auto',
  templatePlate: 'rect',
  offsets: { borderMM: 15, cutOffsetMM: 10 },
  boardPath: undefined,
  cutlinePath: undefined,
  whitePath: undefined,
  bgSampleRGB: undefined,
  bgThreshold: 28,
  whiteShrinkMM: 0.08,
  hole: { x: mmToPx(35), y: mmToPx(6), diameterMM: 4, snapToPerimeter: true },

  // --- UI (올댓프린팅 스타일)
  ui: {
    zoom: 1,
    isPanning: false,
    sizeLocked: false,           // 사이즈 선택 완료 여부
    ringCount: 1,
    ringFront: true,
    ringBack: true,
    ringSizeMM: 2.5,
    whiteWrap: 1,                // 화이트 둘러싸기(px 비례치)
  },
}

type UndoState = EditorState

interface Store {
  state: EditorState
  history: UndoState[]
  future: UndoState[]
  set: (fn: (draft: EditorState) => void) => void
  undo: () => void
  redo: () => void
  clearHistory: () => void

  // editor
  setMode: (m: EditorState['mode']) => void
  setTemplate: (t: TemplatePlate) => void
  setOffsets: (borderMM: number, cutOffsetMM: number) => void
  addImageFromSrc: (src: string) => void
  addText: (text?: string) => void
  addShape: (kind: ShapeKind) => void
  select: (ids: string[]) => void
  updateNode: (id: string, patch: Partial<EditorNode>) => void
  removeSelected: () => void
  duplicateSelected: () => void
  setSizeMM: (w: number, h: number) => void
  setPaths: (board?: { path: PathPoint[] }, cut?: { path: PathPoint[] }, white?: { path: PathPoint[] }) => void
  setHole: (x: number, y: number, diameterMM?: number) => void
  setBgSample: (rgb: [number, number, number]) => void
  setBgThreshold: (v: number) => void
  setCutOffsetMM: (mm: number) => void
  setWhiteShrinkMM: (mm: number) => void

  // UI
  setZoom: (z: number) => void
  zoomIn: () => void
  zoomOut: () => void
  setPanning: (b: boolean) => void
  lockSize: (b: boolean) => void
  setRingCount: (n: number) => void
  setRingSize: (mm: number) => void
  toggleRingFront: () => void
  toggleRingBack: () => void
  setWhiteWrap: (v: number) => void
}

export const useEditorStore = create<Store>()(devtools((set, get) => ({
  state: initialState,
  history: [],
  future: [],
  set: (fn) => set((s) => {
    const prev = s.state
    const next = produce(prev, fn)
    return { state: next, history: [...s.history, prev], future: [] }
  }),
  undo: () => set((s) => { if (!s.history.length) return s; const prev = s.history.at(-1)!; const history = s.history.slice(0, -1); return { state: prev, history, future: [s.state, ...s.future] } }),
  redo: () => set((s) => { if (!s.future.length) return s; const next = s.future[0]; const future = s.future.slice(1); return { state: next, history: [...s.history, s.state], future } }),
  clearHistory: () => set((s) => ({ ...s, history: [], future: [] })),

  setMode: (m) => get().set((d) => { d.mode = m }),
  setTemplate: (t) => get().set((d) => { d.templatePlate = t }),
  setOffsets: (b, c) => get().set((d) => { d.offsets.borderMM = b; d.offsets.cutOffsetMM = c }),

  addImageFromSrc: (src) => get().set((d) => {
    if (!d.ui.sizeLocked) return
    const node: ImageNode = { id: uuid(), type: 'image', src, x: d.stageWidth/2 - 100, y: d.stageHeight/2 - 100, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1 }
    d.nodes.push(node); d.selectedIds = [node.id]
  }),
  addText: (text = '텍스트') => get().set((d) => {
    if (!d.ui.sizeLocked) return
    const node: TextNode = { id: uuid(), type: 'text', text, x: d.stageWidth/2 - 40, y: d.stageHeight/2 - 8, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1, fontSize: 22, fontFamily: 'Pretendard, sans-serif', fill: '#111' }
    d.nodes.push(node); d.selectedIds = [node.id]
  }),
  addShape: (kind) => get().set((d) => {
    if (!d.ui.sizeLocked) return
    const node: ShapeNode = { id: uuid(), type: 'shape', shape: kind, x: d.stageWidth/2 - 50, y: d.stageHeight/2 - 50, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1, width: 100, height: 100, fill: 'transparent', stroke: '#111', strokeWidth: 2 }
    d.nodes.push(node); d.selectedIds = [node.id]
  }),

  select: (ids) => get().set((d) => { d.selectedIds = ids }),
  updateNode: (id, patch) => get().set((d) => { const i = d.nodes.findIndex(n => n.id === id); if (i >= 0) d.nodes[i] = { ...d.nodes[i], ...patch } as EditorNode }),
  removeSelected: () => get().set((d) => { d.nodes = d.nodes.filter(n => !d.selectedIds.includes(n.id)); d.selectedIds = [] }),
  duplicateSelected: () => get().set((d) => { const add: EditorNode[] = []; d.nodes.forEach(n => { if (d.selectedIds.includes(n.id)) add.push({ ...n, id: uuid(), x: n.x + 10, y: n.y + 10 } as EditorNode) }); d.nodes.push(...add) }),

  setSizeMM: (w, h) => get().set((d) => {
    const pxW = mmToPx(w, d.size.dpi), pxH = mmToPx(h, d.size.dpi)
    d.size.widthMM = w; d.size.heightMM = h; d.stageWidth = pxW; d.stageHeight = pxH
  }),
  setPaths: (board, cut, white) => get().set((d) => { d.boardPath = board; d.cutlinePath = cut; d.whitePath = white }),
  setHole: (x, y, diameterMM) => get().set((d) => { d.hole.x = x; d.hole.y = y; if (diameterMM) d.hole.diameterMM = diameterMM }),
  setBgSample: (rgb) => get().set((d) => { d.bgSampleRGB = rgb }),
  setBgThreshold: (v) => get().set((d) => { d.bgThreshold = Math.max(0, Math.min(128, v)) }),
  setCutOffsetMM: (mm) => get().set((d) => { d.offsets.cutOffsetMM = Math.max(2, Math.min(15, mm)) }),
  setWhiteShrinkMM: (mm) => get().set((d) => { d.whiteShrinkMM = Math.max(0.06, Math.min(0.10, mm)) }),

  setZoom: (z) => get().set((d) => { d.ui.zoom = Math.min(4, Math.max(0.25, z)) }),
  zoomIn: () => get().set((d) => { d.ui.zoom = Math.min(4, d.ui.zoom + 0.1) }),
  zoomOut: () => get().set((d) => { d.ui.zoom = Math.max(0.25, d.ui.zoom - 0.1) }),
  setPanning: (b) => get().set((d) => { d.ui.isPanning = b }),
  lockSize: (b) => get().set((d) => { d.ui.sizeLocked = b }),
  setRingCount: (n) => get().set((d) => { d.ui.ringCount = Math.max(1, Math.min(4, n)) }),
  setRingSize: (mm) => get().set((d) => { d.ui.ringSizeMM = mm }),
  toggleRingFront: () => get().set((d) => { d.ui.ringFront = !d.ui.ringFront }),
  toggleRingBack: () => get().set((d) => { d.ui.ringBack = !d.ui.ringBack }),
  setWhiteWrap: (v) => get().set((d) => { d.ui.whiteWrap = Math.max(0, v) }),
})))
