# Admin Audit

## Directory Structure

```
src/app/admin
src/app/admin/products
src/app/admin/products/product-form.tsx
src/app/admin/products/new
src/app/admin/products/new/page.tsx
src/app/admin/products/page.tsx
src/app/admin/products/edit
src/app/admin/products/edit/[id]
src/app/admin/products/edit/[id]/page.tsx
src/app/admin/guide
src/app/admin/guide/new
src/app/admin/guide/new/page.tsx
src/app/admin/guide/page.tsx
src/app/admin/guide/edit
src/app/admin/guide/edit/[id]
src/app/admin/guide/edit/[id]/page.tsx
src/app/admin/guide/guide-form.tsx
src/app/admin/faq
src/app/admin/faq/new
src/app/admin/faq/new/page.tsx
src/app/admin/faq/page.tsx
src/app/admin/faq/edit
src/app/admin/faq/edit/[id]
src/app/admin/faq/edit/[id]/page.tsx
src/app/admin/faq/faq-form.tsx
src/app/admin/notice
src/app/admin/notice/new
src/app/admin/notice/new/page.tsx
src/app/admin/notice/notice-form.tsx
src/app/admin/notice/page.tsx
src/app/admin/notice/edit
src/app/admin/notice/edit/[id]
src/app/admin/notice/edit/[id]/page.tsx
src/app/admin/page.tsx
src/app/admin/layout.tsx
src/app/admin/inquiries
src/app/admin/inquiries/[id]
src/app/admin/inquiries/[id]/page.tsx
src/app/admin/inquiries/page.tsx
```

## Data Layer

- ORM: Prisma (schema at `prisma/schema.prisma`)
- Default datasource: SQLite via `DATABASE_URL` env var.

## Environment Variables

| Variable | Description |
| --- | --- |
| `PORTONE_API_KEY` | Payment provider API key |
| `PORTONE_API_SECRET` | Payment provider secret |
| `WEBHOOK_SECRET` | Webhook signing secret |
| `GEMINI_API_KEY` | Gemini API key |
| `DB_HOST` | Database host |
| `DB_PORT` | Database port |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `DB_NAME` | Database name |
| `DATABASE_URL` | Prisma database URL |

## Notes

The current Prisma schema only defines a `Design` model. No admin-specific tables (banners, categories, products, etc.) are present.

## PR0 Setup Checklist

- [x] Testing stack: vitest, @testing-library/react, @testing-library/jest-dom, jsdom
- [x] Storybook 8 with a11y addon
- [x] React Hot Toast provider at app root
- [x] Basic i18n structure (`src/i18n/ko.json` and `useI18n` hook)
- [x] Sample test and story in place
- [x] Scripts: `test`, `test:watch`, `storybook`, `storybook:build`
