const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const bundle = await prisma.game.findUnique({ where: { slug: 'legendary-bundle' } });
  console.log(bundle ? bundle.bundleGames : "Not found");
  process.exit(0);
}
run();
