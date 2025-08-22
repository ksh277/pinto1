

import type { ProductSubcategory } from './types';

export interface SubCategory {
  href: string;
  label: string;
  id: ProductSubcategory;
}

export interface MainCategory {
  id: string;
  href: string;
  label: string;
  subnav?: SubCategory[];
}

const acrylicSubNav: SubCategory[] = [
  { href: '/category/acrylic?sub=keyring', label: '아크릴키링', id: 'keyring' },
  { href: '/category/acrylic?sub=korotto', label: '코롯토', id: 'korotto' },
  { href: '/category/acrylic?sub=smarttok', label: '스마트톡', id: 'smarttok' },
  { href: '/category/acrylic?sub=stand', label: '스탠드/디오라마', id: 'stand' },
  { href: '/category/acrylic?sub=holder', label: '포카홀더/포토액자', id: 'holder' },
  { href: '/category/acrylic?sub=shaker', label: '아크릴쉐이커', id: 'shaker' },
  { href: '/category/acrylic?sub=carabiner', label: '아크릴카라비너', id: 'carabiner' },
  { href: '/category/acrylic?sub=mirror', label: '거울', id: 'mirror' },
  { href: '/category/acrylic?sub=magnet', label: '자석/뱃지/코스터', id: 'magnet' },
  { href: '/category/acrylic?sub=stationery', label: '문구류(집게, 볼펜 등)', id: 'stationery' },
  { href: '/category/acrylic?sub=cutting', label: '아크릴 재단', id: 'cutting' },
];

const woodSubNav: SubCategory[] = [
  { href: '/category/wood?sub=keyring', label: '우드키링', id: 'keyring' },
  { href: '/category/wood?sub=magnet', label: '우드마그넷', id: 'magnet' },
  { href: '/category/wood?sub=stand', label: '우드스탠드', id: 'stand' },
];

const packagingSubNav: SubCategory[] = [
  { href: '/category/packaging?sub=swatch', label: '스와치', id: 'swatch' },
  { href: '/category/packaging?sub=supplies', label: '부자재', id: 'supplies' },
  { href: '/category/packaging?sub=packaging', label: '포장재', id: 'packaging' },
];

export const mainNavItems: MainCategory[] = [
  { 
    id: 'acrylic',
    href: '/category/acrylic', 
    label: '아크릴',
    subnav: acrylicSubNav
  },
  { 
    id: 'wood', 
    href: '/category/wood', 
    label: '우드',
    subnav: woodSubNav
  },
  { id: 'lanyard', href: '/category/lanyard', label: '랜야드' },
  { id: 'clothing', href: '#', label: '의류' },
  { 
    id: 'packaging', 
    href: '/category/packaging', 
    label: '포장/부자재',
    subnav: packagingSubNav
  },
  { id: 'stationery', href: '#', label: '문구/오피스' },
  { id: 'ipGoods', href: '#', label: 'IP굿즈 상품개발' },
  { id: 'welcomeKit', href: '#', label: '기업/웰컴 키트' },
  { id: 'promotional', href: '#', label: '단체 판촉' },
];

export const categoriesMap: Record<string, { name: string; subCategories: Omit<SubCategory, 'href'>[] }> = {
  acrylic: { name: '아크릴굿즈', subCategories: acrylicSubNav.map(s => ({label: s.label, id: s.id})) },
  wood: { name: '우드굿즈', subCategories: woodSubNav.map(s => ({label: s.label, id: s.id})) },
  packaging: { name: '포장/부자재', subCategories: packagingSubNav.map(s => ({label: s.label, id: s.id})) },
  lanyard: { name: '랜야드', subCategories: [] },
};

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

export type MenuTop = {
  id: string;
  label: string;
  slug?: string;
  show: boolean;
  order: number;
  groups?: MegaGroup[];
};

export const menuTops: MenuTop[] = [
  {
    id: 'all',
    label: 'ALL',
    show: true,
    order: 0,
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
        title: '핵굿즈',
        items: [
          { id: 'acrylic', label: '아크릴 굿즈', href: '/acrylic' },
          { id: 'paper', label: '지류 굿즈', href: '/paper' },
          { id: 'sticker', label: '스티커(다꾸)', href: '/sticker' },
          { id: 'pin-set', label: '핀/각종/세트', href: '/pin-set' },
          { id: 'standee', label: '등신대', href: '/standee' },
          { id: 'etc', label: 'ETC', href: '/etc' },
        ],
      },
      {
        id: 'promo-group',
        title: '단체 판촉상품',
        items: [
          { id: 'mug', label: '머그컵/유리컵', href: '/promo/mug' },
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
          { id: 'banner', label: '현수막/디자인', href: '/sign/banner' },
          { id: 'mini', label: '미니간판', href: '/sign/mini' },
        ],
      },
      {
        id: 'panel',
        title: '판넬종류',
        items: [
          { id: 'frame', label: '액자/스탠딩/테이블', href: '/panel/frame' },
          { id: 'cushion', label: '쿠션/천/석고보드 제품', href: '/panel/cushion' },
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
    show: true,
    order: 1,
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
    show: true,
    order: 2,
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
    show: true,
    order: 3,
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
  { id: 'clothes', label: '의류', show: true, order: 4 },
  { id: 'ipgoods', label: 'IP굿즈 상품개발', show: true, order: 5 },
  { id: 'branding', label: '브랜딩', show: true, order: 6 },
  { id: 'promo', label: '단체판촉제품', show: true, order: 7 },
];

