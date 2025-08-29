// src/types/editor.ts
// -------------------- 기본 타입 --------------------
export type HoleSide = 'top' | 'left' | 'right';
export type HoleMode = 'auto' | 'manual';
export type Tool = 'select' | 'hole' | 'rect' | 'circle';

export type ShapeType = 'rect' | 'circle';

export type PathPoint = { x: number; y: number };
export type PathShape = { path: PathPoint[] };

export interface TransformState {
  x: number;          // px
  y: number;          // px
  scale: number;      // uniform scale (이미지용)
  rotation: number;   // deg
}

// -------------------- 도형 --------------------
export interface BaseShape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  rotation: number;
  /** 미리보기용 투명도 (0~1). 지정 안하면 UI에서 기본값 사용 */
  fillAlpha?: number;
}
export interface RectShape extends BaseShape {
  type: 'rect';
  width: number;
  height: number;
}
export interface CircleShape extends BaseShape {
  type: 'circle';
  radius: number;
}
export type AnyShape = RectShape | CircleShape;

// -------------------- 에디터 상태 --------------------
export interface EditorState {
  dpi: 300 | 600;
  size: { widthMM: number; heightMM: number };

  images: {
    /** 원본 이미지 URL 목록 (없을 수도 있으니 null 허용) */
    originals: (string | null)[];
    /** 배경제거 등 처리된 결과 URL (없으면 null) */
    processed: (string | null)[];
    /** 현재 선택 인덱스, 없으면 -1 */
    selected: number;
  };

  bgSampleRGB: [number, number, number] | null;
  bgThreshold: number;

  cutOffsetMM: number;
  whiteShrinkMM: number;

  hole: {
    mode: HoleMode;
    /** auto 모드에서만 의미 */
    count: 1 | 2;
    /** auto 모드에서만 의미 */
    side: HoleSide;
    diaMM: number;
    earExtraMM: number;
    /** manual 모드일 때 수동 배치 좌표(px) */
    manual: { cx: number; cy: number }[];
  };

  /** 업로드 이미지 변환 상태 */
  transform: TransformState;
  /** 이미지 리사이즈 비율 고정 여부 */
  keepRatio: boolean;

  /** 사용자 추가 도형 */
  shapes: AnyShape[];

  /** 보드/컷/화이트 경로(없으면 null) */
  boardPath: PathShape | null;
  cutlinePath: PathShape | null;
  whitePath: PathShape | null;

  /** 보드 맞추기 트리거용 토큰 */
  fitToken: number;

  ui: {
    /** 미리보기 배율(픽셀 비율) */
    previewPixelRatio: 1 | 2;
  };
}

// -------------------- 액션(스토어 메서드 시그니처) --------------------
export interface EditorActions {
  setDpi: (dpi: 300 | 600) => void;
  setSizeMM: (w: number, h: number) => void;

  /** 파일에서 이미지 추가(실제 구현은 store에서) */
  addImageFromFile: (file: File) => Promise<void>;
  /** 선택된 이미지의 처리 결과 URL 셋 */
  setProcessedUrlForSelected: (url: string | null) => void;

  setBgSample: (rgb: [number, number, number]) => void;
  setBgThreshold: (v: number) => void;

  setCutOffsetMM: (mm: number) => void;
  setWhiteShrinkMM: (mm: number) => void;

  setHoleMode: (m: HoleMode) => void;
  setHoleCount: (c: 1 | 2) => void;
  setHoleSide: (s: HoleSide) => void;
  setHoleDiaMM: (v: number) => void;
  setEarExtraMM: (v: number) => void;
  setManualHoles: (pts: { cx: number; cy: number }[]) => void;
  clearManualHoles: () => void;

  setTransform: (patch: Partial<TransformState>) => void;
  setKeepRatio: (b: boolean) => void;
  /** 보드에 맞추기 트리거 */
  requestFit: () => void;

  addShape: (t: ShapeType) => void;
  updateShape: (id: string, patch: Partial<RectShape> | Partial<CircleShape>) => void;
  removeShape: (id: string) => void;

  setPaths: (board: PathShape, cut: PathShape, white: PathShape) => void;

  setPreviewPixelRatio: (r: 1 | 2) => void;
}
