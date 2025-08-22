'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Banner } from '@/lib/types';
import { cn } from '@/lib/utils';

function getHideKey(id: string) {
  return `banner_hide_${id}`;
}

export function TopBanner() {
  const [banner, setBanner] = useState<Banner | null>(null);

  useEffect(() => {
    async function fetchBanner() {
      try {
        const res = await fetch('/api/banners/active');
        if (!res.ok) return;
        const data: Banner | null = await res.json();
        if (!data) return;

        const hideKey = getHideKey(data.id);
        const hideUntil = localStorage.getItem(hideKey);
        if (hideUntil && Date.now() < Number(hideUntil)) {
          return;
        }
        setBanner(data);
      } catch (e) {
        console.error(e);
      }
    }
    fetchBanner();
  }, []);

  if (!banner) return null;

  const handleHide = () => {
    const ms = banner.durationOption === 'week' ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const hideUntil = Date.now() + ms;
    localStorage.setItem(getHideKey(banner.id), hideUntil.toString());
    setBanner(null);
  };

  const label = banner.durationOption === 'week' ? '일주일 간 보지 않기' : '오늘 하루 보지 않기';

  return (
    <div
      className={cn('w-full text-center text-sm text-white', 'px-4 py-2')}
      style={
        banner.backgroundType === 'color'
          ? { backgroundColor: banner.backgroundValue }
          : {
              backgroundImage: `url(${banner.backgroundValue})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
      }
    >
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-center gap-2">
        <span className="flex-1" dangerouslySetInnerHTML={{ __html: banner.content }} />
        <label className="flex cursor-pointer items-center gap-1 whitespace-nowrap text-xs sm:text-sm">
          <input type="checkbox" onChange={handleHide} />
          <span>{label}</span>
        </label>
        <X className="h-4 w-4 cursor-pointer" onClick={() => setBanner(null)} />
      </div>
    </div>
  );
}

export default TopBanner;

