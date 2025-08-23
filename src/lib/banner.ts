export type Banner = {
  id: string;
  isOpen: boolean;
  bgType: 'color' | 'image' | 'gradient';
  bgValue: string;
  message: string;
  href?: string;
  canClose: boolean;
  createdAt?: string;
  updatedAt?: string;
};

const PREFIX = 'pinto_banner_hide_until__';

export function getHideKey(id: string): string {
  return `${PREFIX}${id}`;
}

export function getHideUntil(id: string): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(getHideKey(id));
    return stored ? parseInt(stored, 10) : null;
  } catch {
    return null;
  }
}

export function setHideUntil(id: string, msFromNow: number): void {
  if (typeof window === 'undefined') return;
  try {
    const ts = Date.now() + msFromNow;
    window.localStorage.setItem(getHideKey(id), String(ts));
  } catch {
    // ignore
  }
}

export function isHidden(id: string): boolean {
  const ts = getHideUntil(id);
  return ts !== null && ts > Date.now();
}
