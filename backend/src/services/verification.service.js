"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fulfillOrderSteamAccess = fulfillOrderSteamAccess;
exports.processPaymentEmail = processPaymentEmail;
const prismaClient_1 = require("../prismaClient");
const steamMonService_1 = require("../utils/steamMonService");
const socket_1 = require("../socket");
/**
 * Fulfills Steam Mon game access when an order is completed/paid.
 */
async function fulfillOrderSteamAccess(orderId) {
    try {
        const order = await prismaClient_1.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: { game: true }
                },
                user: true
            }
        });
        if (!order || !order.user)
            return;
        const gamesWithSteamApp = order.items.filter(item => item.game.steamAppId);
        if (gamesWithSteamApp.length === 0)
            return;
        let steamMonUsername = order.user.steamMonUsername;
        let steamMonPassword = order.user.steamMonPassword;
        if (!steamMonUsername || !steamMonPassword) {
            steamMonUsername = order.user.username;
            steamMonPassword = (0, steamMonService_1.generateSecurePassword)();
            await prismaClient_1.prisma.user.update({
                where: { id: order.userId },
                data: { steamMonUsername, steamMonPassword }
            });
        }
        const steamUser = await (0, steamMonService_1.createSteamMonUser)(steamMonUsername, steamMonPassword);
        for (const item of gamesWithSteamApp) {
            if (item.game.steamAppId) {
                await (0, steamMonService_1.grantGameAccess)(steamUser.id, item.game.steamAppId);
            }
        }
        console.log(`[STEAM MON] Successfully granted game access for order ${orderId}`);
    }
    catch (steamErr) {
        console.error('[STEAM MON FULFILLMENT ERROR]', steamErr);
    }
}
/**
 * Processes a parsed bank/FamApp email and matches it to a pending order.
 */
async function processPaymentEmail(data) {
    try {
        // 1. Check if UTR already exists in DB
        const existingTransaction = await prismaClient_1.prisma.transaction.findUnique({
            where: { utr: data.utr }
        });
        if (existingTransaction) {
            console.log(`[Verification] Duplicate UTR detected in email: ${data.utr}. Ignoring.`);
            return false;
        }
        // 2. Save the Transaction unconditionally
        const transaction = await prismaClient_1.prisma.transaction.create({
            data: {
                utr: data.utr,
                amount: data.amount,
                transactionId: data.transactionId,
                sender: data.sender,
                date: data.date,
            }
        });
        // 3. Find Pending order that submitted this exact UTR or has matching purpose
        let pendingOrder = await prismaClient_1.prisma.order.findFirst({
            where: {
                submittedUtr: data.utr,
                status: 'PENDING',
            }
        });
        if (!pendingOrder && data.purpose) {
            pendingOrder = await prismaClient_1.prisma.order.findFirst({
                where: {
                    id: data.purpose,
                    status: 'PENDING',
                }
            });
        }
        if (!pendingOrder) {
            console.log(`[Verification] No pending order has claimed UTR: ${data.utr} yet. Saved transaction for future matching.`);
            return true;
        }
        if (Math.abs(pendingOrder.totalAmount - data.amount) > 0.01) {
            console.log(`[Verification] Amount mismatch for order ${pendingOrder.id}. Expected ${pendingOrder.totalAmount}, got ${data.amount}`);
            return false;
        }
        // 4. Payment Success - Match found
        await prismaClient_1.prisma.$transaction(async (tx) => {
            await tx.transaction.update({
                where: { id: transaction.id },
                data: { orderId: pendingOrder.id }
            });
            await tx.order.update({
                where: { id: pendingOrder.id },
                data: { status: 'COMPLETED', submittedUtr: data.utr }
            });
        });
        // Emit live WebSocket update so frontend modal closes/succeeds immediately
        try {
            (0, socket_1.getIO)()?.emit(`payment_status_${pendingOrder.id}`, { status: 'COMPLETED' });
            (0, socket_1.getIO)()?.emit('orders_updated');
        }
        catch (e) {
            // socket might be optional
        }
        // Fulfill Steam Mon Account
        await fulfillOrderSteamAccess(pendingOrder.id);
        console.log(`[Verification] Successfully verified payment for order ${pendingOrder.id} with UTR ${data.utr}`);
        return true;
    }
    catch (error) {
        console.error('[Verification Error]', error);
        return false;
    }
}
//# sourceMappingURL=verification.service.js.map