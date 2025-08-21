
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, ShoppingCart, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useI18n } from '@/contexts/i18n-context';
import Image from 'next/image';
import { mainNavItems } from '@/lib/categories';
import { useCartContext } from '@/contexts/cart-context';
import { HeaderAuthNav } from './header-auth-nav';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

export function Header() {
  const { t } = useI18n();
  const [activeSubNav, setActiveSubNav] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount } = useCartContext();

  const handleMouseEnter = (itemId: string) => {
    const item = mainNavItems.find(i => i.id === itemId);
    if (item && item.subnav) {
      setActiveSubNav(itemId);
    } else {
      setActiveSubNav(null);
    }
  };

  const handleMouseLeave = () => {
    setActiveSubNav(null);
  };
  
  const subNavToShow = mainNavItems.find(item => item.id === activeSubNav)?.subnav;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header 
      className="sticky top-0 z-50 w-full flex-col border-b bg-background shadow-sm"
      onMouseLeave={handleMouseLeave}
    >
      {/* Top bar - Hidden on mobile */}
       <div className="bg-secondary/30 text-secondary-foreground hidden md:block">
        <div className="container mx-auto flex h-8 items-center justify-end px-4 text-xs">
            <div className="flex items-center gap-2">
                <input id="hide-week" type="checkbox" className="h-3 w-3" />
                <label htmlFor="hide-week" className="cursor-pointer">일주일 간 보지 않기</label>
                <X className="h-3 w-3 cursor-pointer"/>
            </div>
        </div>
      </div>
      <div className="border-b hidden md:block">
        <div className="container mx-auto flex h-10 items-center justify-between px-4 text-xs">
            <div className="flex-1"></div>
            <div className="flex flex-1 items-center justify-center gap-4 text-muted-foreground">
                 <Link href="/support/notice" className="hover:underline">공지사항</Link>
                 <Link href="/support/faq" className="hover:underline">고객센터</Link>
                 <Link href="/support/guide" className="hover:underline">이용가이드</Link>
                 <Link href="/events" className="hover:underline">이벤트</Link>
                 <Link href="/mypage/inquiries" className="hover:underline">문의게시판</Link>
                 <Link href="/resources" className="hover:underline">자료실</Link>
            </div>
            <div className="flex flex-1 items-center justify-end gap-4 text-muted-foreground">
              <HeaderAuthNav />
              <div className="h-4 w-px bg-gray-200" />
              <Link href="/cart" className="flex items-center gap-1 hover:text-primary">
                <ShoppingCart className="h-4 w-4" />
                <span>장바구니 ({cartCount})</span>
              </Link>
            </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        {/* Main Header */}
        <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-3xl font-bold">
                <Image src="https://placehold.co/150x30.png" width={150} height={30} alt="logo" className="object-contain" />
            </Link>

            {/* Desktop Main Nav */}
            <div className="hidden md:flex items-center gap-6">
                <Button variant="ghost" asChild className="font-semibold text-lg text-foreground hover:text-primary">
                  <Link href="/reviews">{t('header.nav.reviews')}</Link>
                </Button>
                 <Button variant="ghost" asChild className="font-semibold text-lg text-foreground hover:text-primary">
                  <Link href="/community">{t('header.nav.community')}</Link>
                </Button>
            </div>
            
            {/* Desktop Search */}
            <div className="relative w-full max-w-md hidden md:block">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="2,000여개의 커스텀 상품을 쉽게 찾아 보세요."
                className="w-full rounded-full border-2 border-primary bg-background py-2 pl-12 pr-4"
              />
            </div>
            
            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
                 <Button variant="ghost" size="icon" asChild>
                    <Link href="/cart">
                        <ShoppingCart className="h-6 w-6" />
                        <span className="sr-only">장바구니</span>
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
                                <Image src="https://placehold.co/150x30.png" width={150} height={30} alt="logo" />
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
                                           <Link href={item.href} onClick={!item.subnav ? closeMobileMenu : (e) => e.preventDefault()} className="flex-1 text-left">{item.label}</Link>
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
                                 <div className="border-t">
                                     <Link href="/reviews" onClick={closeMobileMenu} className="flex items-center text-base font-semibold py-3">리뷰</Link>
                                 </div>
                                  <div className="border-t">
                                     <Link href="/community" onClick={closeMobileMenu} className="flex items-center text-base font-semibold py-3">커뮤니티</Link>
                                 </div>
                                  <div className="border-t">
                                     <Link href="/support/notice" onClick={closeMobileMenu} className="flex items-center text-base font-semibold py-3">고객센터</Link>
                                 </div>
                             </Accordion>
                         </nav>
                      </div>
                  </SheetContent>
                </Sheet>
            </div>
        </div>

        {/* Desktop Category Navigation */}
        <div className="hidden h-12 items-center justify-start gap-6 border-t md:flex">
          {mainNavItems.map((item) => (
            <div key={item.id} onMouseEnter={() => handleMouseEnter(item.id)}>
              <Button variant="ghost" asChild className="font-semibold text-foreground hover:text-primary">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
       {subNavToShow && (
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
      )}
    </header>
  );
}
