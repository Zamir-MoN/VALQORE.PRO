import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function clean() {
  await prisma.user.deleteMany({ where: { email: 'test_otp@example.com' } });
  console.log('Cleaned up test user.');
}
clean().finally(() => prisma.$disconnect());
