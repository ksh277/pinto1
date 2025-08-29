import Link from 'next/link';

export const metadata = {
  title: '단체판촉상품 탐색',
};

export default function EnterpriseExplore() {
  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold">단체 판촉도 핀토에서</h1>
        <p className="text-muted-foreground mt-2">기업과 단체를 위한 맞춤 굿즈</p>
      </section>
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { href: '/category/promo/mug', title: '머그컵/유리컵' },
          { href: '/category/promo/tumbler', title: '텀블러' },
          { href: '/category/promo/towel', title: '수건' },
          { href: '/category/promo/clock', title: '시계' },
          { href: '/category/promo/umbrella', title: '우산' },
          { href: '/category/promo/tshirt', title: '티셔츠' },
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
