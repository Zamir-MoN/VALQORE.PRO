import express from 'express';
import { prisma } from '../prismaClient';
import { authMiddleware, isAdminMiddleware } from '../middleware/auth';
import { getIO } from '../socket';
import jwt from 'jsonwebtoken';

const router = express.Router();

let tableEnsured = false;
async function ensureGiveawayTable() {
  if (tableEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "GiveawayEntry" (
        "id" TEXT PRIMARY KEY,
        "gameId" TEXT NOT NULL REFERENCES "Game"("id") ON DELETE CASCADE,
        "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "code" TEXT,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "GiveawayEntry_gameId_userId_key" UNIQUE ("gameId", "userId")
      );
    `);
    // Ensure columns exist if table was previously created without them
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "GiveawayEntry" ADD COLUMN IF NOT EXISTS "code" TEXT;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "GiveawayEntry" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'PENDING';
    `);
    tableEnsured = true;
  } catch (err) {
    console.warn('Could not auto-create / alter GiveawayEntry table (may already exist):', err);
  }
}

// Ensure table on first load
ensureGiveawayTable().catch(() => {});

// Generate a random 4-digit code (e.g., "4829")
function generate4DigitCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Optional auth helper to check if user is logged in without blocking
const optionalAuthMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  const JWT_SECRET = process.env.JWT_SECRET as string;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string, userId?: string };
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME as string;
    let isAdmin = false;
    if (!decoded.userId && decoded.username === ADMIN_USERNAME) {
      isAdmin = true;
    }
    req.user = { ...decoded, isAdmin };
  } catch (err) {
    // Expired or invalid token for optional auth - proceed safely as guest
  }
  return next();
};

// GET /api/giveaways/:id/status
// Public / authenticated status of a giveaway (total entries, approved count, user entry & 4-digit code)
router.get('/:id/status', optionalAuthMiddleware, async (req, res) => {
  try {
    await ensureGiveawayTable();
    const { id } = req.params;

    // Resolve game by ID or slug
    const game = await prisma.game.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isGiveaway: true
      }
    });

    if (!game) {
      return res.status(404).json({ error: 'Giveaway not found' });
    }

    // Count entries
    let totalEntries = 0;
    let approvedEntries = 0;
    try {
      totalEntries = await (prisma as any).giveawayEntry.count({
        where: { gameId: game.id }
      });
      approvedEntries = await (prisma as any).giveawayEntry.count({
        where: { gameId: game.id, status: 'APPROVED' }
      });
    } catch {
      const rawCount: any = await prisma.$queryRawUnsafe(
        'SELECT COUNT(*)::int as total, COUNT(CASE WHEN status = \'APPROVED\' THEN 1 END)::int as approved FROM "GiveawayEntry" WHERE "gameId" = $1',
        game.id
      );
      totalEntries = rawCount?.[0]?.total ? parseInt(rawCount[0].total, 10) : 0;
      approvedEntries = rawCount?.[0]?.approved ? parseInt(rawCount[0].approved, 10) : 0;
    }

    let hasEntered = false;
    let userEntry: any = null;

    if (req.user?.userId) {
      try {
        userEntry = await (prisma as any).giveawayEntry.findUnique({
          where: {
            gameId_userId: {
              gameId: game.id,
              userId: req.user.userId
            }
          }
        });
      } catch {
        const rawEntry: any = await prisma.$queryRawUnsafe(
          'SELECT id, "gameId", "userId", code, status, "createdAt" FROM "GiveawayEntry" WHERE "gameId" = $1 AND "userId" = $2 LIMIT 1',
          game.id,
          req.user.userId
        );
        userEntry = rawEntry?.[0] || null;
      }
      hasEntered = Boolean(userEntry);
    }

    // Parse giveaway rules for winner/config
    let giveawayConfig: any = null;
    try {
      if (game.giveawayRules) {
        giveawayConfig = JSON.parse(game.giveawayRules);
      }
    } catch {
      giveawayConfig = { rules: game.giveawayRules };
    }

    res.json({
      giveawayId: game.id,
      totalEntries,
      approvedEntries,
      hasEntered,
      isApproved: userEntry?.status === 'APPROVED',
      userEntry,
      winner: giveawayConfig?.winner || null,
      giveawayConfig
    });
  } catch (error: any) {
    console.error('Error fetching giveaway status:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch giveaway status' });
  }
});

