'use client';

import Link from 'next/link';
import type { MegaGroup } from '@/lib/nav';

interface MegaPanelProps {
  groups: MegaGroup[];
}

/**
 * Grid panel for mega menu groups.
 * - 모바일에서는 2열, 데스크톱에서는 최대 4열까지 표시
 */
export function MegaPanel({ groups }: MegaPanelProps) {
  return (
    <div className="grid gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {groups.map(group => (
        <div
          key={group.id}
          className="rounded-xl border bg-white p-4 shadow-sm md:p-5"
        >
          <h3 className="mb-2 font-semibold">{group.title}</h3>
          <ul className="space-y-1 text-sm">
            {group.items.map(item => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="rounded bg-primary px-1 text-[10px] uppercase text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

