const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const games = await prisma.game.findMany({
    where: { isBundle: true }
  });
  console.log(JSON.stringify(games.map(g => ({ title: g.title, slug: g.slug, bundleGames: g.bundleGames })), null, 2));
}
run();