// POST /api/giveaways/:id/enter
// User clicks participate in the giveaway. Generates 4-digit code for Instagram DM verification.
router.post('/:id/enter', authMiddleware, async (req, res) => {
  try {
    await ensureGiveawayTable();
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'You must be logged in to participate in the giveaway' });
    }

    const game = await prisma.game.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isGiveaway: true
      }
    });

    if (!game) {
      return res.status(404).json({ error: 'Giveaway not found' });
    }

    if (game.outOfStock) {
      return res.status(400).json({ error: 'This giveaway has concluded' });
    }

    // Check if user already entered
    let existingEntry: any = null;
    try {
      existingEntry = await (prisma as any).giveawayEntry.findUnique({
        where: {
          gameId_userId: {
            gameId: game.id,
            userId
          }
        }
      });
    } catch {
      const raw: any = await prisma.$queryRawUnsafe(
        'SELECT id, "gameId", "userId", code, status, "createdAt" FROM "GiveawayEntry" WHERE "gameId" = $1 AND "userId" = $2 LIMIT 1',
        game.id,
        userId
      );
      existingEntry = raw?.[0] || null;
    }

    if (existingEntry) {
      // Ensure code exists
      let userCode = existingEntry.code;
      if (!userCode) {
        userCode = generate4DigitCode();
        try {
          await (prisma as any).giveawayEntry.update({
            where: { id: existingEntry.id },
            data: { code: userCode }
          });
        } catch {
          await prisma.$executeRawUnsafe(
            'UPDATE "GiveawayEntry" SET code = $1 WHERE id = $2',
            userCode,
            existingEntry.id
          );
        }
        existingEntry.code = userCode;
      }

      return res.status(200).json({
        success: true,
        alreadyEntered: true,
        isApproved: existingEntry.status === 'APPROVED',
        code: userCode,
        entry: existingEntry,
        message: existingEntry.status === 'APPROVED' 
          ? 'Your entry is already verified and approved!' 
          : 'Please send this 4-digit code in Instagram DM to verify your follow!'
      });
    }

    // Generate unique 4-digit code
    const fourDigitCode = generate4DigitCode();
    const entryId = `entry_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    let createdEntry: any = null;

    try {
      createdEntry = await (prisma as any).giveawayEntry.create({
        data: {
          id: entryId,
          gameId: game.id,
          userId,
          code: fourDigitCode,
          status: 'PENDING'
        }
      });
    } catch {
      await prisma.$executeRawUnsafe(
        'INSERT INTO "GiveawayEntry" ("id", "gameId", "userId", "code", "status", "createdAt") VALUES ($1, $2, $3, $4, \'PENDING\', NOW())',
        entryId,
        game.id,
        userId,
        fourDigitCode
      );
      createdEntry = { 
        id: entryId, 
        gameId: game.id, 
        userId, 
        code: fourDigitCode, 
        status: 'PENDING', 
        createdAt: new Date() 
      };
    }

    // Count updated totals
    let totalEntries = 0;
    try {
      totalEntries = await (prisma as any).giveawayEntry.count({
        where: { gameId: game.id }
      });
    } catch {
      const rawCount: any = await prisma.$queryRawUnsafe(
        'SELECT COUNT(*)::int as count FROM "GiveawayEntry" WHERE "gameId" = $1',
        game.id
      );
      totalEntries = rawCount?.[0]?.count ? parseInt(rawCount[0].count, 10) : 1;
    }

    // Emit live socket update
    getIO()?.emit('giveaway_updated', {
      giveawayId: game.id,
      totalEntries
    });

    res.status(201).json({
      success: true,
      code: fourDigitCode,
      status: 'PENDING',
      message: 'Please send this 4-digit code in Instagram DM to verify your follow!',
      entry: createdEntry,
      totalEntries
    });
  } catch (error: any) {
    console.error('Error entering giveaway:', error);
    res.status(500).json({ error: error.message || 'Failed to enter giveaway' });
  }
});

// GET /api/giveaways/admin/:id/entries
// Admin endpoint to view all participants for a giveaway (including 4-digit codes & approval status)
router.get('/admin/:id/entries', authMiddleware, isAdminMiddleware, async (req, res) => {
  try {
    await ensureGiveawayTable();
    const { id } = req.params;

    const game = await prisma.game.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isGiveaway: true
      }
    });

    if (!game) {
      return res.status(404).json({ error: 'Giveaway not found' });
    }

    let entries: any[] = [];
    try {
      entries = await (prisma as any).giveawayEntry.findMany({
        where: { gameId: game.id },
        include: {
          user: {
            select: { id: true, username: true, email: true, createdAt: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch {
      const rawEntries: any = await prisma.$queryRawUnsafe(
        `SELECT e.id, e."gameId", e."userId", e.code, e.status, e."createdAt", u.username, u.email 
         FROM "GiveawayEntry" e 
         JOIN "User" u ON e."userId" = u.id 
         WHERE e."gameId" = $1 
         ORDER BY e."createdAt" DESC`,
        game.id
      );
      entries = (rawEntries || []).map((r: any) => ({
        id: r.id,
        gameId: r.gameId,
        userId: r.userId,
        code: r.code,
        status: r.status || 'PENDING',
        createdAt: r.createdAt,
        user: { id: r.userId, username: r.username, email: r.email }
      }));
    }

    const approvedCount = entries.filter(e => e.status === 'APPROVED').length;
    const pendingCount = entries.filter(e => e.status !== 'APPROVED').length;

    res.json({
      giveawayId: game.id,
      title: game.title,
      totalEntries: entries.length,
      approvedEntries: approvedCount,
      pendingEntries: pendingCount,
      entries
    });
  } catch (error: any) {
    console.error('Error fetching admin giveaway entries:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch entries' });
  }
});

// POST /api/giveaways/admin/:id/approve-code
// Admin enters or pastes the 4-digit code sent by the user in Instagram DM to approve their entry
router.post('/admin/:id/approve-code', authMiddleware, isAdminMiddleware, async (req, res) => {
  try {
    await ensureGiveawayTable();
    const { id } = req.params;
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Please enter a valid 4-digit code' });
    }

    const trimmedCode = code.trim();

    const game = await prisma.game.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isGiveaway: true
      }
    });

    if (!game) {
      return res.status(404).json({ error: 'Giveaway not found' });
    }

    // Find the entry with this code for this giveaway
    let entry: any = null;
    try {
      entry = await (prisma as any).giveawayEntry.findFirst({
        where: {
          gameId: game.id,
          code: trimmedCode
        },
        include: {
          user: {
            select: { id: true, username: true, email: true }
          }
        }
      });
    } catch {
      const raw: any = await prisma.$queryRawUnsafe(
        `SELECT e.id, e."gameId", e."userId", e.code, e.status, e."createdAt", u.username, u.email 
         FROM "GiveawayEntry" e 
         JOIN "User" u ON e."userId" = u.id 
         WHERE e."gameId" = $1 AND e.code = $2 
         LIMIT 1`,
        game.id,
        trimmedCode
      );
      if (raw && raw[0]) {
        entry = {
          id: raw[0].id,
          gameId: raw[0].gameId,
          userId: raw[0].userId,
          code: raw[0].code,
          status: raw[0].status,
          user: { id: raw[0].userId, username: raw[0].username, email: raw[0].email }
        };
      }
    }

    if (!entry) {
      return res.status(404).json({ error: `No entry found with code "${trimmedCode}" for this giveaway.` });
    }

    if (entry.status === 'APPROVED') {
      return res.status(400).json({ 
        error: `Participant @${entry.user?.username || 'User'} (Code: ${trimmedCode}) is already approved!` 
      });
    }

    // Update entry status to APPROVED
    try {
      await (prisma as any).giveawayEntry.update({
        where: { id: entry.id },
        data: { status: 'APPROVED' }
      });
    } catch {
      await prisma.$executeRawUnsafe(
        'UPDATE "GiveawayEntry" SET status = \'APPROVED\' WHERE id = $1',
        entry.id
      );
    }

    entry.status = 'APPROVED';

    // Notify connected clients via WebSocket in real-time
    getIO()?.emit('giveaway_entry_approved', {
      giveawayId: game.id,
      userId: entry.userId,
      entryId: entry.id,
      code: trimmedCode,
      username: entry.user?.username
    });

    getIO()?.emit('giveaway_updated', {
      giveawayId: game.id
    });

    res.json({
      success: true,
      message: `Successfully verified and approved @${entry.user?.username || 'User'} (Code: ${trimmedCode})! 🎉`,
      entry
    });
  } catch (error: any) {
    console.error('Error approving giveaway code:', error);
    res.status(500).json({ error: error.message || 'Failed to approve code' });
  }
});

// POST /api/giveaways/admin/entries/:entryId/approve
// Admin directly clicks Approve on a participant row in the modal
router.post('/admin/entries/:entryId/approve', authMiddleware, isAdminMiddleware, async (req, res) => {
  try {
    await ensureGiveawayTable();
    const { entryId } = req.params;

    let entry: any = null;
    try {
      entry = await (prisma as any).giveawayEntry.findUnique({
        where: { id: entryId },
        include: {
          user: { select: { id: true, username: true, email: true } }
        }
      });
    } catch {
      const raw: any = await prisma.$queryRawUnsafe(
        `SELECT e.id, e."gameId", e."userId", e.code, e.status, u.username, u.email 
         FROM "GiveawayEntry" e 
         JOIN "User" u ON e."userId" = u.id 
         WHERE e.id = $1 LIMIT 1`,
        entryId
      );
      if (raw && raw[0]) {
        entry = {
          id: raw[0].id,
          gameId: raw[0].gameId,
          userId: raw[0].userId,
          code: raw[0].code,
          status: raw[0].status,
          user: { id: raw[0].userId, username: raw[0].username, email: raw[0].email }
        };
      }
    }

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Update status to APPROVED
    try {
      await (prisma as any).giveawayEntry.update({
        where: { id: entry.id },
        data: { status: 'APPROVED' }
      });
    } catch {
      await prisma.$executeRawUnsafe(
        'UPDATE "GiveawayEntry" SET status = \'APPROVED\' WHERE id = $1',
        entry.id
      );
    }

    entry.status = 'APPROVED';

    getIO()?.emit('giveaway_entry_approved', {
      giveawayId: entry.gameId,
      userId: entry.userId,
      entryId: entry.id,
      code: entry.code,
      username: entry.user?.username
    });

    getIO()?.emit('giveaway_updated', {
      giveawayId: entry.gameId
    });

    res.json({
      success: true,
      message: `Approved participant @${entry.user?.username || 'User'}!`,
      entry
    });
  } catch (error: any) {
    console.error('Error approving entry by id:', error);
    res.status(500).json({ error: error.message || 'Failed to approve entry' });
  }
});

// POST /api/giveaways/admin/entries/:entryId/revoke
// Admin revokes an approved entry back to PENDING (e.g. if user unfollowed on Instagram)
router.post('/admin/entries/:entryId/revoke', authMiddleware, isAdminMiddleware, async (req, res) => {
  try {
    await ensureGiveawayTable();
    const { entryId } = req.params;

    let entry: any = null;
    try {
      entry = await (prisma as any).giveawayEntry.findUnique({
        where: { id: entryId },
        include: {
          user: { select: { id: true, username: true, email: true } }
        }
      });
    } catch {
      const raw: any = await prisma.$queryRawUnsafe(
        `SELECT e.id, e."gameId", e."userId", e.code, e.status, u.username, u.email 
         FROM "GiveawayEntry" e 
         JOIN "User" u ON e."userId" = u.id 
         WHERE e.id = $1 LIMIT 1`,
        entryId
      );
      if (raw && raw[0]) {
        entry = {
          id: raw[0].id,
          gameId: raw[0].gameId,
          userId: raw[0].userId,
          code: raw[0].code,
          status: raw[0].status,
          user: { id: raw[0].userId, username: raw[0].username, email: raw[0].email }
        };
      }
    }

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Update status to PENDING
    try {
      await (prisma as any).giveawayEntry.update({
        where: { id: entry.id },
        data: { status: 'PENDING' }
      });
    } catch {
      await prisma.$executeRawUnsafe(
        'UPDATE "GiveawayEntry" SET status = \'PENDING\' WHERE id = $1',
        entry.id
      );
    }

    entry.status = 'PENDING';

    getIO()?.emit('giveaway_entry_revoked', {
      giveawayId: entry.gameId,
      userId: entry.userId,
      entryId: entry.id,
      code: entry.code,
      username: entry.user?.username
    });

    getIO()?.emit('giveaway_updated', {
      giveawayId: entry.gameId
    });

    res.json({
      success: true,
      message: `Revoked entry for @${entry.user?.username || 'User'} back to Pending!`,
      entry
    });
  } catch (error: any) {
    console.error('Error revoking entry by id:', error);
    res.status(500).json({ error: error.message || 'Failed to revoke entry' });
  }
});

// POST /api/giveaways/admin/:id/draw-winner
// Admin picks a random winner from APPROVED participants only
router.post('/admin/:id/draw-winner', authMiddleware, isAdminMiddleware, async (req, res) => {
  try {
    await ensureGiveawayTable();
    const { id } = req.params;

    const game = await prisma.game.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isGiveaway: true
      }
    });

    if (!game) {
      return res.status(404).json({ error: 'Giveaway not found' });
    }

    // Fetch ONLY APPROVED entries
    let approvedEntries: any[] = [];
    try {
      approvedEntries = await (prisma as any).giveawayEntry.findMany({
        where: { 
          gameId: game.id,
          status: 'APPROVED'
        },
        include: {
          user: {
            select: { id: true, username: true, email: true }
          }
        }
      });
    } catch {
      const rawEntries: any = await prisma.$queryRawUnsafe(
        `SELECT e.id, e."userId", e.code, e.status, u.username, u.email 
         FROM "GiveawayEntry" e 
         JOIN "User" u ON e."userId" = u.id 
         WHERE e."gameId" = $1 AND e.status = 'APPROVED'`,
        game.id
      );
      approvedEntries = (rawEntries || []).map((r: any) => ({
        id: r.id,
        user: { id: r.userId, username: r.username, email: r.email },
        code: r.code
      }));
    }

    if (approvedEntries.length === 0) {
      return res.status(400).json({ 
        error: 'No approved participants found for this giveaway! Please verify participants who sent their 4-digit code in Instagram DM and click "Approve" first.' 
      });
    }

    // Pick a random winner from approved participants
    const randomIndex = Math.floor(Math.random() * approvedEntries.length);
    const selectedWinnerEntry = approvedEntries[randomIndex];

    const winnerInfo = {
      entryId: selectedWinnerEntry.id,
      userId: selectedWinnerEntry.user.id,
      username: selectedWinnerEntry.user.username,
      email: selectedWinnerEntry.user.email,
      code: selectedWinnerEntry.code || null,
      wonAt: new Date().toISOString()
    };

    // Store winner inside game.giveawayRules JSON
    let existingConfig: any = {};
    try {
      if (game.giveawayRules) {
        existingConfig = JSON.parse(game.giveawayRules);
      }
    } catch {
      existingConfig = { rules: game.giveawayRules };
    }

    existingConfig.winner = winnerInfo;

    await prisma.game.update({
      where: { id: game.id },
      data: {
        giveawayRules: JSON.stringify(existingConfig)
      }
    });

    // Notify clients in real-time
    getIO()?.emit('giveaway_updated', {
      giveawayId: game.id,
      winner: winnerInfo
    });

    res.json({
      success: true,
      message: `Winner selected: ${winnerInfo.username}! (Code: ${winnerInfo.code || 'N/A'})`,
      winner: winnerInfo
    });
  } catch (error: any) {
    console.error('Error drawing giveaway winner:', error);
    res.status(500).json({ error: error.message || 'Failed to draw winner' });
  }
});

export default router;
