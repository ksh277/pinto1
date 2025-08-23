import { Banner } from '@/lib/banner';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET() {
  const banner: Banner = {
    id: 'home-20250823',
    isOpen: true,
    bgType: 'gradient',
    bgValue: 'linear-gradient(90deg, #0ea5e9 0%, #22c55e 100%)',
    message: "나만의 굿즈 메이킹 ‘PINTO’ OPEN EVENT ｜ 카카오톡 플친 500Point",
    href: '/event/open',
    canClose: true,
  };

  return Response.json(banner, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
