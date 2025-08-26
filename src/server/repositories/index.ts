import type { ProductRepository, BannerRepository, OrderRepository } from './types';
import * as firestore from './drivers/firestore';
import * as prisma from './drivers/prisma';

const usePrisma = process.env.DATA_DRIVER === 'prisma';

export const productRepository: ProductRepository = usePrisma
  ? prisma.productRepository
  : firestore.productRepository;

export const bannerRepository: BannerRepository = usePrisma
  ? prisma.bannerRepository
  : firestore.bannerRepository;

export const orderRepository: OrderRepository = usePrisma
  ? prisma.orderRepository
  : firestore.orderRepository;
