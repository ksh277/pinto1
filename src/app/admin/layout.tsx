
'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useProductContext } from '@/contexts/product-context';
import { Package, FileText, HelpCircle, MessageSquare, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/admin/products', label: '상품 관리', icon: Package },
    { href: '/admin/notice', label: '공지사항 관리', icon: FileText },
    { href: '/admin/faq', label: 'FAQ 관리', icon: HelpCircle },
    { href: '/admin/guide', label: '이용가이드 관리', icon: BookOpen },
    { href: '/admin/inquiries', label: '1:1 문의 관리', icon: MessageSquare },
]

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
            <p>권한이 없습니다. 메인으로 리디렉션합니다...</p>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
        <aside className="w-64 flex-shrink-0 bg-gray-800 p-6 text-white">
            <h2 className="text-2xl font-bold mb-8">PINTO Admin</h2>
            <nav className="space-y-2">
                {navItems.map(item => (
                     <Link key={item.label} href={item.href}>
                        <span className={cn("flex items-center gap-3 rounded-md px-4 py-3 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white", pathname.startsWith(item.href) && "bg-gray-900 text-white")}>
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </span>
                    </Link>
                ))}
            </nav>
        </aside>
        <main className="flex-1 p-8 bg-gray-50">
            {children}
        </main>
    </div>
    );
}
