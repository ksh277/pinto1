# Home Page Overview

This document describes the mocked API endpoints and components used by the PINTO home page.

## API

### `GET /api/banners/active`
Returns the currently active top banner. The banner can be hidden by local storage for 24h.

### `GET /api/products/home`
Mocked endpoint returning recommended products and creator picks.

```
type HomeResponse = {
  recommended: Product[];
  creatorPicks: Product[];
};
```

## Components

- **TopBanner** – fetches `/api/banners/active`, shows a skeleton for at least 300 ms and stores a hide-until timestamp in localStorage when dismissed.
- **ProductCard** – displays a product thumbnail, name, price and a second line with `리뷰 N` and a like button with `❤ M`.

