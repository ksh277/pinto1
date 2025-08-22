
'use client';

import Link from 'next/link';
import Image from 'next/image';

interface ShortcutCategory {
    id: string;
    href: string;
    label: string;
    imgSrc?: string;
}

interface CategoryShortcutsProps {
    categories: ShortcutCategory[];
}

export function CategoryShortcuts({ categories }: CategoryShortcutsProps) {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-6 md:grid md:grid-cols-8 md:place-items-center md:gap-y-6">
        {categories.map(category => (
          <Link
            href={category.href}
            key={category.id}
            className="group flex w-20 shrink-0 flex-col items-center gap-3 text-center md:w-auto"
          >
            <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white transition-shadow group-hover:shadow-md dark:bg-secondary">
              {category.imgSrc ? (
                <Image
                  src={category.imgSrc}
                  alt={category.label}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-neutral-300" />
              )}
            </div>
            <span className="text-xs font-medium text-foreground group-hover:text-primary md:text-sm">
              {category.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
