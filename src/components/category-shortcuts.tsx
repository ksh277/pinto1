
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
    <div className="grid grid-cols-4 place-items-center gap-y-6 md:grid-cols-8">
      {categories.map((category) => (
        <Link
          href={category.href}
          key={category.id}
          className="group flex flex-col items-center gap-3 text-center w-24"
        >
          <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white transition-shadow group-hover:shadow-md dark:bg-secondary">
            <Image
              src={category.imgSrc}
              alt={category.label}
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <span className="text-xs font-medium text-foreground group-hover:text-primary md:text-sm">
            {category.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
