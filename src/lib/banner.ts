// Utilities for managing banner hide state in localStorage.
// TODO: flesh out implementations.

export type Banner = {
  id: string;
  isOpen: boolean;
  bgType: 'color' | 'image' | 'gradient';
  bgValue: string;
  message: string;
  href?: string;
  canClose: boolean;
};

export function buildHideKey(id: string): string {
  // TODO: follow key format `pinto_banner_hide_until__{banner.id}`
  return `pinto_banner_hide_until__${id}`;
}

export function getRemainingTime(_key: string): number | null {
  // TODO: return remaining ms until the banner can reappear
  return null;
}

export function saveHideUntil(_key: string, _expiresAt: number): void {
  // TODO: persist expiration timestamp to localStorage
}

export function isHidden(_key: string): boolean {
  // TODO: determine if the banner should be hidden based on expiry
  return false;
}
