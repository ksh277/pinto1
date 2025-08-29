
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useProductContext } from '@/contexts/product-context';
import { ProductCard } from '@/components/product-card';
import { categoriesMap } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Product, ProductSubcategory } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


export default function CategoryPage() {
  const params = useParams() ?? {};
  const searchParams = useSearchParams();
  const slug = Array.isArray((params as any).slug) ? (params as any).slug[0] : (params as any).slug ?? '';

  const { products, isProductsLoading } = useProductContext();
  
  const [activeSubCategory, setActiveSubCategory] = useState<ProductSubcategory | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'popular' | 'review' | 'price_asc' | 'price_desc'>('newest');

  const categoryInfo = slug ? categoriesMap[slug] : undefined;

  useEffect(() => {
    const subCategory = searchParams?.get('sub') as ProductSubcategory | null;
    if (subCategory && categoryInfo?.subCategories.some(sc => sc.id === subCategory)) {
      setActiveSubCategory(subCategory);
    } else {
      setActiveSubCategory('all');
    }
  }, [searchParams, categoryInfo]);

  const filteredProducts = useMemo(() => {
    if (isProductsLoading) return [];
    const categoryProducts = products.filter(p => p.categoryId === slug);
    
    if (activeSubCategory !== 'all') {
      return categoryProducts.filter(p => p.subcategory === activeSubCategory);
    }

    return categoryProducts;
  }, [products, slug, activeSubCategory, isProductsLoading]);

  const sortedProducts = useMemo(() => {
    const toMillis = (d: Date | { toDate: () => Date }) =>
      d instanceof Date ? d.getTime() : d.toDate().getTime();
    return [...filteredProducts].sort((a: Product, b: Product) => {
      switch (sortOrder) {
        case 'popular':
          return (b.stats?.likeCount || 0) - (a.stats?.likeCount || 0);
        case 'review':
          return (b.stats?.reviewCount || 0) - (a.stats?.reviewCount || 0);
        case 'price_asc':
          return a.priceKrw - b.priceKrw;
        case 'price_desc':
          return b.priceKrw - a.priceKrw;
        case 'newest':
        default:
          return toMillis(b.createdAt) - toMillis(a.createdAt);
      }
    });
  }, [filteredProducts, sortOrder]);

  if (!categoryInfo) {
    return <div className="container mx-auto py-8 text-center">Category not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      
      <div className="flex flex-wrap justify-start items-center gap-x-2 gap-y-2 border-b pb-4 mb-8">
        <Button 
            variant="ghost" 
            onClick={() => setActiveSubCategory('all')}
            className={cn("px-4 py-2 text-sm text-gray-500 hover:text-primary", activeSubCategory === 'all' && "text-primary font-bold border-b-2 border-primary rounded-none")}
        >
          전체
        </Button>
  {categoryInfo.subCategories.map(subCat => (
          <Button 
            key={subCat.id}
            variant="ghost" 
            onClick={() => setActiveSubCategory(subCat.id)}
            className={cn("px-4 py-2 text-sm text-gray-500 hover:text-primary", activeSubCategory === subCat.id && "text-primary font-bold border-b-2 border-primary rounded-none")}
          >
            {subCat.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-8">
        {isProductsLoading ? (
            <Skeleton className="h-5 w-48" />
        ) : (
            <p className="text-sm text-muted-foreground">총 {sortedProducts.length}개의 상품이 있습니다.</p>
        )}
  <Select value={sortOrder} onValueChange={v => setSortOrder(v as typeof sortOrder)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">신상품</SelectItem>
            <SelectItem value="popular">인기순</SelectItem>
            <SelectItem value="review">리뷰순</SelectItem>
            <SelectItem value="price_desc">높은 가격순</SelectItem>
            <SelectItem value="price_asc">낮은 가격순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        {isProductsLoading ? (
            Array.from({length: 10}).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="aspect-square w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            ))
        ) : (
          sortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  );
}
