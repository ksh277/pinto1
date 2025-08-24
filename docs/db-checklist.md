# Database Checklist

- Prisma datasource uses SQLite (`DATABASE_URL`).
- Current schema (`prisma/schema.prisma`) only defines model `Design`.
- The following required tables are **missing**:
  - `banners`, `banner_placements`
  - `strip_banners`
  - `categories`, `subcategories`
  - `products`
  - `order_items`
  - `product_events`
  - `market_weekly_rank`
- No migration files are present.
- Prisma migration status not executed in this audit.
