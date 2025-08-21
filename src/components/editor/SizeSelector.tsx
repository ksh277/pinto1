
'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { CanvasSize } from './EditorLayout';

interface SizeSelectorProps {
  productType: string;
  onSizeSet: (size: CanvasSize) => void;
}

const DPI = 300;
const MM_PER_INCH = 25.4;

export function SizeSelector({ productType, onSizeSet }: SizeSelectorProps) {
  const [width, setWidth] = useState('50');
  const [height, setHeight] = useState('50');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const widthMM = parseFloat(width);
    const heightMM = parseFloat(height);

    if (isNaN(widthMM) || isNaN(heightMM) || widthMM <= 0 || heightMM <= 0) {
      return;
    }

    const widthPx = Math.round((widthMM / MM_PER_INCH) * DPI);
    const heightPx = Math.round((heightMM / MM_PER_INCH) * DPI);

    onSizeSet({
      width: widthPx,
      height: heightPx,
      widthMM: widthMM,
      heightMM: heightMM,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="width" className="text-xs">가로 (mm)</Label>
        <Input
          id="width"
          type="number"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          className="bg-gray-700 border-gray-600 text-white text-xs h-8"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="height" className="text-xs">세로 (mm)</Label>
        <Input
          id="height"
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="bg-gray-700 border-gray-600 text-white text-xs h-8"
        />
      </div>
      <Button type="submit" size="sm" className="w-full text-xs">
        적용하기
      </Button>
    </form>
  );
}
