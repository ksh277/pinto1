'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { TopBanner, type HeroBanner } from '@/components/TopBanner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CategoryShortcuts } from '@/components/category-shortcuts';
import { useProductContext } from '@/contexts/product-context';
import type { Product } from '@/lib/types';
import { getWeeklyMarket, type WeeklyMarketItem } from '@/lib/market';
import { ChevronRight } from 'lucide-react';

const heroBanners: HeroBanner[] = [
  {
    id: '1',
    href: '#',
    alt: 'Hand holding a wooden whale craft.',
    imgSrc: 'https://placehold.co/1600x1200.png',
  },
  {
    id: '2',
    href: '#',
    alt: 'Custom wooden coasters with map engravings.',
    imgSrc: 'https://placehold.co/1600x1200.png',
  },
];

const shortcutCategories = [
  { id: '1', href: '#', label: '1인샵', imgSrc: 'https://placehold.co/100x100.png', hint: 'gift box' },
  { id: '2', href: '#', label: '선물추천', imgSrc: 'https://placehold.co/100x100.png', hint: 'gift box' },
  { id: '3', href: '#', label: '겨울아이디어', imgSrc: 'https://placehold.co/100x100.png', hint: 'snowflake' },
  { id: '4', href: '#', label: '여행 굿즈', imgSrc: 'https://placehold.co/100x100.png', hint: 'luggage' },
  { id: '5', href: '#', label: '문구/미니', imgSrc: 'https://placehold.co/100x100.png', hint: 'stationery' },
  { id: '6', href: '#', label: '반려동물 굿즈', imgSrc: 'https://placehold.co/100x100.png', hint: 'dog paw' },
  { id: '7', href: '#', label: '의류', imgSrc: 'https://placehold.co/100x100.png', hint: 't-shirt' },
  { id: '8', href: '#', label: '개성 아이디어', imgSrc: 'https://placehold.co/100x100.png', hint: 'idea lightbulb' },
];

const infoCards = [
  { id: '1', title: '나랑 가까운 오프라인샵은 어디에 있을까요?', description: '핸드폰으로 뚝딱뚝딱 빠르고 간편하게 나만의 굿즈를 만들 수 있습니다.' },
  { id: '2', title: '내 반려동물을 위한 굿즈출시', description: '일상생활용품, 반려장례용품, 추억 다양한 제품들이 준비되어 있습니다.' },
  { id: '3', title: '커스텀 아이디어로 나만의 굿즈 판매하기', description: '핀토에서 준비한 굿즈 제품들로 나만의 디자인을 입혀 판매할 수 있습니다.' },
  { id: '4', title: '웹툰/연예인 응원봉,포토카드,아크릴', description: '단체주문,소량부터 대량까지 핀토에게 맡겨 주세요. 직접 생산감리도 가능!' },
];

