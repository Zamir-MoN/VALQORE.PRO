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

// Get a single game
router.get('/:id', async (req, res) => {
  try {
    const game = await prisma.game.findUnique({
      where: { id: req.params.id }
    });
    if (game) {
      res.json(game);
    } else {
      res.status(404).json({ error: 'Game not found' });
    }
  } catch (error) {
    console.error('[GET /:id ERROR]:', error);
    res.status(500).json({ error: 'Failed to fetch game' });
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
    await prisma.game.delete({
      where: { id: req.params.id }
    });
    getIO()?.emit('games_updated');
    res.json({ message: 'Game deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete game' });
  }
});

export default router;
