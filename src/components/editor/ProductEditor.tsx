
'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import type { CanvasElement, CanvasSize } from './EditorLayout';
import { Trash2 } from 'lucide-react';


interface ProductEditorProps {
  canvasSize: CanvasSize;
  elements: CanvasElement[];
  selectedElement: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  onCommitUpdate: () => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

export function ProductEditor({
  canvasSize,
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onCommitUpdate,
  canvasRef,
}: ProductEditorProps) {
  const editorAreaRef = useRef<HTMLDivElement>(null);

  const handleSelect = (e: React.MouseEvent, id: string | null) => {
    e.stopPropagation();
    onSelectElement(id);
  };
  
  const handleElementMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onSelectElement(id);

    const element = elements.find(el => el.id === id);
    if (!element || !editorAreaRef.current) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startElX = element.x;
    const startElY = element.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      onUpdateElement(id, { x: startElX + dx, y: startElY + dy });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      onCommitUpdate();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onSelectElement(id);
    
    const element = elements.find(el => el.id === id);
    if (!element) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.width;
    const startHeight = element.height;
    const keepRatio = e.shiftKey;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      const aspect = startWidth / startHeight;
      let newWidth = startWidth + dx;
      let newHeight = keepRatio ? newWidth / aspect : startHeight + dy;

      const min = 16;
      newWidth = Math.max(min, newWidth);
      newHeight = Math.max(min, newHeight);

      newWidth = Math.min(newWidth, canvasSize.width - element.x);
      newHeight = Math.min(newHeight, canvasSize.height - element.y);

      if (keepRatio) {
        if(newWidth / aspect > canvasSize.height - element.y) {
           newWidth = (canvasSize.height - element.y) * aspect;
           newHeight = newWidth / aspect;
        } else {
           newHeight = newWidth / aspect;
        }
      }
      
      onUpdateElement(id, { width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      onCommitUpdate();
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };


  return (
    <div
      ref={editorAreaRef}
      className="p-8 w-full h-full flex items-center justify-center"
      onClick={(e) => handleSelect(e, null)}
    >
      <div
        ref={canvasRef}
        className="relative bg-white shadow-lg"
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
        }}
      >
        {/* Placeholder for Canvas Content */}
        <div className="absolute inset-0 flex items-center justify-center">
            {elements.length === 0 && <span className="text-gray-400">여기에 이미지를 추가하세요</span>}
        </div>
        
        {/* Example manufacturing guides */}
        <div className="absolute inset-[-18px] border-[18px] border-blue-200/50 rounded-2xl pointer-events-none"></div>
        <div className="absolute top-[-25px] left-1/2 -translate-x-1/2 w-4 h-4 border-2 border-red-500 bg-white rounded-full pointer-events-none"></div>


        {elements.map((el) => (
          <div
            key={el.id}
            onMouseDown={(e) => handleElementMouseDown(e, el.id)}
            className={`absolute cursor-move group ${selectedElement === el.id ? 'border-2 border-blue-500' : 'border-2 border-transparent hover:border-blue-500/50'}`}
            style={{
              left: el.x,
              top: el.y,
              width: el.width,
              height: el.height,
              transform: `rotate(${el.rotation}deg)`,
              zIndex: el.zIndex,
              visibility: el.visible ? 'visible' : 'hidden',
            }}
          >
            {el.type === 'image' && el.src && (
              <Image src={el.src} alt="" fill className="object-contain pointer-events-none" />
            )}
            {el.type === 'text' && (
              <div
                style={{
                  fontSize: el.fontSize,
                  fontFamily: el.fontFamily,
                  color: el.color,
                  fontWeight: el.fontWeight,
                  fontStyle: el.fontStyle,
                }}
                className="w-full h-full flex items-center justify-center pointer-events-none"
              >
                {el.text}
              </div>
            )}
            {el.type === 'shape' && (
              <div
                style={{
                  backgroundColor: el.fill,
                  borderRadius: el.shapeType === 'circle' ? '50%' : '0',
                }}
                className="w-full h-full pointer-events-none"
              ></div>
            )}
             {selectedElement === el.id && (
               <>
                <div 
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize border-2 border-white"
                  onMouseDown={(e) => handleResizeMouseDown(e, el.id)}
                />
                <div 
                  className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full cursor-pointer flex items-center justify-center"
                     onMouseDown={(e) => { e.stopPropagation(); onDeleteElement(el.id); }}>
                    <Trash2 className="w-2 h-2 text-white" />
                </div>
               </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
