export type NodeType = 'image' | 'text' | 'shape'
export type ShapeKind = 'rect' | 'circle' | 'star' | 'heart'
export type TemplatePlate = 'rect' | 'circle' | 'pentagon' | 'hexagon'
export type EditorMode = 'auto' | 'template'

export interface BaseNode { id: string; type: NodeType; x: number; y: number; rotation: number; scaleX: number; scaleY: number; opacity: number; locked?: boolean }
export interface ImageNode extends BaseNode { type: 'image'; src: string }
export interface TextNode extends BaseNode { type: 'text'; text: string; fontSize: number; fontFamily: string; fill: string }
export interface ShapeNode extends BaseNode { type: 'shape'; shape: ShapeKind; width: number; height: number; fill: string; stroke: string; strokeWidth: number }
export type EditorNode = ImageNode | TextNode | ShapeNode

export interface EditorSize { widthMM: number; heightMM: number; dpi: number; bleedMM: number; safeMM: number }
export interface PathPoint { x: number; y: number }

export interface EditorState {
  nodes: EditorNode[]
  selectedIds: string[]
  stageWidth: number
  stageHeight: number
  size: EditorSize
  showGrid: boolean
  showGuides: boolean

  mode: EditorMode
  templatePlate: TemplatePlate

  offsets: { borderMM: number; cutOffsetMM: number }
  boardPath?: { path: PathPoint[] }
  cutlinePath?: { path: PathPoint[] }
  whitePath?: { path: PathPoint[] }

  // ★ 배경 제거
  bgSampleRGB?: [number, number, number]
  bgThreshold: number

  // ★ 화이트/컷 파라미터(mm 단위)
  whiteShrinkMM: number

  hole: { x: number; y: number; diameterMM: number; snapToPerimeter: boolean }

  ui: {
    zoom: number
    isPanning: boolean
    sizeLocked: boolean
    ringCount: number
    ringFront: boolean
    ringBack: boolean
    ringSizeMM: number
    whiteWrap: number
  }
}
