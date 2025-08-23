# Top Strip Banner

This module provides a dismissible banner shown at the top of the home page.

## Behavior
- Fetches the active banner from `/api/banners/active` with `no-store` caching.
- Shows a skeleton for at least 300 ms while loading.
- Users can hide the banner for a day or a week using localStorage with key `pinto_banner_hide_until__{id}`.
- Supports color, gradient or image backgrounds.
- Accessible via keyboard with roles and labels.

## Development
- Component: `src/components/TopStripBanner.tsx`
- API route: `src/app/api/banners/active/route.ts`
- Utilities: `src/lib/banner.ts`
- Styles: `src/styles/banner.css`

## Testing
Run lints and type checks:

```bash
pnpm lint
pnpm type-check
```
