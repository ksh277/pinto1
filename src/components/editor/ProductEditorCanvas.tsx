'use client';

import { Stage, Layer, Rect, Image as KonvaImage } from 'react-konva';
import React, { useEffect, useState } from 'react';

type Props = {
  width: number;
  height: number;
  image?: HTMLImageElement | null;
};

const CM_TO_PX_300DPI = (cm: number) => Math.round(cm * 300 / 2.54); // 300DPI 기준
const CUT = CM_TO_PX_300DPI(0.8);   // 절제선 0.8cm ≈ 94px
const BLEED = CM_TO_PX_300DPI(1.5); // 여백 1.5cm ≈ 177px

export default function ProductEditorCanvas({ width, height, image }: Props) {
  // 이미지 contain 스케일 계산
  const [imgXYWH, setImgXYWH] = useState({ x: 0, y: 0, w: width, h: height });
  useEffect(() => {
    if (!image) return;
    const iw = image.width, ih = image.height;
    const scale = Math.min((width - 2*BLEED) / iw, (height - 2*BLEED) / ih);
    const w = iw * scale, h = ih * scale;
    const x = (width - w) / 2, y = (height - h) / 2;
    setImgXYWH({ x, y, w, h });
  }, [image, width, height]);

  return (
    <Stage width={width} height={height}>
      {/* 가이드 */}
      <Layer listening={false}>
        {/* 절제선 */}
        <Rect x={CUT} y={CUT} width={width - 2*CUT} height={height - 2*CUT} stroke="red" dash={[8,6]} />
        {/* 안전영역(bleed) */}
        <Rect x={BLEED} y={BLEED} width={width - 2*BLEED} height={height - 2*BLEED} stroke="orange" dash={[4,4]} />
      </Layer>

      {/* 사용자 이미지 */}
      <Layer>
        {image && (
          <KonvaImage
            image={image}
            x={imgXYWH.x}
            y={imgXYWH.y}
            width={imgXYWH.w}
            height={imgXYWH.h}
          />
        )}
      </Layer>
    </Stage>
  );
}
