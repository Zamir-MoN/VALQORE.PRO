const axios = require('axios');
const jwt = require('jsonwebtoken');
const token = jwt.sign({userId: '1', role: 'admin'}, 'c78dd0952703e4e6889217ec527e0c22412fc4e7586f4c5841080ba6c25ac537', {expiresIn: '1h'});

async function run() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  const game = await prisma.game.findFirst({ where: { isBundle: false } });
  const bundle = await prisma.game.findFirst({ where: { isBundle: true, title: { contains: 'Legendary' } } });
  
  if (game) {
    console.time('Game Update');
    await axios.put(`http://127.0.0.1:5005/games/${game.id}`, { title: game.title }, { headers: { Authorization: `Bearer ${token}` } });
    console.timeEnd('Game Update');
  }

  if (bundle) {
    console.time('Bundle Update');
    await axios.put(`http://127.0.0.1:5005/games/${bundle.id}`, { title: bundle.title, isBundle: true, bundleGames: bundle.bundleGames }, { headers: { Authorization: `Bearer ${token}` } });
    console.timeEnd('Bundle Update');
  }
}
run().catch(console.error);
