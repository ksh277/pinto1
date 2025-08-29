import { notFound } from 'next/navigation';
import { canonicalCategoryKeyFromSlug, categoryMeta } from '@/lib/category-map';
import { getProductsByCategory, getProductStats } from '@/lib/api';
import { ProductCard } from '@/components/product-card';

export default async function Page({ params }: { params: { slug: string[] } }) {
  const key = canonicalCategoryKeyFromSlug(params.slug ?? []);
  if (!key) return notFound();

  const products = await getProductsByCategory(key);
  const stats = await getProductStats(products.map(p => p.id));

  const meta = categoryMeta[key];
  return (
    <main className="container mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{meta.title}</h1>
        {meta.description && <p className="text-sm text-muted-foreground mt-1">{meta.description}</p>}
      </header>
      <div className="flex justify-end mb-4 text-sm">
        <span className="text-muted-foreground">정렬/가격 필터</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(p => (
          <ProductCard key={p.id} product={p} stats={stats[p.id]} />
        ))}
      </div>
    </main>
  );
}
