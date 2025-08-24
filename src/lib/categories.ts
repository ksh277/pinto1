

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

// ALL subcategories for mega menu
const allSubNav: SubCategory[] = [
  ...acrylicSubNav,
  ...woodSubNav,
  ...packagingSubNav,
  // 추가적으로 다른 카테고리 subnav도 여기에 합칠 수 있음
];

export const mainNavItems: MainCategory[] = [
  {
    id: 'all',
    href: '#',
    label: 'ALL',
    subnav: allSubNav
  },
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
