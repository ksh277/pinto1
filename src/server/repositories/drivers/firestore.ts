import { getFirestore } from '@/lib/firebase.admin';
import type { Banner } from '@/lib/banner';
import type { Product, Order } from '@/lib/types';
import type {
  ProductRepository,
  BannerRepository,
  OrderRepository,
} from '../types';

const db = getFirestore();

async function ping(): Promise<void> {
  await db.doc('_meta/ping').get();
}

export const productRepository: ProductRepository = {
  async findById(id) {
    const snap = await db.collection('products').doc(id).get();
    return snap.exists ? (snap.data() as Product) : null;
  },
  ping,
};

export const bannerRepository: BannerRepository = {
  async findById(id) {
    const snap = await db.collection('banners').doc(id).get();
    return snap.exists ? (snap.data() as Banner) : null;
  },
  ping,
};

export const orderRepository: OrderRepository = {
  async findById(id) {
    const snap = await db.collection('orders').doc(id).get();
    return snap.exists ? (snap.data() as Order) : null;
  },
  ping,
};