export default function Home() {
  const { products } = useProductContext();

  const acrylic = products.filter(p => p.categoryId === 'acrylic');
  const wood = products.filter(p => p.categoryId === 'wood');
  const pool: Product[] = products.length ? products : [];

  const take = (arr: Product[], start = 0, count = 3): Product[] =>
    (arr.length ? arr : pool).slice(start, start + count);

  const shelves = [
    {
      id: 's1',
      headline: '티셔츠 | 다양한 색상과 소재가 준비되어 있습니다.',
      sub: '디자인이 고민이면 핀토 상담가에게 문의 주세요',
      moreHref: '/category/apparel',
      picks: take(acrylic, 0, 3),
    },
    {
      id: 's2',
      headline: '키링 | 스포츠, 축제, 행사, 굿즈에 많이 사용되요.',
      sub: '칼선/재단 걱정하지 않아도 돼요. 자동편집!',
      moreHref: '/category/acrylic',
      picks: take(acrylic, 3, 3),
    },
    {
      id: 's3',
      headline: '우산 | 소량부터 대량까지 다양하게 준비되어 있습니다.',
      sub: '핸드폰으로도 뚝딱 만들 수 있는 나만의 굿즈',
      moreHref: '/category/wood',
      picks: take(wood, 0, 3),
    },
  ];

  const fmtPrice = (n?: number) =>
    typeof n === 'number' ? `${n.toLocaleString()}원` : '가격문의';

  // 좋아요 순 주간 랭킹 4개 (폴백용)
  const top4 = [...products]
    .sort(
      (a: Product, b: Product) =>
        (b.stats?.likeCount ?? 0) - (a.stats?.likeCount ?? 0),
    )
    .slice(0, 4);

  type Rankable = {
    id: string;
    nameKo?: string;
    priceKrw?: number;
    imageUrl?: string;
    rank?: number;
  };

  const top4Fallback: Rankable[] = top4.map(p => ({
    id: p.id,
    nameKo: p.nameKo,
    priceKrw: p.priceKrw,
    imageUrl: p.imageUrl,
  }));
  const [weekly, setWeekly] = useState<WeeklyMarketItem[]>([]);

  useEffect(() => {
    getWeeklyMarket({ limit: 4 })
      .then(setWeekly)
      .catch(() => {
        /* ignore errors, fallback will be used */
      });
  }, []);

  const ranking: Rankable[] = weekly.length ? weekly : top4Fallback;
  const showBadge = weekly.length > 0;

  return (
  <div className="flex flex-col bg-slate-50 dark:bg-slate-900 min-h-screen px-8 md:px-16">
      {/* HERO */}
      <section className="pt-8">
        <TopBanner banners={heroBanners} />
      </section>

      {/* SHORTCUTS */}
  <section className="py-12 md:py-16">
        <CategoryShortcuts categories={shortcutCategories} />
      </section>

      {/* INFO CARDS — 작은 캡션 + 회색 박스 (글자 더 아래 / 박스 더 큼) */}
  <section className="pt-12 md:pt-14">
        <p className="mb-4 text-[13px] leading-5 text-slate-500 px-4">
          온, 오프라인 어디에서나 쉽고 빠르게 만들 수 있어요!
        </p>

  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 px-2 md:px-8">
          {infoCards.map(card => (
            <div
              key={card.id}
              className="min-h-[300px] md:min-h-[340px] rounded-2xl bg-neutral-200/80 dark:bg-neutral-800/70 pt-14 md:pt-16 pb-8 px-6"
            >
              <h3 className="text-[15px] font-semibold leading-6 text-neutral-900 dark:text-neutral-100 break-keep">
                {card.title}
              </h3>
              <p className="mt-5 text-[12px] leading-6 text-neutral-600 dark:text-neutral-300 break-keep">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT SHELF — 3열(상단 회색 배너 + 하단 미니 리스트) */}
  <section className="py-10 md:py-14">
        <h2 className="mb-4 text-[15px] font-semibold text-slate-700">
          단체 굿즈 합리적인 가격으로 예쁘게 만들어 드릴게요.
        </h2>

  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
    {shelves.map(shelf => (
      <div key={shelf.id}>
        {/* 이미지 박스 */}
        <div className="min-h-[240px] md:min-h-[260px] rounded-2xl bg-neutral-200/80 dark:bg-neutral-800/70 pt-12 md:pt-14 pb-7 px-6 flex items-center justify-center">
          {/* 여기에 대표 이미지를 넣으려면 아래처럼 사용하세요. 현재는 예시로 비워둡니다. */}
          {/* <Image src={...} alt={...} ... /> */}
        </div>
        {/* 설명글 */}
        <h3 className="mt-4 text-[15px] font-semibold leading-6 text-neutral-900 dark:text-neutral-100 break-keep">
          {shelf.headline}
        </h3>
        <p className="mt-2 text-[12px] leading-6 text-neutral-600 dark:text-neutral-300 break-keep">
          {shelf.sub}
        </p>
        {/* 상품 리스트 */}
        <div className="mt-4 space-y-4">
          {shelf.picks.map((p: Product) => (
            <div key={p.id} className="flex items-center gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-neutral-200">
                <Image
                  src={p.imageUrl || 'https://placehold.co/300x300.png'}
                  alt={p.nameKo || 'product'}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] text-slate-500">
                  {p.nameKo || '상품명'}
                </p>
                <div className="mt-1 text-[13px] font-semibold text-teal-600">
                  {fmtPrice(p.priceKrw)} <span className="text-teal-600/70">부터</span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                  <span>♡ {p.stats?.likeCount ?? 0}</span>
                  <span>리뷰 {p.stats?.reviewCount ?? 0}</span>
                </div>
              </div>
            </div>
          ))}
          <div className="pt-1">
            <Button asChild variant="outline" className="h-8 w-full rounded-full border-slate-300 text-xs text-slate-600">
              <Link href={shelf.moreHref || '#'}>more</Link>
            </Button>
          </div>
        </div>
      </div>
    ))}
  </div>
      </section>

      {/* 창작자 CTA (가운데 큰 텍스트/버튼) */}
      <section className="bg-white dark:bg-card">
        <div className="px-4 py-12 text-center md:py-16">
          <h2 className="text-xl font-bold md:text-2xl">
            창작자, 작가 모두가 참여하는 플랫폼 PINTO
          </h2>
          <p className="text-muted-foreground mt-2">
            재고 걱정 없이 디자인만으로 수익을 창출하는 새로운 방법을 알아보세요.
          </p>
          <div className="mt-6">
            <Button variant="outline" className="border-gray-400">
              판매방법 알아보기
            </Button>
          </div>
        </div>
      </section>

      {/* ✅ 주간 랭킹 4카드 — CTA 아래로 이동 */}
  <section className="pt-6 pb-10 md:pt-8 md:pb-14">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-slate-700">
            창작자, 작가 참여 마켓 주간 랭킹보기
          </h2>
          <Link href="/market/weekly" className="text-xs text-slate-400 hover:text-slate-600">
            더보기 <ChevronRight className="inline-block h-3 w-3 align-middle" />
          </Link>
        </div>

  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-6">
            {ranking.map((p: Rankable, i: number) => (
            <div key={p.id} className="group">
              <div className="relative h-[180px] w-full overflow-hidden rounded-2xl bg-neutral-200 sm:h-[220px] md:h-[400px]">
                <Image
                    src={p.imageUrl || 'https://placehold.co/600x600.png'}
                    alt={p.nameKo || 'product'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              </div>

              <div className="px-1 pt-3">
                  <p className="line-clamp-1 text-[12px] text-slate-500">
                    {p.nameKo || '상품명'}
                  </p>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-teal-600">
                    {fmtPrice(p.priceKrw)} <span className="text-teal-600/70">부터</span>
                  </span>
                  {showBadge && (
                  <span className="rounded-md border-2 border-rose-200 px-2 py-[2px] text-[10px] font-semibold text-rose-300">
                    BEST {p.rank ?? i + 1}
                  </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 하단 3 CTA 카드 */}
      <h3 className="mb-4 text-[13px] font-medium text-slate-600">
        함께 성장해요. 고객별 혜택 확인하기
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        <Card className="rounded-2xl border-none bg-neutral-200/80 p-0 shadow-none dark:bg-neutral-800/70">
          <div className="flex min-h-[160px] flex-col items-center justify-center px-6 py-8 text-center md:min-h-[180px]">
            <h4 className="text-base font-bold">창작마켓</h4>
            <p className="mt-1 text-xs text-slate-500">B2C 참여하기</p>
          </div>
        </Card>
        <Card className="rounded-2xl border-none bg-neutral-200/80 p-0 shadow-none dark:bg-neutral-800/70">
          <div className="flex min-h-[160px] flex-col items-center justify-center px-6 py-8 text-center md:min-h-[180px]">
            <h4 className="text-base font-bold">관공서, 기업, 대량</h4>
            <p className="mt-1 text-xs text-slate-500">B2B 문의하기</p>
          </div>
        </Card>
        <Card className="rounded-2xl border-none bg-neutral-200/80 p-0 shadow-none dark:bg-neutral-800/70">
          <div className="flex min-h-[160px] flex-col items-center justify-center px-6 py-8 text-center md:min-h-[180px]">
            <h4 className="text-base font-bold">개인</h4>
            <p className="mt-1 text-xs text-slate-500">B2C 문의하기</p>
          </div>
        </Card>
      </div>
  <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 mt-2 mb-12">
        <div className="text-[13px] leading-5 text-slate-500">
          나만의 창작물로 굿즈를 제작, 등록하여 판매를 할 수 있습니다.<br />
          창작물 판매자에게는 소량제작 할인혜택 입점 수수료가 할인이 됩니다.
        </div>
        <div className="text-[13px] leading-5 text-slate-500">
          환경디자인,행사,축제,교육,대량 굿즈 제작이 가능합니다. 핀토는 자체 공장과 다양한 포트폴리오를 보유하고 있어 전문 상담가가 함께 합니다.
        </div>
        <div className="text-[13px] leading-5 text-slate-500">
          구매별 등급이 나눠져 있으며 구매등급에 따라 월 할인 프로모션, 포인트 지급 등이 제공됩니다.
        </div>
      </div>
    </div>
  );
}
