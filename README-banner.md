# Banner & Full-Bleed Preparation

This repository contains placeholders for a top strip banner and a full-bleed hero section.
Actual implementation is intentionally omitted. Future work should follow these notes:

## TopStripBanner
- Client component rendered at the very top of the page.
- Supports 1-day or 7-day hide options stored in `localStorage` using key pattern `pinto_banner_hide_until__{banner.id}`.
- Displays a 300ms loading skeleton before fetching `GET /api/banners/active`.
- Banner background types: `color`, `image`, `gradient`.
- Closing behaviour:
  - Unchecked box + close → hide for 1 day.
  - Checked box + close → hide for 7 days.

## Full-Bleed Utility
- Utility class name: `full-bleed`.
- Expands a section to full viewport width and ignores parent max-width.
- Remember to apply `overflow-x: hidden` on `body` to avoid horizontal scroll.

## Testing Outline
1. First visit shows loading skeleton then banner.
2. Closing without checkbox hides for 1 day; with checkbox hides for 7 days.
3. Hero and optional category strip should stretch edge-to-edge without horizontal scroll.

Further implementation should ensure accessibility, responsiveness and keyboard navigation.
