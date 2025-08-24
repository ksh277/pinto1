'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  Banner,
  isHidden,
  setHideUntil,
  setSessionClosed,
} from '@/lib/banner';
import '@/styles/banner.css';

export function TopStripBanner() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [hideToday, setHideToday] = useState(false);
  const [hideWeek, setHideWeek] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    const start = Date.now();

    async function load() {
      try {
        const res = await fetch('/api/banners/active', { cache: 'no-store' });
        if (!res.ok) throw new Error('fetch failed');
        const data: Banner = await res.json();
        if (!data.isOpen) return;
        if (!isHidden(data.id) && mounted) {
          setBanner(data);
          console.log('banner_impression', {
            id: data.id,
            route: pathname,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('TopStripBanner: failed to load banner', err);
      } finally {
        const elapsed = Date.now() - start;
        const delay = Math.max(0, 300 - elapsed);
        setTimeout(() => {
          if (mounted) setLoading(false);
        }, delay);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleClose = () => {
    if (!banner) return;

    if (hideWeek) {
      const until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      setHideUntil(banner.id, until);
      console.log('banner_close', {
        id: banner.id,
        choice: 'week',
      });
    } else if (hideToday) {
      const now = new Date();
      const until = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      );
      setHideUntil(banner.id, until);
      console.log('banner_close', {
        id: banner.id,
        choice: 'today',
      });
    } else {
      setSessionClosed(banner.id);
      console.log('banner_close', {
        id: banner.id,
        choice: 'session',
      });
    }

    setBanner(null);
  };

  const getTextColor = (): string => {
    if (!banner) return 'text-white';
    if (banner.bgType !== 'color') return 'text-white';
    const hex = banner.bgValue.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 160 ? 'text-black' : 'text-white';
  };

  if (loading) {
    return <div className="banner-skeleton" />;
  }

  if (!banner) return null;

  const style: React.CSSProperties = {};
  if (banner.bgType === 'color') {
    style.backgroundColor = banner.bgValue;
  } else if (banner.bgType === 'gradient') {
    style.backgroundImage = banner.bgValue;
  } else if (banner.bgType === 'image') {
    style.backgroundImage = `url(${banner.bgValue})`;
    style.backgroundSize = 'cover';
    style.backgroundPosition = 'center';
  }

  return (
    <div
      role="region"
      aria-label="공지 배너"
      className={`w-full shadow-sm ring-1 ring-white/40 ${getTextColor()}`}
      style={style}
    >
      <div className="flex w-full min-h-[40px] md:min-h-[56px] max-h-[64px] md:max-h-[80px] items-center justify-center px-0 text-xs md:text-sm relative py-2 md:py-3">
        {/* 중앙 메시지 */}
        <div className="w-full flex items-center justify-center absolute left-0 top-0 h-full pointer-events-none">
          <span className="font-semibold text-center w-full block pointer-events-auto">
            {banner.href ? (
              <Link href={banner.href} className="hover:underline">
                {banner.message || '나만의 굿즈 메이킹'}
              </Link>
            ) : (
              <span>{banner.message || '나만의 굿즈 메이킹'}</span>
            )}
          </span>
        </div>
        {/* 오른쪽: 체크박스 & 닫기 */}
        {banner.canClose && (
          <div className="flex items-center gap-2 whitespace-nowrap absolute right-4 md:right-5 top-1/2 -translate-y-1/2 bg-transparent z-10">
            <input
              id="hideToday"
              type="checkbox"
              className="h-4 w-4"
              checked={hideToday}
              onChange={e => {
                const checked = e.target.checked;
                setHideToday(checked);
                if (checked) setHideWeek(false);
              }}
            />
            <label htmlFor="hideToday" className="cursor-pointer select-none text-xs">
              오늘하루 보지 않기
            </label>
            <input
              id="hideWeek"
              type="checkbox"
              className="h-4 w-4"
              checked={hideWeek}
              onChange={e => {
                const checked = e.target.checked;
                setHideWeek(checked);
                if (checked) setHideToday(false);
              }}
            />
            <label htmlFor="hideWeek" className="cursor-pointer select-none text-xs">
              일주일 간 보지 않기
            </label>
            <button
              aria-label="띠배너 닫기"
              onClick={handleClose}
              className="p-1 hover:opacity-80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopStripBanner;
