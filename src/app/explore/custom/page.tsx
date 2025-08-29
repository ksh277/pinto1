import Link from 'next/link';

export const metadata = {
  title: '커스텀상품 탐색',
};

export default function CustomExplore() {
  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold">맞춤 제작, 핀토</h1>
        <p className="text-muted-foreground mt-2">이미지만 있으면 5분 만에 굿즈 완성</p>
      </section>
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { href: '/category/fan/acrylic', title: '아크릴 굿즈' },
          { href: '/category/fan/sticker', title: '스티커(다꾸)' },
          { href: '/category/promo/mug', title: '머그컵/유리컵' },
          { href: '/category/promo/tshirt', title: '티셔츠' },
          { href: '/category/signage/led-neon', title: 'LED 네온' },
          { href: '/category/pet/fabric', title: '쿠션/패브릭' },
        ].map(c => (
          <Link key={c.href} href={c.href} className="block rounded-xl border p-4 hover:shadow focus:outline-none focus:ring-2">
            <div className="font-medium">{c.title}</div>
            <div className="text-xs text-muted-foreground mt-1">바로 보러가기</div>
          </Link>
        ))}
      </section>
    </main>
  );
}
