export interface Product {
  id: string;
  nameKo: string;
  imageUrl?: string;
  priceKrw: number;
}

export interface ProductStats {
  reviewCount: number;
  likeCount: number;
}
