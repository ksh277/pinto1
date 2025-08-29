export const categoryMeta: Record<string, { title: string; description?: string; banner?: string }> = {
  'fan/acrylic': { title: '팬굿즈 · 아크릴 굿즈', banner: 'https://placehold.co/1200x300' },
  'fan/paper': { title: '팬굿즈 · 지류 굿즈', banner: 'https://placehold.co/1200x300' },
  'fan/sticker': { title: '팬굿즈 · 스티커(다꾸)', banner: 'https://placehold.co/1200x300' },
  'fan/button': { title: '팬굿즈 · 핀거믹/버튼', banner: 'https://placehold.co/1200x300' },
  'fan/standee': { title: '팬굿즈 · 등신대', banner: 'https://placehold.co/1200x300' },
  'fan/etc': { title: '팬굿즈 · ETC', banner: 'https://placehold.co/1200x300' },
  'promo/mug': { title: '단체 판촉 · 머그컵/유리컵', banner: 'https://placehold.co/1200x300' },
  'promo/tumbler': { title: '단체 판촉 · 텀블러', banner: 'https://placehold.co/1200x300' },
  'promo/towel': { title: '단체 판촉 · 수건', banner: 'https://placehold.co/1200x300' },
  'promo/clock': { title: '단체 판촉 · 시계', banner: 'https://placehold.co/1200x300' },
  'promo/umbrella': { title: '단체 판촉 · 우산', banner: 'https://placehold.co/1200x300' },
  'promo/tshirt': { title: '단체 판촉 · 티셔츠', banner: 'https://placehold.co/1200x300' },
  'signage/led-neon': { title: '광고물/사인 · LED 네온', banner: 'https://placehold.co/1200x300' },
  'signage/environment-design': { title: '광고물/사인 · 환경디자인', banner: 'https://placehold.co/1200x300' },
  'signage/mini-sign': { title: '광고물/사인 · 미니간판', banner: 'https://placehold.co/1200x300' },
  'pet/frame-props-nametag': { title: '반려동물 · 액자/소품/네임택', banner: 'https://placehold.co/1200x300' },
  'pet/fabric': { title: '반려동물 · 쿠션/방석/패브릭 제품', banner: 'https://placehold.co/1200x300' },
  'pet/funeral': { title: '반려동물 · 장례용품', banner: 'https://placehold.co/1200x300' },
  'packaging/all': { title: '포장 부자재 · 전체보기', banner: 'https://placehold.co/1200x300' },
};

export function canonicalCategoryKeyFromSlug(slug: string[]): string | null {
  const key = slug.join('/');
  return categoryMeta[key] ? key : null;
}
