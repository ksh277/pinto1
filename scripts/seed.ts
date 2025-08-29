import { randomBytes } from 'crypto';
import { prisma } from '../src/lib/prisma';

async function main() {
  const adminPassword = randomBytes(16).toString('hex');
  console.log(`Generated admin password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
