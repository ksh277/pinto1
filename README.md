# Pinto

This project uses MySQL via Prisma, NextAuth for authentication, and an S3-compatible object store.

## Setup

1. Copy `.env.example` to `.env` and fill in the values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Prepare the database and seed sample data:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
4. Build and start the app:
   ```bash
   npm run build
   npm start
   ```

The seed script prints a generated password for the initial administrator account.
