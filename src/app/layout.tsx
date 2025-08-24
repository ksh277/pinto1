
import type { Metadata } from 'next';
import Link from 'next/link';
import { Palette } from 'lucide-react';
import { Providers } from '@/components/providers';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster as RadixToaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Chatbot } from '@/components/chatbot';
import './globals.css';

export const metadata: Metadata = {
  title: 'PINTO - Custom Goods Printing',
  description: 'Create and order your own custom goods!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-grow bg-background">{children}</main>
            <Footer />
          </div>
          <RadixToaster />
          <div className="fixed bottom-6 left-6 z-50">
            <Button asChild size="lg" className="rounded-full shadow-lg">
              <Link href="/editor">
                <Palette className="mr-2" />
                굿즈 에디터
              </Link>
            </Button>
          </div>
          <Chatbot />
        </Providers>
      </body>
    </html>
  );
}
