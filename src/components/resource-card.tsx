
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Guide } from '@/lib/types';

interface GuideCardProps {
  guide: Guide;
}


export function GuideCard({ guide }: GuideCardProps) {
  return (
    <Link href={`/support/guide/${guide.slug}`} className="group block">
      <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg h-full flex flex-col">
        <div className="relative aspect-video w-full">
          <Image
            src={guide.coverImageUrl}
            alt={guide.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
        <CardContent className="flex flex-grow flex-col p-4">
            <div className="flex-grow">
                <h3 className="mb-2 font-semibold leading-tight group-hover:text-primary">{guide.title}</h3>
                <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{guide.summary}</p>
            </div>
            <div className="mt-auto flex flex-wrap gap-2">
                {guide.tags.map(tag => (
                <Badge key={tag} variant="outline" className="font-normal">{tag}</Badge>
                ))}
            </div>
        </CardContent>
      </Card>
    </Link>
  );
}
