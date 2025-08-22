export const DPI = 300;
export const MM2PX = (mm: number) => Math.round((mm * DPI) / 25.4);
export const PX2MM = (px: number) => (px * 25.4) / DPI;

export const MATERIALS = {
  acrylic: { thicknessMM: 3, minHoleDiameterMM: 3, minHoleEdgeClearanceMM: 2, minCornerRadiusMM: 1.5 },
  wood: { thicknessMM: 4, minHoleDiameterMM: 4, minHoleEdgeClearanceMM: 2.5, minCornerRadiusMM: 2 },
  sticker: { thicknessMM: 0.2, minHoleDiameterMM: 3, minHoleEdgeClearanceMM: 1.5, minCornerRadiusMM: 1 },
};

export const BLEED_MM = 8.0;
export const SAFE_INNER_MM = 2.5;
