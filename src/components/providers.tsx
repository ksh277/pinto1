
'use client';

import type { ReactNode } from 'react';
import { I18nProvider } from '@/contexts/i18n-context';
import { CartProvider } from '@/contexts/cart-context';
import { ProductProvider } from '@/contexts/product-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { CommunityProvider } from '@/contexts/community-context';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ProductProvider>
        <CommunityProvider>
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        </CommunityProvider>
      </ProductProvider>
    </I18nProvider>
  );
}
