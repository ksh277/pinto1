import Link from 'next/link';

export const metadata = {
  title: 'IP 굿즈 개발',
};

export default function IpPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold">IP 굿즈 개발 서비스</h1>
        <p className="text-muted-foreground mt-2">전문가와 함께 IP 굿즈를 만들어보세요.</p>
        <Link href="/brand/request" className="mt-4 inline-block rounded bg-primary px-6 py-2 text-white focus:outline-none focus:ring-2">
          문의하기
        </Link>
      </section>
    </main>
  );
}
