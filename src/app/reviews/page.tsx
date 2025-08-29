import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: '리뷰',
};

const mockReviews = Array.from({ length: 8 }).map((_, i) => ({
  id: String(i + 1),
  title: `리뷰 ${i + 1}`,
  rating: 5,
  thumb: 'https://placehold.co/300x300.png',
}));

export default function ReviewsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">리뷰</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {mockReviews.map(r => (
          <Link key={r.id} href={`/reviews/${r.id}`} className="block focus:outline-none focus:ring-2">
            <div className="relative aspect-square w-full overflow-hidden rounded-md">
              <Image src={r.thumb} alt={r.title} fill className="object-cover" />
            </div>
            <div className="mt-2 text-sm font-medium">{r.title}</div>
            <div className="text-xs text-muted-foreground">평점 {r.rating}</div>
          </Link>
        ))}
      </div>
      <div className="mt-8 text-center text-sm text-muted-foreground">페이지네이션</div>
    </main>
  );
}
