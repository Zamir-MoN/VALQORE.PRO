import { prisma } from '../prismaClient';
import { ParsedEmailData } from '../utils/parser.util';
import { createSteamMonUser, generateSecurePassword, grantGameAccess } from '../utils/steamMonService';
import { getIO } from '../socket';

/**
 * Fulfills Steam Mon game access when an order is completed/paid.
 */
export async function fulfillOrderSteamAccess(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { game: true }
        },
        user: true
      }
    });

    if (!order || !order.user) return;

    const gamesWithSteamApp = order.items.filter(item => item.game.steamAppId);
    if (gamesWithSteamApp.length === 0) return;

    let steamMonUsername = order.user.steamMonUsername;
    let steamMonPassword = order.user.steamMonPassword;

    if (!steamMonUsername || !steamMonPassword) {
      steamMonUsername = order.user.username;
      steamMonPassword = generateSecurePassword();

      await prisma.user.update({
        where: { id: order.userId },
        data: { steamMonUsername, steamMonPassword }
      });
    }

    const steamUser = await createSteamMonUser(steamMonUsername as string, steamMonPassword as string);

    for (const item of gamesWithSteamApp) {
      if (item.game.steamAppId) {
        await grantGameAccess(steamUser.id, item.game.steamAppId);
      }
    }
    console.log(`[STEAM MON] Successfully granted game access for order ${orderId}`);
  } catch (steamErr) {
    console.error('[STEAM MON FULFILLMENT ERROR]', steamErr);
  }
}

/**
 * Processes a parsed bank/FamApp email and matches it to a pending order.
 */
export async function processPaymentEmail(data: ParsedEmailData) {
  try {
    // 1. Check if UTR already exists in DB
    const existingTransaction = await prisma.transaction.findUnique({
      where: { utr: data.utr }
    });

    if (existingTransaction) {
      console.log(`[Verification] Duplicate UTR detected in email: ${data.utr}. Ignoring.`);
      return false;
    }

    // 2. Save the Transaction unconditionally
    const transaction = await prisma.transaction.create({
      data: {
        utr: data.utr,
        amount: data.amount,
        transactionId: data.transactionId,
        sender: data.sender,
        date: data.date,
      }
    });

    // 3. Find Pending order that submitted this exact UTR or has matching purpose
    let pendingOrder = await prisma.order.findFirst({
      where: {
        submittedUtr: data.utr,
        status: 'PENDING',
      }
    });

    if (!pendingOrder && data.purpose) {
      pendingOrder = await prisma.order.findFirst({
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
    await prisma.$transaction(async (tx) => {
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
      getIO()?.emit(`payment_status_${pendingOrder.id}`, { status: 'COMPLETED' });
      getIO()?.emit('orders_updated');
    } catch (e) {
      // socket might be optional
    }

    // Fulfill Steam Mon Account
    await fulfillOrderSteamAccess(pendingOrder.id);

    console.log(`[Verification] Successfully verified payment for order ${pendingOrder.id} with UTR ${data.utr}`);
    return true;
  } catch (error) {
    console.error('[Verification Error]', error);
    return false;
  }
}
