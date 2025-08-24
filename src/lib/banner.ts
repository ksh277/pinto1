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

const HIDE_PREFIX = 'banner:';
const HIDE_SUFFIX = ':hideUntil';
const SESSION_SUFFIX = ':closed';

function hideKey(id: string): string {
  return `${HIDE_PREFIX}${id}${HIDE_SUFFIX}`;
}

function sessionKey(id: string): string {
  return `${HIDE_PREFIX}${id}${SESSION_SUFFIX}`;
}

export function getHideUntil(id: string): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(hideKey(id));
    if (!stored) return null;
    const ts = Date.parse(stored);
    if (isNaN(ts) || ts <= Date.now()) {
      window.localStorage.removeItem(hideKey(id));
      return null;
    }
    return ts;
  } catch {
    return null;
  }
}

export function setHideUntil(id: string, until: Date): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(hideKey(id), until.toISOString());
  } catch {
    // ignore
  }
}

export function setSessionClosed(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(sessionKey(id), '1');
  } catch {
    // ignore
  }
}

function isSessionClosed(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(sessionKey(id)) === '1';
  } catch {
    return false;
  }
}

export function isHidden(id: string): boolean {
  const ts = getHideUntil(id);
  return (ts !== null && ts > Date.now()) || isSessionClosed(id);
}

export { hideKey as getHideKey };
