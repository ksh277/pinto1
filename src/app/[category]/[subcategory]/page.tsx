import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { buildEditorLink, subcategoryConfig } from '@/lib/subcategory-config';

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ category: string; subcategory: string }>;
}) {
  const { category, subcategory } = await params;
  const info = subcategoryConfig[category]?.[subcategory];

  if (!info) {
    notFound();
  }

  const editorHref = buildEditorLink(info.cta);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">{info.title}</h1>
        <p className="mb-8 text-muted-foreground">{info.description}</p>
        <Button asChild size="lg">
          <Link href={editorHref}>디자인 시작하기</Link>
        </Button>
      </div>
    </div>
  );
}
