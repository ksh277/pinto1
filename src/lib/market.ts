import type { Product } from '@/lib/types';

export interface WeeklyMarketItem extends Pick<Product, 'id' | 'nameKo' | 'priceKrw' | 'imageUrl'> {
  rank: number;
}

interface GetWeeklyMarketParams {
  limit?: number;
  category?: string;
  subcategory?: string;
}

/**
 * Fetch weekly market ranking products.
 * Currently returns stub data from an internal API.
 */
export async function getWeeklyMarket(
  params: GetWeeklyMarketParams = {},
): Promise<WeeklyMarketItem[]> {
  const search = new URLSearchParams();
  if (params.limit) search.set('limit', params.limit.toString());
  if (params.category) search.set('category', params.category);
  if (params.subcategory) search.set('subcategory', params.subcategory);

  const res = await fetch(`/api/market/weekly?${search.toString()}`);
  if (!res.ok) return [];
  const data = (await res.json()) as WeeklyMarketItem[];
  return data;
}
