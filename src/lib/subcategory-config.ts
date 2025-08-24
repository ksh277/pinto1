export interface CtaParams {
  [key: string]: string | undefined;
}

export interface SubcategoryInfo {
  type: 'product' | 'landing' | 'board' | 'guide';
  title: string;
  description: string;
  cta?: CtaParams;
}

export const subcategoryConfig: Record<string, Record<string, SubcategoryInfo>> = {
  fan: {
    acrylic: {
      type: 'product',
      title: '아크릴 굿즈',
      description: '투명도 높은 UV 인쇄와 도무송으로 팬굿즈의 완성도를 높이세요.',
      cta: { template: 'acrylic-keyring' },
    },
    sticker: {
      type: 'product',
      title: '스티커',
      description:
        '유광/무광·홀로그램까지, 원하는 소재로 고퀄리티 스티커 제작.',
      cta: { template: 'sticker-basic' },
    },
    standee: {
      type: 'product',
      title: '등신대',
      description:
        '소량부터 대형까지, 행사와 포토존에 최적화된 맞춤 등신대.',
      cta: { template: 'standee-basic' },
    },
  },
  promo: {
    mug: {
      type: 'product',
      title: '머그컵/유리컵',
      description: '전사/레이저/실크 인쇄로 브랜드 굿즈를 손쉽게.',
      cta: { template: 'mug-basic' },
    },
    tumbler: {
      type: 'product',
      title: '텀블러',
      description:
        '다양한 재질과 보온성으로 실용적인 홍보 텀블러 제작.',
      cta: { template: 'tumbler-basic' },
    },
    tshirt: {
      type: 'product',
      title: '티셔츠',
      description:
        '원단∙핏∙인쇄를 고르고 단체 주문도 간편하게.',
      cta: { template: 'tshirt-basic' },
    },
  },
  sign: {
    'led-neon': {
      type: 'product',
      title: 'LED 네온',
      description: '커스텀 문구/로고로 공간 무드를 바꾸는 네온사인.',
      cta: { template: 'led-neon-basic' },
    },
    'mini-sign': {
      type: 'product',
      title: '미니간판',
      description: '소형 공간에 적합한 맞춤 미니간판.',
      cta: { template: 'mini-sign-basic' },
    },
    'environment-design': {
      type: 'landing',
      title: '환경디자인',
      description: '공간 컨설팅부터 시공까지 원스톱 환경디자인.',
    },
  },
  pet: {
    frame: {
      type: 'product',
      title: '액자/소품/네임택',
      description:
        '가볍고 견고한 각인/UV 네임택, 옵션 선택으로 간편 제작.',
      cta: { template: 'pet-tag-basic' },
    },
    fabric: {
      type: 'product',
      title: '쿠션/방석/패브릭 제품',
      description:
        '편안한 소재의 맞춤 패브릭 제품으로 반려동물의 휴식을 완성하세요.',
      cta: { template: 'pet-cushion-basic' },
    },
    memorial: {
      type: 'landing',
      title: '장례용품',
      description:
        '차분한 안내와 맞춤 제작으로 반려동물의 마지막을 함께합니다.',
    },
  },
  packaging: {
    all: {
      type: 'product',
      title: '포장 부자재 전체보기',
      description:
        '다양한 봉투와 박스, 스티커까지 필요한 포장 부자재를 한곳에서.',
      cta: { template: 'package-basic' },
    },
  },
};

export function buildEditorLink(params?: CtaParams): string {
  if (!params) return '/editor';
  const search = new URLSearchParams(params as Record<string, string>);
  const query = search.toString();
  return `/editor${query ? `?${query}` : ''}`;
}
