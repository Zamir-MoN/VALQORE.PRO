const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();
prisma.user.findMany({ where: { role: 'admin' } })
  .then(users => console.log(users))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
