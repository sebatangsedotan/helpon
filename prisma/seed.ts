import { PrismaClient } from '@/generated/prisma/client';
import { seedUser } from './seeds/user.seed';

const prisma = new PrismaClient
();

async function main() {
  try {
    console.log('Starting User Seeding');
    await seedUser();
    console.log('User Seeding Completed');
    console.log('Seeding Completed');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
