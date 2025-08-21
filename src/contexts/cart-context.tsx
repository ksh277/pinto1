
'use client';

import { createContext, useContext, type ReactNode, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { CartItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from './i18n-context';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>('cart', []);
  const { toast } = useToast();
  const { t, locale } = useI18n();

  const addToCart = useCallback((itemToAdd: Omit<CartItem, 'id'>) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item =>
          item.productId === itemToAdd.productId &&
          JSON.stringify(item.options) === JSON.stringify(itemToAdd.options)
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + (itemToAdd.quantity || 1)
        };
         toast({
            title: t('cart.itemAddedTitle'),
            description: t('cart.itemAddedDescription').replace('{itemName}', locale === 'ko' ? itemToAdd.nameKo : itemToAdd.nameEn)
        });
        return updatedItems;
      } else {
        const newItem: CartItem = {
          ...itemToAdd,
          id: `${itemToAdd.productId}-${JSON.stringify(itemToAdd.options)}-${Date.now()}`,
        };
         toast({
            title: t('cart.itemAddedTitle'),
            description: t('cart.itemAddedDescription').replace('{itemName}', locale === 'ko' ? newItem.nameKo : newItem.nameEn)
        });
        return [...prevItems, newItem];
      }
    });
  }, [setCartItems, toast, t, locale]);

  const removeFromCart = useCallback((itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  }, [setCartItems]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item => (item.id === itemId ? { ...item, quantity } : item))
      );
    }
  }, [setCartItems, removeFromCart]);
  
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, [setCartItems]);

  const cartCount = useMemo(() => cartItems.reduce((count, item) => count + item.quantity, 0), [cartItems]);
  const totalPrice = useMemo(() => cartItems.reduce((total, item) => total + item.price * item.quantity, 0), [cartItems]);

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    totalPrice,
  }), [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, totalPrice]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
