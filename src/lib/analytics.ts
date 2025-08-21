export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const g = (window as unknown as {
    gtag?: (...args: unknown[]) => void;
  }).gtag?.bind?.(window);
  if (g) g("event", event, params || {});
}
