import Image from 'next/image';

export const metadata = {
  title: '리뷰 상세',
};

async function getReview(id: string) {
  try {
    const res = await fetch(`/api/reviews/${id}`);
    if (res.ok) return res.json();
  } catch (e) {}
  return { id, title: '리뷰', images: ['https://placehold.co/600x600.png'] };
}

export default async function ReviewDetail({ params }: { params: { id: string } }) {
  const review = await getReview(params.id);
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{review.title}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {review.images.map((src: string, i: number) => (
          <div key={i} className="relative w-full aspect-square overflow-hidden rounded-md">
            <Image src={src} alt={`${review.title} 이미지 ${i + 1}`} fill className="object-cover" />
          </div>
        ))}
      </div>
      <button className="rounded bg-red-500 px-4 py-2 text-white">신고</button>
    </main>
  );
}
