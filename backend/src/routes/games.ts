import { Router } from 'express';
import { prisma } from '../prismaClient';
import { authMiddleware, isAdminMiddleware } from '../middleware/auth';
import { getIO } from '../socket';
import { recordSlugHistory, getGameIdFromSlugHistory, removeSlugFromHistory } from '../services/slugHistory.service';

const router = Router();

const generateSlug = async (title: string, excludeId?: string): Promise<string> => {
  const baseSlug = (title || 'untitled').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  const safeSlug = baseSlug || 'game';
  let slug = safeSlug;
  let counter = 1;
  while (await prisma.game.findFirst({ where: { slug, id: { not: excludeId } } })) {
    slug = `${safeSlug}-${counter}`;
    counter++;
  }
  return slug;
};

// Get all games (ordered by custom position first, then createdAt)
router.get('/', async (req, res) => {
  try {
    const games = await prisma.game.findMany({
      where: { isPublished: true },
      orderBy: [
        { position: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    
    // Sanitize: remove internalCost
    const publicGames = games.map(g => {
      const { internalCost, ...rest } = g as any;
      return rest;
    });
    
    res.json(publicGames);
  } catch (error) {
    console.error('[GET /api/games] ERROR:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// Get all games for Admin (includes internalCost)
router.get('/admin', authMiddleware, isAdminMiddleware, async (req, res) => {
  try {
    const games = await prisma.game.findMany({
      orderBy: [
        { position: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    res.json(games);
  } catch (error) {
    console.error('[GET /api/games/admin] ERROR:', error);
    res.status(500).json({ error: 'Failed to fetch games for admin' });
  }
});

// Reorder games (Admin only)
router.put('/reorder', authMiddleware, isAdminMiddleware, async (req, res) => {
  try {
    const { gameIds } = req.body; // Array of IDs in new order: ["id1", "id2", ...]
    if (!Array.isArray(gameIds)) {
      res.status(400).json({ error: 'gameIds array is required' });
      return;
    }

    // Update position of each game in batch transaction
    const updatePromises = gameIds.map((id, index) =>
      prisma.game.update({
        where: { id },
        data: { position: index }
      })
    );

    await prisma.$transaction(updatePromises);
    getIO()?.emit('games_updated');

    res.json({ success: true, message: 'Games order updated successfully' });
  } catch (error: any) {
    console.error('[REORDER GAMES ERROR]:', error);
    res.status(500).json({ error: error.message || 'Failed to reorder games' });
  }
});


// Stable pseudo-random base counts between 10-250 for each game ID
const getBaseReactions = (gameId: string) => {
  let hash = 0;
  for (let i = 0; i < gameId.length; i++) {
    hash = (hash * 31 + gameId.charCodeAt(i)) & 0xffffffff;
  }
  const positiveHash = Math.abs(hash);
  // Base likes between 40 and 245
  const baseLikes = 40 + (positiveHash % 206);
  // Base dislikes between 10 and 65
  const baseDislikes = 10 + ((positiveHash >> 3) % 56);
  return { baseLikes, baseDislikes };
};

// Get a single game (including base + real like/dislike counts and user reaction)
router.get('/:id', async (req, res) => {
  try {
    const paramId = req.params.id as string;
    let game = await prisma.game.findFirst({
      where: { 
        isPublished: true,
        OR: [
          { id: paramId },
          { slug: { equals: paramId, mode: 'insensitive' } }
        ]
      }
    });

    if (!game) {
      const historicalId = getGameIdFromSlugHistory(paramId);
      if (historicalId) {
        game = await prisma.game.findFirst({
          where: {
            id: historicalId,
            isPublished: true
          }
        });
      }
    }

    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    const [likesCount, dislikesCount] = await Promise.all([
      prisma.gameReaction.count({ where: { gameId: game.id, type: 'LIKE' } }),
      prisma.gameReaction.count({ where: { gameId: game.id, type: 'DISLIKE' } }),
    ]);

    const { baseLikes, baseDislikes } = getBaseReactions(game.id);

    // Sanitize: remove internalCost
    const { internalCost, ...publicGame } = game as any;

    res.json({
      ...publicGame,
      likesCount: baseLikes + likesCount,
      dislikesCount: baseDislikes + dislikesCount
    });
  } catch (error) {
    console.error('[GET /:id ERROR]:', error);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

// Get user reaction for a game
router.get('/:id/reaction', authMiddleware, async (req, res) => {
  try {
    const gameId = req.params.id as string;
    const userPayload = (req as any).user;
    const { baseLikes, baseDislikes } = getBaseReactions(gameId);

    if (!userPayload.userId) {
      res.json({ reaction: null, likesCount: baseLikes, dislikesCount: baseDislikes });
      return;
    }

    const userReaction = await prisma.gameReaction.findUnique({
      where: {
        userId_gameId: {
          userId: userPayload.userId,
          gameId
        }
      }
    });

    const [likesCount, dislikesCount] = await Promise.all([
      prisma.gameReaction.count({ where: { gameId, type: 'LIKE' } }),
      prisma.gameReaction.count({ where: { gameId, type: 'DISLIKE' } }),
    ]);

    res.json({
      userReaction: userReaction ? userReaction.type : null,
      likesCount: baseLikes + likesCount,
      dislikesCount: baseDislikes + dislikesCount
    });
  } catch (error) {
    console.error('[GET REACTION ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch reaction' });
  }
});

// Toggle Like / Dislike reaction on a game
router.post('/:id/react', authMiddleware, async (req, res) => {
  try {
    const gameId = req.params.id as string;
    const userPayload = (req as any).user;
    if (!userPayload.userId) {
      res.status(401).json({ error: 'Only logged-in users can like or dislike games' });
      return;
    }

    const { type } = req.body; // "LIKE" or "DISLIKE"
    if (!['LIKE', 'DISLIKE'].includes(type)) {
      res.status(400).json({ error: 'Reaction type must be LIKE or DISLIKE' });
      return;
    }

    const existing = await prisma.gameReaction.findUnique({
      where: {
        userId_gameId: {
          userId: userPayload.userId,
          gameId
        }
      }
    });

    if (existing) {
      if (existing.type === type) {
        // Clicking same button again removes reaction (toggle off)
        await prisma.gameReaction.delete({
          where: { id: existing.id }
        });
      } else {
        // Switch between LIKE and DISLIKE
        await prisma.gameReaction.update({
          where: { id: existing.id },
          data: { type }
        });
      }
    } else {
      // Create new reaction
      await prisma.gameReaction.create({
        data: {
          userId: userPayload.userId,
          gameId,
          type
        }
      });
    }

    const [likesCount, dislikesCount, currentReaction] = await Promise.all([
      prisma.gameReaction.count({ where: { gameId, type: 'LIKE' } }),
      prisma.gameReaction.count({ where: { gameId, type: 'DISLIKE' } }),
      prisma.gameReaction.findUnique({
        where: {
          userId_gameId: {
            userId: userPayload.userId,
            gameId
          }
        }
      })
    ]);

    const { baseLikes, baseDislikes } = getBaseReactions(gameId);

    getIO()?.emit('games_updated');
    res.json({
      success: true,
      userReaction: currentReaction ? currentReaction.type : null,
      likesCount: baseLikes + likesCount,
      dislikesCount: baseDislikes + dislikesCount
    });
  } catch (error: any) {
    console.error('[REACT GAME ERROR]', error);
    res.status(500).json({ error: error.message || 'Failed to react to game' });
  }
});



// Create a new game
router.post('/', authMiddleware, isAdminMiddleware, async (req, res) => {
  try {
    const allowedFields = [
      'title', 'slug', 'developer', 'rating', 'genre', 'price', 'coverImage', 'releaseDate',
      'platforms', 'isRentable', 'outOfStock', 'isGiveaway', 'giveawayRules',
      'isBundle', 'bundleGames', 'description', 'rentPrice', 'rentDurationDays',
      'rentRules', 'minRequirements', 'recRequirements', 'trailerUrl', 'screenshots',
      'tagImage', 'steamAppId', 'steamPrice', 'internalCost', 'creatorAccess', 'isPublished'
    ];
    const gameData: any = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        gameData[field] = req.body[field];
      }
    }
    // ensure numeric fields are numbers
    gameData.rating = parseFloat(gameData.rating) || 0;
    gameData.price = parseFloat(gameData.price) || 0;
    gameData.discount = 0;
    
    if (gameData.steamPrice !== undefined) {
      if (gameData.steamPrice === null || gameData.steamPrice === '') {
        gameData.steamPrice = null;
      } else {
        gameData.steamPrice = parseFloat(gameData.steamPrice);
      }
    }
    
    if (gameData.internalCost !== undefined) {
      const userPayload = (req as any).user;
      if (!userPayload.userId) {
        if (gameData.internalCost === null || gameData.internalCost === '') {
          gameData.internalCost = null;
        } else {
          gameData.internalCost = parseFloat(gameData.internalCost);
        }
      } else {
        delete gameData.internalCost;
      }
    }
    
    gameData.isGiveaway = gameData.isGiveaway === true || gameData.isGiveaway === 'true';
    if (gameData.giveawayRules === undefined || gameData.giveawayRules === null) {
      gameData.giveawayRules = null;
    }
    gameData.isBundle = gameData.isBundle === true || gameData.isBundle === 'true';
    if (gameData.bundleGames !== undefined) {
      gameData.bundleGames = gameData.bundleGames || null;
    }
    if (gameData.description !== undefined) {
      gameData.description = gameData.description || null;
    }
    gameData.creatorAccess = gameData.creatorAccess === true || gameData.creatorAccess === 'true';
    if (gameData.isPublished !== undefined) {
      gameData.isPublished = gameData.isPublished === true || gameData.isPublished === 'true';
    }
    
    // Slug generation
    if (gameData.slug && typeof gameData.slug === 'string') {
      const customSlug = gameData.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (customSlug) {
        const existing = await prisma.game.findFirst({ where: { slug: customSlug } });
        if (!existing) {
          gameData.slug = customSlug;
        } else {
          gameData.slug = await generateSlug(customSlug);
        }
      } else {
        gameData.slug = await generateSlug(gameData.title);
      }
    } else {
      gameData.slug = await generateSlug(gameData.title);
    }

    gameData.isRentable = gameData.isRentable === true || gameData.isRentable === 'true';
    if (gameData.rentPrice !== undefined && gameData.rentPrice !== null && gameData.rentPrice !== '') {
      gameData.rentPrice = parseFloat(gameData.rentPrice);
    } else {
      gameData.rentPrice = null;
    }
    if (gameData.rentDurationDays !== undefined && gameData.rentDurationDays !== null && gameData.rentDurationDays !== '') {
      gameData.rentDurationDays = parseInt(gameData.rentDurationDays, 10) || 7;
    } else {
      gameData.rentDurationDays = null;
    }
    
    if (Array.isArray(gameData.platforms)) {
       gameData.platforms = gameData.platforms.join(', ');
    }

    if (gameData.isBundle && gameData.bundleGames) {
      const selectedList = gameData.bundleGames.split(/[,+]/).map((s: string) => s.trim()).filter(Boolean);
      const matchedGames = await prisma.game.findMany({
        where: { OR: [{ id: { in: selectedList } }, { title: { in: selectedList } }] }
      });
      let totalSteamPrice = 0;
      for (const matched of matchedGames) {
        if (matched.steamPrice) totalSteamPrice += matched.steamPrice;
      }
      gameData.steamPrice = totalSteamPrice > 0 ? totalSteamPrice : null;
    }

    if (gameData.isPublished) {
      if (typeof gameData.price !== 'number' || !Number.isFinite(gameData.price) || gameData.price <= 0) {
        res.status(400).json({ error: 'Add selling price to publish game.' });
        return;
      }
    }

    const game = await prisma.game.create({
      data: gameData,
    });
    getIO()?.emit('games_updated');
    res.status(201).json(game);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// Update a game
router.put('/:id', authMiddleware, isAdminMiddleware, async (req, res) => {
  const reqId = Date.now();
  const targetGameId = req.params.id as string;
  console.log(`[UPDATE GAME/BUNDLE ${reqId}] request received for ${targetGameId}`);
  console.time(`[UPDATE GAME/BUNDLE ${reqId}] total`);
  console.time(`[UPDATE GAME/BUNDLE ${reqId}] auth+validation`);
  try {
    const allowedFields = [
      'title', 'slug', 'developer', 'rating', 'genre', 'price', 'coverImage', 'releaseDate',
      'platforms', 'isRentable', 'outOfStock', 'isGiveaway', 'giveawayRules',
      'isBundle', 'bundleGames', 'description', 'rentPrice', 'rentDurationDays',
      'rentRules', 'minRequirements', 'recRequirements', 'trailerUrl', 'screenshots',
      'tagImage', 'steamAppId', 'steamPrice', 'internalCost', 'creatorAccess', 'isPublished'
    ];
    const gameData: any = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        gameData[field] = req.body[field];
      }
    }
    if (gameData.rating !== undefined) gameData.rating = parseFloat(gameData.rating) || 0;
    if (gameData.price !== undefined) gameData.price = parseFloat(gameData.price) || 0;
    gameData.discount = 0;

    if (gameData.steamPrice !== undefined) {
      if (gameData.steamPrice === null || gameData.steamPrice === '') {
        gameData.steamPrice = null;
      } else {
        gameData.steamPrice = parseFloat(gameData.steamPrice);
      }
    }

    if (gameData.internalCost !== undefined) {
      const userPayload = (req as any).user;
      if (!userPayload.userId) {
        if (gameData.internalCost === null || gameData.internalCost === '') {
          gameData.internalCost = null;
        } else {
          gameData.internalCost = parseFloat(gameData.internalCost);
        }
      } else {
        delete gameData.internalCost;
      }
    }

    if (gameData.isGiveaway !== undefined) {
      gameData.isGiveaway = gameData.isGiveaway === true || gameData.isGiveaway === 'true';
    }
    if (gameData.isBundle !== undefined) {
      gameData.isBundle = gameData.isBundle === true || gameData.isBundle === 'true';
    }
    if (gameData.bundleGames !== undefined) {
      gameData.bundleGames = gameData.bundleGames || null;
    }
    if (gameData.description !== undefined) {
      gameData.description = gameData.description || null;
    }
    
    if (gameData.giveawayRules !== undefined && gameData.giveawayRules === '') {
      gameData.giveawayRules = null;
    }

    if (gameData.creatorAccess !== undefined) {
      gameData.creatorAccess = gameData.creatorAccess === true || gameData.creatorAccess === 'true';
    }

    if (gameData.isPublished !== undefined) {
      gameData.isPublished = gameData.isPublished === true || gameData.isPublished === 'true';
    }

    console.timeEnd(`[UPDATE GAME/BUNDLE ${reqId}] auth+validation`);
    console.time(`[UPDATE GAME/BUNDLE ${reqId}] findUnique existing`);

    // Never automatically change an existing slug, but populate it if missing or explicitly updated
    const existingGame = await prisma.game.findUnique({ where: { id: targetGameId } });
    
    console.timeEnd(`[UPDATE GAME/BUNDLE ${reqId}] findUnique existing`);
    console.time(`[UPDATE GAME/BUNDLE ${reqId}] slug generation`);
    
    if (!existingGame) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    if (gameData.slug !== undefined) {
      if (typeof gameData.slug === 'string') {
        const cleanedSlug = gameData.slug
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        if (cleanedSlug) {
          gameData.slug = cleanedSlug;
        } else {
          // If empty string provided, keep existing or generate from title
          gameData.slug = existingGame.slug || await generateSlug(gameData.title || existingGame.title, existingGame.id);
        }
      } else {
        delete gameData.slug;
      }
    }

    if (!existingGame.slug && !gameData.slug && gameData.title) {
      gameData.slug = await generateSlug(gameData.title, existingGame.id);
    }

    if (gameData.slug && gameData.slug !== existingGame.slug) {
      const collision = await prisma.game.findFirst({
        where: {
          slug: gameData.slug,
          id: { not: existingGame.id }
        }
      });
      if (collision) {
        res.status(400).json({ error: 'Slug is already in use by another game' });
        return;
      }
    }
    console.timeEnd(`[UPDATE GAME/BUNDLE ${reqId}] slug generation`);

    if (gameData.isRentable !== undefined) {
      gameData.isRentable = gameData.isRentable === true || gameData.isRentable === 'true';
    }
    
    if (gameData.rentPrice !== undefined) {
      if (gameData.rentPrice === null || gameData.rentPrice === '') {
        gameData.rentPrice = null;
      } else {
        gameData.rentPrice = parseFloat(gameData.rentPrice);
      }
    }
    
    if (gameData.rentDurationDays !== undefined) {
      if (gameData.rentDurationDays === null || gameData.rentDurationDays === '') {
        gameData.rentDurationDays = null;
      } else {
        gameData.rentDurationDays = parseInt(gameData.rentDurationDays, 10) || 7;
      }
    }

    if (Array.isArray(gameData.platforms)) {
       gameData.platforms = gameData.platforms.join(', ');
    }

    const finalIsBundle = gameData.isBundle !== undefined ? gameData.isBundle : existingGame.isBundle;
    const finalBundleGames = gameData.bundleGames !== undefined ? gameData.bundleGames : existingGame.bundleGames;
    
    console.time(`[UPDATE GAME/BUNDLE ${reqId}] steam price calc`);
    if (finalIsBundle && finalBundleGames) {
      const selectedList = finalBundleGames.split(/[,+]/).map((s: string) => s.trim()).filter(Boolean);
      const matchedGames = await prisma.game.findMany({
        where: { OR: [{ id: { in: selectedList } }, { title: { in: selectedList } }] }
      });
      let totalSteamPrice = 0;
      for (const matched of matchedGames) {
        if (matched.steamPrice) totalSteamPrice += matched.steamPrice;
      }
      gameData.steamPrice = totalSteamPrice > 0 ? totalSteamPrice : null;
    }
    console.timeEnd(`[UPDATE GAME/BUNDLE ${reqId}] steam price calc`);

    const finalIsPublished = gameData.isPublished !== undefined ? gameData.isPublished : existingGame.isPublished;
    if (finalIsPublished) {
      const finalPrice = gameData.price !== undefined ? gameData.price : existingGame.price;
      if (typeof finalPrice !== 'number' || !Number.isFinite(finalPrice) || finalPrice <= 0) {
        res.status(400).json({ error: 'Add selling price to publish game.' });
        return;
      }
    }

    console.time(`[UPDATE GAME/BUNDLE ${reqId}] database update`);
    const game = await prisma.game.update({
      where: { id: targetGameId },
      data: gameData,
    });
    console.timeEnd(`[UPDATE GAME/BUNDLE ${reqId}] database update`);

    // Record slug history ONLY after successful DB update
    if (existingGame.slug && gameData.slug && existingGame.slug !== gameData.slug) {
      recordSlugHistory(existingGame.slug, existingGame.id);
      removeSlugFromHistory(gameData.slug);
    }

    getIO()?.emit('games_updated');
    console.timeEnd(`[UPDATE GAME/BUNDLE ${reqId}] total`);
    res.json(game);
  } catch (error) {
    console.error('[PUT /:id ERROR]:', error);
    res.status(500).json({ error: 'Failed to update game' });
  }
});

// Delete a game
router.delete('/:id', authMiddleware, isAdminMiddleware, async (req, res) => {
  try {
    const gameId = req.params.id as string;
    
    // Manually delete related items first to avoid foreign key constraint errors
    await prisma.cartItem.deleteMany({ where: { gameId } });
    await prisma.wishlistItem.deleteMany({ where: { gameId } });
    await prisma.orderItem.deleteMany({ where: { gameId } });
    
    // Now delete the game itself
    await prisma.game.delete({
      where: { id: gameId }
    });
    getIO()?.emit('games_updated');
    res.json({ message: 'Game deleted' });
  } catch (error: any) {
    console.error('[DELETE GAME ERROR]', error);
    res.status(500).json({ error: 'Failed to delete game: ' + (error.message || String(error)) });
  }
});

// Export all games backup (JSON)
router.get('/backup/export', authMiddleware, isAdminMiddleware, async (req, res) => {
  try {
    const userPayload = (req as any).user;

    if (userPayload.userId) {
      res.status(403).json({ error: 'Access denied. Admins only.' });
      return;
    }

    const games = await prisma.game.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=valqore_games_backup_${new Date().toISOString().slice(0, 10)}.json`);
    res.json({
      exportedAt: new Date().toISOString(),
      totalGames: games.length,
      games: games
    });
  } catch (error) {
    console.error('[EXPORT GAMES ERROR]', error);
    res.status(500).json({ error: 'Failed to export games backup' });
  }
});

// Import games backup (JSON)
router.post('/backup/import', authMiddleware, isAdminMiddleware, async (req, res) => {
  try {
    const userPayload = (req as any).user;
    if (userPayload.userId) {
      res.status(403).json({ error: 'Access denied. Admins only.' });
      return;
    }

    const { games, mode = 'create-only', preview = false } = req.body;
    if (!Array.isArray(games) || games.length === 0) {
      res.status(400).json({ error: 'Invalid backup format. Expected a "games" array.' });
      return;
    }

    const existingGames = await prisma.game.findMany({ select: { id: true } });
    const existingIds = new Set(existingGames.map((g: any) => g.id));

    const toCreate: any[] = [];
    const toUpdate: any[] = [];
    let skippedCount = 0;

    for (const g of games) {
      const gameData: any = {
        title: g.title || 'Untitled Game',
        developer: g.developer || 'Unknown',
        rating: typeof g.rating === 'number' ? g.rating : parseFloat(g.rating) || 0,
        genre: g.genre || 'Action',
        price: typeof g.price === 'number' ? g.price : parseFloat(g.price) || 0,
        discount: typeof g.discount === 'number' ? g.discount : parseFloat(g.discount) || 0,
        coverImage: g.coverImage || '',
        releaseDate: g.releaseDate || new Date().toISOString().slice(0, 10),
        platforms: g.platforms || 'PC',
        isRentable: Boolean(g.isRentable),
        outOfStock: Boolean(g.outOfStock),
        isGiveaway: Boolean(g.isGiveaway),
        giveawayRules: g.giveawayRules || null,
        isBundle: Boolean(g.isBundle),
        bundleGames: g.bundleGames || null,
        description: g.description || null,
        rentPrice: g.rentPrice !== undefined && g.rentPrice !== null ? parseFloat(g.rentPrice) : null,
        rentDurationDays: g.rentDurationDays ? parseInt(g.rentDurationDays, 10) : 7,
        rentRules: g.rentRules || null,
        minRequirements: g.minRequirements || null,
        recRequirements: g.recRequirements || null,
        trailerUrl: g.trailerUrl || null,
        screenshots: g.screenshots || null,
        tagImage: g.tagImage || null,
        steamAppId: g.steamAppId || null,
        steamPrice: g.steamPrice !== undefined && g.steamPrice !== null ? parseFloat(g.steamPrice) : null,
        internalCost: g.internalCost !== undefined && g.internalCost !== null ? parseFloat(g.internalCost) : null,
      };

      if (g.slug !== undefined) gameData.slug = g.slug;
      if (g.isPublished !== undefined) gameData.isPublished = Boolean(g.isPublished);
      if (g.creatorAccess !== undefined) gameData.creatorAccess = Boolean(g.creatorAccess);
      if (g.position !== undefined) gameData.position = parseInt(g.position, 10) || 0;

      const exists = g.id && existingIds.has(g.id);

      if (exists) {
        if (mode === 'create-only') {
          skippedCount++;
        } else {
          toUpdate.push({ id: g.id, data: gameData });
        }
      } else {
        if (g.id) gameData.id = g.id;
        toCreate.push(gameData);
      }
    }

    if (preview) {
      res.json({
        preview: true,
        createCount: toCreate.length,
        updateCount: toUpdate.length,
        skipCount: skippedCount
      });
      return;
    }

    await prisma.$transaction(async (tx) => {
      for (const update of toUpdate) {
        await tx.game.update({
          where: { id: update.id },
          data: update.data
        });
      }
      if (toCreate.length > 0) {
        await tx.game.createMany({
          data: toCreate
        });
      }
    });

    getIO()?.emit('games_updated');
    res.json({ 
      message: `Successfully processed backup! Created: ${toCreate.length}, Updated: ${toUpdate.length}, Skipped: ${skippedCount}`,
      createCount: toCreate.length,
      updateCount: toUpdate.length,
      skipCount: skippedCount
    });
  } catch (error: any) {
    console.error('[IMPORT GAMES ERROR]', error);
    res.status(500).json({ error: 'Failed to import games: ' + (error.message || String(error)) });
  }
});

const escapeHtml = (unsafe: string) => {
  return (unsafe || '').toString().replace(/[&<"'>]/g, (match) => {
    const escapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return escapeMap[match];
  });
};

// Server-side meta tag endpoint for social preview crawlers (WhatsApp, Instagram, Twitter, Discord, Facebook)
router.get('/share-meta/:identifier', async (req, res) => {
  try {
    const identifier = (req.params.identifier || '').trim();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const slugRegex = /^[a-z0-9_-]+$/i;
    
    if (!uuidRegex.test(identifier) && !slugRegex.test(identifier)) {
      res.status(400).send('Invalid Game Identifier');
      return;
    }

    let game = await prisma.game.findFirst({
      where: {
        isPublished: true,
        OR: [
          { id: identifier },
          { slug: { equals: identifier, mode: 'insensitive' } }
        ]
      }
    });

    if (!game) {
      const historicalId = getGameIdFromSlugHistory(identifier);
      if (historicalId) {
        game = await prisma.game.findFirst({
          where: {
            id: historicalId,
            isPublished: true
          }
        });
      }
    }

    const fallbackImage = 'https://valqore.pro/images/hero-artwork.png';
    let posterImage = fallbackImage;

    if (game?.coverImage) {
      if (game.coverImage.startsWith('http://') || game.coverImage.startsWith('https://')) {
        posterImage = game.coverImage;
      } else {
        posterImage = `https://valqore.pro${game.coverImage.startsWith('/') ? '' : '/'}${game.coverImage}`;
      }
    }

    const rawTitle = game ? `${game.title} | VALQORE` : 'VALQORE';
    const title = escapeHtml(rawTitle);
    const displayTitle = escapeHtml(game ? game.title : 'VALQORE');

    // Generate Open Graph description from current database values
    let rawDescription = 'Discover top digital PC & console games, exclusive giveaways, verified game accounts, and instant delivery on VALQORE.';
    if (game?.description && game.description.trim()) {
      const cleanDesc = game.description.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
      if (cleanDesc.length > 0) {
        rawDescription = cleanDesc.length > 300 ? cleanDesc.slice(0, 297) + '...' : cleanDesc;
      }
    } else if (game?.title) {
      rawDescription = `Check out ${game.title} on VALQORE! Instant digital delivery, verified game accounts, and 24/7 dedicated support.`;
    }
    const description = escapeHtml(rawDescription);

    const canonicalGameUrl = `https://valqore.pro/game/${escapeHtml(game?.slug || identifier)}`;
    const safePosterImage = escapeHtml(posterImage);

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <link rel="canonical" href="${canonicalGameUrl}" />
  <meta name="description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="VALQORE" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${safePosterImage}" />
  <meta property="og:image:secure_url" content="${safePosterImage}" />
  <meta property="og:image:alt" content="${displayTitle}" />
  <meta property="og:url" content="${canonicalGameUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${safePosterImage}" />
  <meta http-equiv="refresh" content="0;url=${canonicalGameUrl}" />
  <script>window.location.replace("${canonicalGameUrl}");</script>
</head>
<body style="background:#050505;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <p>Redirecting to <a href="${canonicalGameUrl}" style="color:#DCF836;">${title}</a>...</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.send(html);
  } catch (error) {
    console.error('[SHARE META ERROR]:', error);
    res.redirect(`https://valqore.pro/game/${escapeHtml(req.params.identifier)}`);
  }
});

export default router;

