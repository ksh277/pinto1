export type MegaItem = {
  id: string;
  label: string;
  href: string;
  badge?: 'new' | 'hot' | 'sale' | null;
};

export type MegaGroup = {
  id: string;
  title: string;
  items: MegaItem[];
};

export type TopMenu = {
  id: string;
  label: string;
  order: number;
  show: boolean;
  groups?: MegaGroup[];
};

export const topMenus: TopMenu[] = [
  {
    id: 'all',
    label: 'ALL',
    order: 0,
    show: true,
    groups: [
      {
        id: 'all-overview',
        title: 'ALL',
        items: [
          { id: 'custom', label: '커스텀상품', href: '/all/custom' },
          { id: 'promo', label: '단체판촉상품', href: '/all/promo' },
          { id: 'ipgoods', label: 'IP굿즈 상품개발', href: '/ipgoods' },
          { id: 'branding', label: '브랜딩상품개발', href: '/branding' },
          { id: 'reviews', label: '리뷰', href: '/reviews' },
          { id: 'guide', label: '상품주문 가이드', href: '/guide' },
        ],
      },
      {
        id: 'core',
        title: '팬굿즈',
        items: [
          { id: 'acrylic', label: '아크릴 굿즈', href: '/acrylic' },
          { id: 'paper', label: '지류 굿즈', href: '/paper' },
          { id: 'sticker', label: '스티커(다꾸)', href: '/sticker' },
          { id: 'pin-set', label: '핀·각종·세트', href: '/pin-set' },
          { id: 'standee', label: '등신대', href: '/standee' },
          { id: 'etc', label: 'ETC', href: '/etc' },
        ],
      },
      {
        id: 'promo-group',
        title: '단체 판촉상품',
        items: [
          { id: 'mug', label: '머그컵·유리컵', href: '/promo/mug' },
          { id: 'tumbler', label: '텀블러', href: '/promo/tumbler' },
          { id: 'towel', label: '수건', href: '/promo/towel' },
          { id: 'clock', label: '시계', href: '/promo/clock' },
          { id: 'umbrella', label: '우산', href: '/promo/umbrella' },
          { id: 'tshirt', label: '티셔츠', href: '/promo/tshirt' },
        ],
      },
      {
        id: 'sign',
        title: '광고물/사인',
        items: [
          { id: 'led', label: 'LED 네온', href: '/sign/led' },
          { id: 'banner', label: '현수막·디자인', href: '/sign/banner' },
          { id: 'mini', label: '미니간판', href: '/sign/mini' },
        ],
      },
      {
        id: 'panel',
        title: '판넬종류',
        items: [
          { id: 'frame', label: '액자·스탠딩·테이블', href: '/panel/frame' },
          { id: 'cushion', label: '쿠션·천·석고보드 제품', href: '/panel/cushion' },
          { id: 'decor', label: '장식용품', href: '/panel/decor' },
        ],
      },
      {
        id: 'packaging',
        title: '포장 부자재',
        items: [{ id: 'all', label: '전체보기', href: '/packaging' }],
      },
    ],
  },
  {
    id: 'acrylic',
    label: '아크릴',
    order: 1,
    show: true,
    groups: [
      {
        id: 'acrylic-main',
        title: '아크릴 굿즈',
        items: [
          { id: 'keyring', label: '아크릴키링', href: '/acrylic/keyring' },
          { id: 'stand', label: '스탠드', href: '/acrylic/stand' },
        ],
      },
    ],
  },
  {
    id: 'paper',
    label: '지류',
    order: 2,
    show: true,
    groups: [
      {
        id: 'paper-main',
        title: '지류 굿즈',
        items: [
          { id: 'poster', label: '포스터', href: '/paper/poster' },
          { id: 'card', label: '카드', href: '/paper/card' },
        ],
      },
    ],
  },
  {
    id: 'sticker',
    label: '스티커',
    order: 3,
    show: true,
    groups: [
      {
        id: 'sticker-main',
        title: '스티커',
        items: [
          { id: 'basic', label: '일반 스티커', href: '/sticker/basic', badge: 'new' },
          { id: 'hologram', label: '홀로그램', href: '/sticker/holo' },
        ],
      },
    ],
  },
  { id: 'clothes', label: '의류', order: 4, show: true },
  { id: 'ipgoods', label: 'IP굿즈 상품개발', order: 5, show: true },
  { id: 'branding', label: '브랜딩', order: 6, show: true },
  { id: 'promo', label: '단체판촉제품', order: 7, show: true },
];
