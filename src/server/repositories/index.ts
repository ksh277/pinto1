import type { ProductRepository, BannerRepository, OrderRepository } from './types';
import * as prisma from './drivers/prisma';

export const productRepository: ProductRepository = prisma.productRepository;
export const bannerRepository: BannerRepository = prisma.bannerRepository;
export const orderRepository: OrderRepository = prisma.orderRepository;
