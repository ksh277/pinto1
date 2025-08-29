import type { Product, Order } from '@/lib/types';

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  ping(): Promise<void>;
}

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  ping(): Promise<void>;
}
