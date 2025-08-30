// src/components/editor/integrations/TuiImageEditorModal.tsx
'use client';
import React, { useRef } from 'react';
import dynamic from 'next/dynamic';

// dynamic import to avoid SSR issues
const ImageEditor = dynamic(() => import('@toast-ui/react-image-editor'), { ssr: false }) as any;

type Props = {
  src: string;
  onApply: (blob: Blob) => void;
  onClose: () => void;
};

export default function TuiImageEditorModal({ src, onApply, onClose }: Props){
  const ref = useRef<any>(null);

  const handleApply = async () => {
    const inst = ref.current?.getInstance?.();
    const dataURL = inst?.toDataURL?.();
    if (dataURL){
      const res = await fetch(dataURL);
      const blob = await res.blob();
      onApply(blob);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center">
      <div className="bg-white w-[1000px] h-[720px] rounded-xl shadow-xl p-3 flex flex-col">
        <div className="text-sm font-semibold mb-2">Image Editor</div>
        <div className="flex-1 overflow-hidden">
          <ImageEditor
            ref={ref}
            includeUI={{ loadImage:{ path: src, name: 'edit' }, menu: ['crop','flip','rotate','draw','shape','icon','text','filter'], initMenu: 'filter', uiSize: { width: '100%', height: '620px' } }}
            cssMaxWidth={900}
            cssMaxHeight={600}
            selectionStyle={{ cornerSize: 12, rotatingPointOffset: 24 }}
            usageStatistics={false}
          />
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={onClose} className="px-3 py-1 rounded border">취소</button>
          <button onClick={handleApply} className="px-3 py-1 rounded bg-blue-600 text-white">적용</button>
        </div>
      </div>
    </div>
  );
}
