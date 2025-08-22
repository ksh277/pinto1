'use client';

import { useEffect, useRef } from 'react';
import { MegaPanel } from './MegaPanel';
import type { MegaGroup } from '@/lib/nav';

interface MegaMenuProps {
  activeTopId: string | null;
  groups?: MegaGroup[];
  onClose: () => void;
}

/**
 * Wrapper that renders mega menu panels for desktop and mobile.
 * - 데스크톱: 절대 위치, hover 유지
 * - 모바일: 오버레이 + 바깥 클릭 시 닫힘
 */
export function MegaMenu({ activeTopId, groups, onClose }: MegaMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click (mobile)
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (activeTopId) {
      document.addEventListener('mousedown', handle);
    }
    return () => document.removeEventListener('mousedown', handle);
  }, [activeTopId, onClose]);

  if (!activeTopId || !groups) return null;

  return (
    <>
      {/* Desktop panel */}
      <div
        className="absolute left-0 top-full hidden w-full border-b bg-white shadow-md md:block"
        onMouseLeave={onClose}
      >
        <MegaPanel groups={groups} />
      </div>
      {/* Mobile overlay */}
      <div className="md:hidden" ref={ref}>
        <div className="fixed inset-0 z-40 bg-black/30" />
        <div className="fixed inset-x-0 top-12 z-50 max-h-[80vh] overflow-y-auto rounded-t-xl bg-white shadow-lg">
          <MegaPanel groups={groups} />
        </div>
      </div>
    </>
  );
}

