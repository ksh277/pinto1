import prisma from '@/lib/prisma';
import type { ProductRepository, OrderRepository } from '../types';

async function ping(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
}

export const productRepository: ProductRepository = {
  async findById(_id) {
    // TODO: implement when Product model is added
    return null;
  },
  ping,
};

export const orderRepository: OrderRepository = {
  async findById(_id) {
    return null;
  },
  ping,
};
