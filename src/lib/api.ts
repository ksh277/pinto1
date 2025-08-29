import type { Product, ProductStats } from '@/types/product';

export async function getProductsByCategory(key: string): Promise<Product[]> {
  try {
    const res = await fetch(`/api/products?category=${encodeURIComponent(key)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // ignore
  }
  return [
    { id: '1', nameKo: '샘플 상품', imageUrl: 'https://placehold.co/600x600.png', priceKrw: 10000 },
    { id: '2', nameKo: '샘플 상품 2', imageUrl: 'https://placehold.co/600x600.png', priceKrw: 12000 },
  ];
}

export async function getProductStats(ids: string[]): Promise<Record<string, ProductStats>> {
  try {
    const res = await fetch(`/api/products/stats?ids=${ids.join(',')}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // ignore
  }
  const fallback: Record<string, ProductStats> = {};
  ids.forEach(id => {
    fallback[id] = { reviewCount: 0, likeCount: 0 };
  });
  return fallback;
}
