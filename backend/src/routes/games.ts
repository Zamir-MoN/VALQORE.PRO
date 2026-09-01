import { Router } from 'express';
import { prisma } from '../prismaClient';
import { authMiddleware } from '../middleware/auth';
import { getIO } from '../socket';

const router = Router();

// Get all games
router.get('/', async (req, res) => {
  try {
    const games = await prisma.game.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(games);
  } catch (error) {
    console.error('[GET /api/games] ERROR:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// Get a single game (including real like/dislike counts and user reaction)
router.get('/:id', async (req, res) => {
  try {
    const game = await prisma.game.findUnique({
      where: { id: req.params.id }
    });
    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    const [likesCount, dislikesCount] = await Promise.all([
      prisma.gameReaction.count({ where: { gameId: req.params.id, type: 'LIKE' } }),
      prisma.gameReaction.count({ where: { gameId: req.params.id, type: 'DISLIKE' } }),
    ]);

    res.json({
      ...game,
      likesCount,
      dislikesCount
    });
  } catch (error) {
    console.error('[GET /:id ERROR]:', error);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

// Get user reaction for a game
router.get('/:id/reaction', authMiddleware, async (req, res) => {
  try {
    const userPayload = (req as any).user;
    if (!userPayload.userId) {
      res.json({ reaction: null });
      return;
    }

    const userReaction = await prisma.gameReaction.findUnique({
      where: {
        userId_gameId: {
          userId: userPayload.userId,
          gameId: req.params.id
        }
      }
    });

    const [likesCount, dislikesCount] = await Promise.all([
      prisma.gameReaction.count({ where: { gameId: req.params.id, type: 'LIKE' } }),
      prisma.gameReaction.count({ where: { gameId: req.params.id, type: 'DISLIKE' } }),
    ]);

    res.json({
      userReaction: userReaction ? userReaction.type : null,
      likesCount,
      dislikesCount
    });
  } catch (error) {
    console.error('[GET REACTION ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch reaction' });
  }
});

// Toggle Like / Dislike reaction on a game
router.post('/:id/react', authMiddleware, async (req, res) => {
  try {
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
          gameId: req.params.id
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
          gameId: req.params.id,
          type
        }
      });
    }

    const [likesCount, dislikesCount, currentReaction] = await Promise.all([
      prisma.gameReaction.count({ where: { gameId: req.params.id, type: 'LIKE' } }),
      prisma.gameReaction.count({ where: { gameId: req.params.id, type: 'DISLIKE' } }),
      prisma.gameReaction.findUnique({
        where: {
          userId_gameId: {
            userId: userPayload.userId,
            gameId: req.params.id
          }
        }
      })
    ]);

    getIO()?.emit('games_updated');
    res.json({
      success: true,
      userReaction: currentReaction ? currentReaction.type : null,
      likesCount,
      dislikesCount
    });
  } catch (error: any) {
    console.error('[REACT GAME ERROR]', error);
    res.status(500).json({ error: error.message || 'Failed to react to game' });
  }
});


// Create a new game
router.post('/', authMiddleware, async (req, res) => {
  try {
    const gameData = req.body;
    // ensure numeric fields are numbers
    gameData.rating = parseFloat(gameData.rating) || 0;
    gameData.price = parseFloat(gameData.price) || 0;
    gameData.discount = parseFloat(gameData.discount) || 0;
    
    gameData.isGiveaway = gameData.isGiveaway === true || gameData.isGiveaway === 'true';
    if (gameData.giveawayRules === undefined || gameData.giveawayRules === null) {
      gameData.giveawayRules = null;
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
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const gameData = req.body;
    if (gameData.rating !== undefined) gameData.rating = parseFloat(gameData.rating) || 0;
    if (gameData.price !== undefined) gameData.price = parseFloat(gameData.price) || 0;
    if (gameData.discount !== undefined) gameData.discount = parseFloat(gameData.discount) || 0;

    if (gameData.isGiveaway !== undefined) {
      gameData.isGiveaway = gameData.isGiveaway === true || gameData.isGiveaway === 'true';
    }
    
    if (gameData.giveawayRules !== undefined && gameData.giveawayRules === '') {
      gameData.giveawayRules = null;
    }

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

    const game = await prisma.game.update({
      where: { id: req.params.id },
      data: gameData,
    });
    getIO()?.emit('games_updated');
    res.json(game);
  } catch (error) {
    console.error('[PUT /:id ERROR]:', error);
    res.status(500).json({ error: 'Failed to update game' });
  }
});

// Delete a game
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const gameId = req.params.id;
    
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
router.get('/backup/export', authMiddleware, async (req, res) => {
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
router.post('/backup/import', authMiddleware, async (req, res) => {
  try {
    const userPayload = (req as any).user;
    if (userPayload.userId) {
      res.status(403).json({ error: 'Access denied. Admins only.' });
      return;
    }

    const { games } = req.body;
    if (!Array.isArray(games) || games.length === 0) {
      res.status(400).json({ error: 'Invalid backup format. Expected a "games" array.' });
      return;
    }

    let importedCount = 0;
    for (const g of games) {
      // Clean up relations and fields for insertion/upsertion
      const gameData = {
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
        rentPrice: g.rentPrice !== undefined && g.rentPrice !== null ? parseFloat(g.rentPrice) : null,
        rentDurationDays: g.rentDurationDays ? parseInt(g.rentDurationDays, 10) : 7,
        rentRules: g.rentRules || null,
        minRequirements: g.minRequirements || null,
        recRequirements: g.recRequirements || null,
        trailerUrl: g.trailerUrl || null,
        screenshots: g.screenshots || null,
        tagImage: g.tagImage || null,
        steamAppId: g.steamAppId || null,
      };

      if (g.id) {
        await prisma.game.upsert({
          where: { id: g.id },
          update: gameData,
          create: { id: g.id, ...gameData }
        });
      } else {
        await prisma.game.create({
          data: gameData
        });
      }
      importedCount++;
    }

    getIO()?.emit('games_updated');
    res.json({ message: `Successfully imported ${importedCount} games!`, count: importedCount });
  } catch (error: any) {
    console.error('[IMPORT GAMES ERROR]', error);
    res.status(500).json({ error: 'Failed to import games: ' + (error.message || String(error)) });
  }
});

export default router;

