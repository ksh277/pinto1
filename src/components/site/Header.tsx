'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart } from 'lucide-react';
import { MegaMenu } from './MegaMenu';
import { TopMenu, topMenus } from '@/lib/nav';

/**
 * 상단 헤더와 내비게이션 바를 렌더링합니다.
 * - 데스크톱: hover로 메가메뉴 열기
 * - 모바일: 탭으로 열기, 바깥 클릭 닫힘
 * - 키보드: ←/→ 상단 이동, ↓ 열기, Esc 닫기
 */
export function Header() {
  const [activeTop, setActiveTop] = useState<TopMenu | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const visibleTops = topMenus.filter(t => t.show).sort((a, b) => a.order - b.order);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
    item: TopMenu,
  ) => {
    const max = visibleTops.length;
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        btnRefs.current[(index + 1) % max]?.focus();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        btnRefs.current[(index - 1 + max) % max]?.focus();
        break;
      case 'ArrowDown':
      case 'Enter':
      case ' ': // space
        e.preventDefault();
        setActiveTop(item);
        break;
      case 'Escape':
        setActiveTop(null);
        (e.target as HTMLElement).blur();
        break;
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white ${scrolled ? 'shadow-md' : ''}`}
    >
      <div className="mx-auto flex h-12 items-center justify-between px-4">
        <Link href="/" className="font-bold">PINTO</Link>
        {/* Desktop Nav */}
        <nav
          className="hidden gap-6 md:flex"
          role="menubar"
        >
          {visibleTops.map((item, i) => (
            <button
              key={item.id}
              ref={el => {
                btnRefs.current[i] = el;
              }}
              role="menuitem"
              aria-haspopup={item.groups ? true : undefined}
              aria-expanded={activeTop?.id === item.id}
              className="text-sm font-medium hover:text-primary focus:outline-none"
              onMouseEnter={() => setActiveTop(item)}
              onFocus={() => setActiveTop(item)}
              onKeyDown={e => handleKeyDown(e, i, item)}
              onClick={() => setActiveTop(item)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5" aria-hidden />
          <ShoppingCart className="h-5 w-5" aria-hidden />
        </div>
      </div>
      {/* Mobile scrollable nav */}
      <nav className="flex overflow-x-auto border-t px-4 md:hidden" role="menubar">
        {visibleTops.map(item => (
          <button
            key={item.id}
            role="menuitem"
            aria-haspopup={item.groups ? true : undefined}
            aria-expanded={activeTop?.id === item.id}
            className="py-3 px-2 text-sm font-medium hover:text-primary focus:outline-none"
            onClick={() =>
              setActiveTop(activeTop?.id === item.id ? null : item)
            }
          >
            {item.label}
          </button>
        ))}
      </nav>
      <MegaMenu
        activeTopId={activeTop?.id ?? null}
        groups={activeTop?.groups}
        onClose={() => setActiveTop(null)}
      />
    </header>
  );
}

