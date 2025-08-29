"use client";

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useProductContext } from '@/contexts/product-context';
import { Package, FileText, HelpCircle, MessageSquare, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/notice', label: 'Notices', icon: FileText },
  { href: '/admin/faq', label: 'FAQ', icon: HelpCircle },
  { href: '/admin/guide', label: 'Guides', icon: BookOpen },
  { href: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { role } = useProductContext();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthorized = role === 'admin' || role === 'seller';

  useEffect(() => {
    if (!isAuthorized) {
      router.replace('/');
    }
  }, [isAuthorized, router]);

  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Unauthorized. Redirecting to home...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 flex-shrink-0 bg-gray-800 p-6 text-white">
        <h2 className="mb-8 text-2xl font-bold">PINTO Admin</h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href}>
              <span
                className={cn(
                  'flex items-center gap-3 rounded-md px-4 py-3 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white',
                  (pathname ?? '').startsWith(item.href) && 'bg-gray-900 text-white',
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}

