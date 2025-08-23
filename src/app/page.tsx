"use client";
import useSWR from "swr";
import TopBanner from "@/components/TopBanner";
import { CategoryShortcuts } from "@/components/CategoryShortcuts";
import { ProductCard, type Product } from "@/components/ProductCard";
import { InfoCard } from "@/components/InfoCard";

type HomeResponse = { recommended: Product[]; creatorPicks: Product[] };
const fetcher = (u:string)=>fetch(u).then(r=>r.json());

export default function Home() {
  const { data } = useSWR<HomeResponse>("/api/products/home", fetcher);

  return (
    <main className="py-4">
      <TopBanner />

      {/* 헤더 대체(임시) */}
      <div className="my-2 flex items-center justify-between">
        <div className="font-extrabold text-xl text-pinto-primary">PINTO</div>
        <div className="text-sm text-gray-500">로그인 · 장바구니 · 언어</div>
      </div>

      {/* 히어로 */}
      <section className="my-6 grid grid-cols-1 md:grid-cols-2 gap-6 rounded-2xl bg-pinto-soft p-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">
            나만의 굿즈, 지금 바로 만들기
          </h1>
          <p className="mt-2 text-gray-700">
            핀토에서 디자인부터 주문까지 한 번에. 오프라인 픽업도 지원!
          </p>
          <div className="mt-4 flex gap-3">
            <a href="/editor" className="rounded-2xl bg-pinto-primary text-white px-4 py-2 font-medium shadow-card">디자인 시작</a>
            <a href="/guide" className="rounded-2xl border px-4 py-2 font-medium">이용 가이드</a>
          </div>
        </div>
        <div className="rounded-2xl bg-white shadow-card min-h-[220px]" />
      </section>

      {/* 카테고리 쇼트컷 */}
      <CategoryShortcuts
        items={[
          { id:"acrylic-keyring", label:"아크릴키링" },
          { id:"photocard-holder", label:"포카홀더" },
          { id:"stand", label:"스탠드" },
          { id:"mousepad", label:"마우스패드" },
          { id:"sticker", label:"스티커" },
          { id:"badge", label:"뱃지" },
        ]}
      />

      {/* 추천상품 #1 */}
      <section className="my-6">
        <div className="mb-3 text-lg font-semibold">추천 상품</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(data?.recommended ?? Array.from({length:8})).map((p: any, i:number) =>
            p ? <ProductCard key={p.id} product={p} /> :
            <div key={i} className="rounded-2xl bg-gray-100 aspect-square animate-pulse" />
          )}
        </div>
      </section>

      {/* 인포 카드 */}
      <section className="my-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard title="가까운 오프라인샵" description="핸드폰으로 빠르게 주문하고, 오늘 바로 픽업하세요." href="/shops" />
        <InfoCard title="첫 주문 가이드" description="이미지 규격, 재단선, 배송까지 한 번에 확인." href="/guide" />
        <InfoCard title="제작 문의" description="대량/커스텀 문의는 전용 채널로 편하게." href="/contact" />
      </section>

      {/* 추천상품 #2 */}
      <section className="my-6">
        <div className="mb-3 text-lg font-semibold">크리에이터 픽</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(data?.creatorPicks ?? Array.from({length:4})).map((p:any, i:number) =>
            p ? <ProductCard key={p.id} product={p} /> :
            <div key={i} className="rounded-2xl bg-gray-100 aspect-square animate-pulse" />
          )}
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="my-8 rounded-2xl bg-pinto-accent p-6 text-center">
        <h2 className="text-xl md:text-2xl font-bold">지금 바로 디자인을 시작해볼까요?</h2>
        <a href="/editor" className="mt-3 inline-block rounded-2xl bg-black text-white px-5 py-2 font-medium shadow-card">
          시작하기
        </a>
      </section>

      {/* 푸터(간단) */}
      <footer className="my-6 py-6 text-sm text-gray-500 border-t">
        © {new Date().getFullYear()} PINTO. All rights reserved.
      </footer>
    </main>
  );
}
