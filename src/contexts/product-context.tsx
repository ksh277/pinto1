

'use client';

import { createContext, useContext, useState, type ReactNode, useCallback, useMemo, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { mockProducts } from '@/lib/data'; // Import mock data

export type Role = 'guest' | 'user' | 'seller' | 'admin';

interface ProductContextType {
  products: Product[];
  getProductById: (id: string) => Product | undefined;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'slug' | 'stats' | 'imageUrls' | 'operatorIds'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleLike: (id: string) => void;
  role: Role;
  setRole: (role: Role) => void;
  isProductsLoading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [role, setRole] = useLocalStorage<Role>('role', 'guest');
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch from Firestore here.
    // For now, we'll use the mock data and simulate loading.
    setTimeout(() => {
        setProducts(mockProducts);
        setIsProductsLoading(false);
    }, 500);
  }, []);


  const getProductById = useCallback((id: string) => {
    return products.find(p => p.id === id);
  }, [products]);
  
  const addProduct = async (
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'slug' | 'stats' | 'imageUrls' | 'operatorIds'>
  ) => {
      const newProductData: Product = {
          ...productData,
          id: String(Date.now()),
          slug: productData.nameKo.replace(/ /g, '-').toLowerCase(),
          imageUrls: [productData.imageUrl],
          operatorIds: [],
          stats: {
            likeCount: 0,
            reviewCount: 0,
            ratingSum: 0,
            avgRating: 0
          },
          createdAt: new Date(),
          updatedAt: new Date(),
      };
      setProducts(prev => [...prev, newProductData]);
  };

  const updateProduct = async (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? { ...p, ...updatedProduct, updatedAt: new Date() } : p));
  };
  
  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleLike = useCallback((id: string) => {
    setProducts(prevProducts =>
      prevProducts.map(p => {
        if (p.id === id) {
          const newLikeCount = p.stats.likeCount > 0 ? 0 : 1; // simple toggle for demo
          return { ...p, stats: { ...p.stats, likeCount: newLikeCount } };
        }
        return p;
      })
    );
  }, []);
  
  const handleSetRole = useCallback((newRole: Role) => {
    setRole(newRole);
  }, [setRole]);

  const value = useMemo(() => ({ 
    products, 
    getProductById, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    toggleLike, 
    role, 
    setRole: handleSetRole,
    isProductsLoading
  }), [products, getProductById, addProduct, updateProduct, deleteProduct, toggleLike, role, handleSetRole, isProductsLoading]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProductContext() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
}
