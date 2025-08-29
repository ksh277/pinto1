# PINTO – Next.js + Prisma + S3

This is the PINTO starter running on Next.js 15.3.3 with Prisma (MySQL).

Quick start (local):

1. Copy env: `cp .env.example .env.local` and edit `DATABASE_URL` (MySQL) and optional S3 settings.
2. Install: `pnpm install`
3. DB push: `npx prisma db push` (generates Prisma Client)
4. Dev: `pnpm dev`
5. Build & start: `pnpm build && pnpm start -p 3000`

Notes:
- API routes only export HTTP handlers and official options (`runtime`, etc.).
- S3 is optional. If not configured, upload endpoint returns a friendly 400/501 JSON instead of crashing.
- See `prisma/schema.prisma` for the current data model (Design).
- Admin root: visit `/admin` (redirects to products).
