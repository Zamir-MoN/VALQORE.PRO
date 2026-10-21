"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = require("./prismaClient");
async function inspect() {
    const numGames = await prismaClient_1.prisma.game.count();
    const numOrders = await prismaClient_1.prisma.order.count();
    const numPending = await prismaClient_1.prisma.order.count({ where: { status: 'PENDING' } });
    const numCompleted = await prismaClient_1.prisma.order.count({ where: { status: 'COMPLETED' } });
    const gamesDiscountGt0 = await prismaClient_1.prisma.game.count({ where: { discount: { gt: 0 } } });
    const gamesDiscountEq0 = await prismaClient_1.prisma.game.count({ where: { discount: 0 } });
    const gamesWithSteamPrice = await prismaClient_1.prisma.game.count({ where: { steamPrice: { not: null } } });
    console.log('--- RECOVERY DATABASE INSPECTION ---');
    console.log(`Number of Game records: ${numGames}`);
    console.log(`Number of Order records: ${numOrders}`);
    console.log(`Pending/unpaid orders: ${numPending}`);
    console.log(`Completed/paid orders: ${numCompleted}`);
    console.log(`Games with discount > 0: ${gamesDiscountGt0}`);
    console.log(`Games with discount = 0: ${gamesDiscountEq0}`);
    console.log(`Games with steamPrice: ${gamesWithSteamPrice}`);
    if (numOrders > 0) {
        console.log('WARNING: Order data exists. Checking if it looks like test data...');
        const sampleOrders = await prismaClient_1.prisma.order.findMany({ take: 5, include: { user: true } });
        sampleOrders.forEach(o => {
            console.log(`Order ${o.id}: user=${o.user.email} status=${o.status} total=${o.totalAmount}`);
        });
    }
    else {
        console.log('No order records found. Appears to be test/recovery environment.');
    }
    if (gamesDiscountGt0 > 0) {
        console.log('\n--- GAMES REQUIRING MIGRATION ---');
        const gamesToMigrate = await prismaClient_1.prisma.game.findMany({ where: { discount: { gt: 0 } } });
        gamesToMigrate.forEach(g => {
            const calculatedPrice = g.price * (1 - g.discount / 100);
            console.log(`ID: ${g.id} | Title: ${g.title} | Old Price: ${g.price} | Old Discount: ${g.discount} | New Final Price: ${calculatedPrice}`);
        });
    }
    await prismaClient_1.prisma.$disconnect();
}
inspect().catch(e => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=inspect_db.js.map