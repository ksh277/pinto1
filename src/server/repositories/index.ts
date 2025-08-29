import type { ProductRepository, OrderRepository } from './types';
import * as prisma from './drivers/prisma';

export const productRepository: ProductRepository = prisma.productRepository;

export const orderRepository: OrderRepository = prisma.orderRepository;
