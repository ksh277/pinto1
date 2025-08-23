"use client";
import Image from "next/image";

export type Product = {
  id: string; name: string; price: number; thumbnail: string;
  likeCount: number; reviewCount: number; href: string;
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <a href={product.href} className="block rounded-2xl shadow-card overflow-hidden hover:translate-y-[-1px] transition">
      <div className="relative aspect-square bg-gray-50">
        <Image src={product.thumbnail} alt={product.name} fill className="object-cover" />
      </div>
      <div className="p-3">
        <div className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{product.name}</div>
        <div className="mt-1 font-semibold text-base">{product.price.toLocaleString()}원</div>
        <div className="mt-1 text-sm text-gray-600">
          리뷰 {product.reviewCount.toLocaleString()} · ♥ {product.likeCount.toLocaleString()}
        </div>
      </div>
    </a>
  );
}
