
'use client';

import Link from 'next/link';
import Image from 'next/image';

interface ShortcutCategory {
    id: string;
    href: string;
    label: string;
    imgSrc: string;
    hint: string;
}

interface CategoryShortcutsProps {
    categories: ShortcutCategory[];
}

export function CategoryShortcuts({ categories }: CategoryShortcutsProps) {
  return (
  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 place-items-center gap-y-6 gap-x-4 w-full px-2 md:px-8">
      {categories.map((category) => (
        <Link
          href={category.href}
          key={category.id}
          className="group flex flex-col items-center gap-3 text-center w-full max-w-[120px]"
        >
          <div className="relative flex w-full aspect-square max-w-[72px] items-center justify-center rounded-full bg-white transition-shadow group-hover:shadow-md dark:bg-secondary">
            <Image
              src={category.imgSrc}
              alt={category.label}
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 48px, 72px"
            />
          </div>
          <span className="text-xs font-medium text-foreground group-hover:text-primary md:text-sm text-center w-full truncate">
            {category.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
