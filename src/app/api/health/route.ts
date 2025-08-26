export const runtime = 'nodejs';

import { productRepository } from '@/server/repositories';

export async function GET() {
  try {
    await productRepository.ping();
    return new Response('ok');
  } catch (err) {
    return new Response('unhealthy', { status: 500 });
  }
}
