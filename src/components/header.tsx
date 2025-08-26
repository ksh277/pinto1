'use client';
/* eslint-disable @typescript-eslint/no-require-imports */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import Link from 'next/link';
import { Search, ShoppingCart, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Image from 'next/image';
import { mainNavItems } from '@/lib/categories';
import { HeaderAuthNav } from './header-auth-nav';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { TopStripBanner } from './TopStripBanner';

export function Header() {
  const [activeSubNav, setActiveSubNav] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleCategoryHover = (cat: string) => {
    setActiveCategory(cat);
    const item = mainNavItems.find(i => i.id === cat);
    setActiveSubNav(item?.subnav ? cat : null);
  };

  const handleCategoryLeave = () => {
    setActiveSubNav(null);
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    const item = mainNavItems.find(i => i.id === cat);
    setActiveSubNav(item?.subnav ? cat : null);
  };

  const subNavToShow = mainNavItems.find(item => item.id === activeSubNav)?.subnav;
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleOrderClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      router.push('/mypage/orders');
    }
  };

  return (
    <header className="w-full flex-col border-b bg-background">
      <TopStripBanner />

      {/* 상단 유틸 바 */}

  <div className="border-b hidden md:block">
  </div>
        <div className="w-full mx-auto flex h-10 items-center px-4 text-xs">
          <div className="flex flex-1 items-center justify-end gap-4">
            <Link href="/register" className="hover:text-primary text-sm">회원가입</Link>
            <Link href="/login" className="hover:text-primary text-sm">로그인</Link>
            <Link href="/mypage/orders" className="hover:text-primary text-sm" onClick={handleOrderClick}>주문조회</Link>
          </div>
        </div>



      {/* 메인 헤더 */}
      <div className="w-full">
        {/* 카테고리 네비 + 서브네비 전체 래퍼 */}
        <div
          className="relative"
          onMouseLeave={handleCategoryLeave}
        >
          <div className="flex h-15 items-center justify-between w-full px-0">
          <Link href="/" className="flex items-center gap-2 text-3xl font-bold ml-8">
            <Image src={require('./img/logo.png')} width={150} height={30} alt="logo" className="object-contain" />
          </Link>

          {/* 모바일 아이콘 */}
          <div className="flex items-center md:hidden">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/search">
                <Search className="h-6 w-6" />
                <span className="sr-only">검색</span>
              </Link>
            </Button>
          </div>

          {/* 모바일 장바구니 + 메뉴 */}
          <div className="flex items-center gap-2 md:hidden">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-6 w-6" />
                <span className="sr-only">주문조회</span>
              </Link>
            </Button>
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">메뉴 열기</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm">
                <SheetHeader>
                  <SheetTitle>
                    <Link href="/" onClick={closeMobileMenu}>
                      <Image src={require('./img/logo.png')} width={150} height={30} alt="logo" />
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col h-full">
                  <div className="pb-4 border-b">
                    <HeaderAuthNav />
                  </div>
                  <nav className="mt-6 flex-grow">
                    <Accordion type="multiple" className="w-full">
                      {mainNavItems.map((item) => (
                        <AccordionItem value={item.id} key={item.id}>
                          <AccordionTrigger className="text-base font-semibold py-3 hover:no-underline">
                            <Link href={item.href} onClick={!item.subnav ? closeMobileMenu : (e) => e.preventDefault()} className="flex-1 text-left">
                              {item.label}
                            </Link>
                          </AccordionTrigger>
                          {item.subnav && (
                            <AccordionContent className="pb-1 pl-4">
                              <div className="flex flex-col items-start gap-1">
                                {item.subnav.map(subItem => (
                                  <Button key={subItem.label} variant="link" asChild className="h-auto p-1 text-muted-foreground">
                                    <Link href={subItem.href} onClick={closeMobileMenu}>{subItem.label}</Link>
                                  </Button>
                                ))}
                              </div>
                            </AccordionContent>
                          )}
                        </AccordionItem>
                      ))}
                      <div className="border-t"><Link href="/editor" onClick={closeMobileMenu} className="flex items-center text-base font-semibold py-3">굿즈 에디터</Link></div>
                      <div className="border-t"><Link href="/reviews" onClick={closeMobileMenu} className="flex items-center text-base font-semibold py-3">리뷰</Link></div>
                      <div className="border-t"><Link href="/community" onClick={closeMobileMenu} className="flex items-center text-base font-semibold py-3">커뮤니티</Link></div>
                      <div className="border-t"><Link href="/support/notice" onClick={closeMobileMenu} className="flex items-center text-base font-semibold py-3">고객센터</Link></div>
                    </Accordion>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

  {/* 카테고리 네비 + 검색 */}
  <div className={`sticky top-0 z-40 hidden md:flex h-14 items-center w-full justify-between bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 ${scrolled ? 'shadow-sm' : ''}`}>
          <ul className="flex items-center gap-12 ml-16 list-none">
            {[
              { id: 'all', label: 'ALL' },
              { id: 'acrylic', label: '아크릴' },
              { id: 'paper', label: '지류' },
              { id: 'sticker', label: '스티커' },
              { id: 'clothing', label: '의류' },
              { id: 'frame', label: '액자' },
              { id: 'stationery', label: '문구/오피스' },
              { id: 'ipgoods', label: 'IP굿즈 상품개발' },
              { id: 'kit', label: '기업/웰컴 키트' },
              { id: 'group', label: '단체 판촉' },
            ].map((item, index) => (
              <li key={index}>
                <button
                  className={clsx(
                    'relative px-2 py-1 text-base font-semibold transition-colors',
                    activeCategory === item.id
                      ? 'text-primary after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:bg-primary'
                      : 'text-muted-foreground hover:text-primary'
                  )}
                  onMouseEnter={() => handleCategoryHover(item.id!)}
                  onClick={() => handleCategoryClick(item.id!)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex-shrink-0 w-[600px] max-w-[600px] mr-16">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="2,000여개의 커스텀 상품을 쉽게 찾아 보세요."
                className="w-full rounded-full border-2 border-primary bg-background py-2 pl-10 pr-4 text-base"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 서브 네비 */}
      {subNavToShow && (
        activeSubNav === 'all' ? (
          <div
            className="hidden md:block border-t bg-background shadow-md absolute left-0 w-full z-40"
            onMouseEnter={() => setActiveSubNav('all')}
            onMouseLeave={handleCategoryLeave}
          >
            <div className="w-full px-8 py-8">
              <div className="grid grid-cols-6 gap-6 w-full text-[15px]">
                {/* ALL (왼쪽) */}
                <div>
                  <div className="font-semibold mb-2">ALL</div>
                  <div className="flex flex-col gap-1">
                    <Link href="#" className="hover:text-primary">커스텀상품(제품뷰)</Link>
                    <Link href="#" className="hover:text-primary">단체판촉상품(제품뷰)</Link>
                    <Link href="#" className="hover:text-primary">IP굿즈 상품개발(페이지)</Link>
                    <Link href="#" className="hover:text-primary">브랜드의뢰(페이지)</Link>
                    <Link href="/reviews" className="hover:text-primary">리뷰(게시판)</Link>
                    <Link href="#" className="hover:text-primary">상품주문 가이드(페이지)</Link>
                  </div>
                </div>
                {/* 팬굿즈 */}
                <div>
                  <div className="font-semibold mb-2">팬굿즈</div>
                  <div className="flex flex-col gap-1">
                    <Link href="#" className="hover:text-primary">아크릴 굿즈</Link>
                    <Link href="#" className="hover:text-primary">지류 굿즈</Link>
                    <Link href="#" className="hover:text-primary">스티커(다꾸)</Link>
                    <Link href="#" className="hover:text-primary">핀거믹/버튼</Link>
                    <Link href="#" className="hover:text-primary">등신대</Link>
                    <Link href="#" className="hover:text-primary">ETC</Link>
                  </div>
                </div>
                {/* 단체 판촉상품 */}
                <div>
                  <div className="font-semibold mb-2">단체 판촉상품</div>
                  <div className="flex flex-col gap-1">
                    <Link href="#" className="hover:text-primary">머그컵/유리컵</Link>
                    <Link href="#" className="hover:text-primary">텀블러</Link>
                    <Link href="#" className="hover:text-primary">수건</Link>
                    <Link href="#" className="hover:text-primary">시계</Link>
                    <Link href="#" className="hover:text-primary">우산</Link>
                    <Link href="#" className="hover:text-primary">티셔츠</Link>
                  </div>
                </div>
                {/* 광고물/사인 */}
                <div>
                  <div className="font-semibold mb-2">광고물/사인</div>
                  <div className="flex flex-col gap-1">
                    <Link href="#" className="hover:text-primary">LED 네온</Link>
                    <Link href="#" className="hover:text-primary">환경디자인</Link>
                    <Link href="#" className="hover:text-primary">미니간판</Link>
                  </div>
                </div>
                {/* 반려동물 */}
                <div>
                  <div className="font-semibold mb-2">반려동물</div>
                  <div className="flex flex-col gap-1">
                    <Link href="#" className="hover:text-primary">액자/소품/네임택</Link>
                    <Link href="#" className="hover:text-primary">쿠션/방석/패브릭 제품</Link>
                    <Link href="#" className="hover:text-primary">장례용품</Link>
                  </div>
                </div>
                {/* 포장 부자재 */}
                <div>
                  <div className="font-semibold mb-2">포장 부자재</div>
                  <div className="flex flex-col gap-1">
                    <Link href="#" className="hover:text-primary">전체보기</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
  ) : (
          <div className="hidden md:block border-t bg-background shadow-md">
            <div className="container mx-auto px-4">
              <div className="flex h-12 items-center justify-center gap-x-6 gap-y-2 text-sm">
                {subNavToShow.map((subItem) => (
                  <Button key={subItem.label} variant="ghost" size="sm" asChild className="font-medium text-muted-foreground hover:text-primary">
                    <Link href={subItem.href}>{subItem.label}</Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  </header>
  );
}
