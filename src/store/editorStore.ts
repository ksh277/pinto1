'use client'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import produce from 'immer'
import type { EditorNode, EditorState, ImageNode, TextNode, ShapeNode, ShapeKind, TemplatePlate } from '@/types/editor'

const DPI = 300
const mmToPx = (mm: number, dpi = DPI) => (mm / 25.4) * dpi
const uuid = () => (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2))

const initialState: EditorState = {
  nodes: [],
  selectedIds: [],
  stageWidth: mmToPx(70),
  stageHeight: mmToPx(70),
  size: { widthMM: 70, heightMM: 70, dpi: DPI, bleedMM: 3, safeMM: 3 },
  showGrid: true,
  showGuides: true,
  mode: 'auto',
  templatePlate: 'rect',
  offsets: { borderMM: 15, cutOffsetMM: 8 },
  boardPath: undefined,
  cutlinePath: undefined,
  hole: { x: mmToPx(35), y: mmToPx(6), diameterMM: 4, snapToPerimeter: true },
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
  setGuides: (show: boolean) => void
  setGrid: (show: boolean) => void

  setPaths: (board?: EditorState['boardPath'], cut?: EditorState['cutlinePath']) => void
  setHole: (x: number, y: number, diameterMM?: number) => void
}

export const useEditorStore = create<Store>()(devtools((set, get) => ({
  state: initialState,
  history: [],
  future: [],
  set: (fn) => set((s) => { const prev = s.state; const next = produce(prev, fn); return { state: next, history: [...s.history, prev], future: [] } }),
  undo: () => set((s) => { if (!s.history.length) return s; const prev = s.history.at(-1)!; const history = s.history.slice(0, -1); return { state: prev, history, future: [s.state, ...s.future] } }),
  redo: () => set((s) => { if (!s.future.length) return s; const next = s.future[0]; const future = s.future.slice(1); return { state: next, history: [...s.history, s.state], future } }),
  clearHistory: () => set((s) => ({ ...s, history: [], future: [] })),

  setMode: (m) => get().set((d) => { d.mode = m }),
  setTemplate: (t) => get().set((d) => { d.templatePlate = t }),
  setOffsets: (b, c) => get().set((d) => { d.offsets.borderMM = b; d.offsets.cutOffsetMM = c }),

  addImageFromSrc: (src: string) => get().set((d: EditorState) => { const node: ImageNode = { id: uuid(), type: 'image', src, x: d.stageWidth/2 - 100, y: d.stageHeight/2 - 100, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1 }; d.nodes.push(node); d.selectedIds = [node.id] }),
  addText: (text = '텍스트') => get().set((d: EditorState) => { const node: TextNode = { id: uuid(), type: 'text', text, x: d.stageWidth/2 - 50, y: d.stageHeight/2 - 10, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1, fontSize: 24, fontFamily: 'Pretendard, sans-serif', fill: '#111' }; d.nodes.push(node); d.selectedIds = [node.id] }),
  addShape: (kind: ShapeKind) => get().set((d: EditorState) => { const node: ShapeNode = { id: uuid(), type: 'shape', shape: kind, x: d.stageWidth/2 - 50, y: d.stageHeight/2 - 50, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1, width: 100, height: 100, fill: 'transparent', stroke: '#111', strokeWidth: 2 }; d.nodes.push(node); d.selectedIds = [node.id] }),

  select: (ids: string[]) => get().set((d: EditorState) => { d.selectedIds = ids }),
  updateNode: (id: string, patch: Partial<EditorNode>) => get().set((d: EditorState) => { const i = d.nodes.findIndex((n: EditorNode) => n.id === id); if (i >= 0) d.nodes[i] = { ...d.nodes[i], ...patch } as EditorNode }),
  removeSelected: () => get().set((d: EditorState) => { d.nodes = d.nodes.filter((n: EditorNode) => !d.selectedIds.includes(n.id)); d.selectedIds = [] }),
  duplicateSelected: () => get().set((d: EditorState) => { const add: EditorNode[] = []; d.nodes.forEach((n: EditorNode) => { if (d.selectedIds.includes(n.id)) add.push({ ...n, id: uuid(), x: n.x + 10, y: n.y + 10 } as EditorNode) }); d.nodes.push(...add) }),

  setSizeMM: (w: number, h: number) => get().set((d: EditorState) => { const pxW = mmToPx(w, d.size.dpi), pxH = mmToPx(h, d.size.dpi); d.size.widthMM = w; d.size.heightMM = h; d.stageWidth = pxW; d.stageHeight = pxH }),
  setGuides: (show: boolean) => get().set((d: EditorState) => { d.showGuides = show }),
  setGrid: (show: boolean) => get().set((d: EditorState) => { d.showGrid = show }),

  setPaths: (board?: EditorState['boardPath'], cut?: EditorState['cutlinePath']) => get().set((d: EditorState) => { d.boardPath = board; d.cutlinePath = cut }),
  setHole: (x: number, y: number, diameterMM?: number) => get().set((d: EditorState) => { d.hole.x = x; d.hole.y = y; if (diameterMM) d.hole.diameterMM = diameterMM }),
})))
