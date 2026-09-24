import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const requiredSecrets = [
  'JWT_SECRET',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
  'VITE_GOOGLE_CLIENT_ID',
  'STEAM_MON_ADMIN_PASSWORD',
];

for (const secret of requiredSecrets) {
  if (!process.env[secret]) {
    console.error(`FATAL: Missing required environment variable: ${secret}`);
    process.exit(1);
  }
}

import path from 'path';

import gamesRouter from './routes/games';
import uploadRouter from './routes/upload';
import authRouter from './routes/auth';
import igdbRouter from './routes/igdb';
import cartRouter from './routes/cart';
import wishlistRouter from './routes/wishlist';
import ordersRouter from './routes/orders';
import couponsRouter from './routes/coupons';
import postersRouter from './routes/posters';
import creatorsRouter from './routes/creators';
import paymentsRouter from './routes/payments';
import { sitemapRouter } from './routes/sitemap';
import { startGmailCron } from './services/gmail.service';
import http from 'http';
import { initSocket } from './socket';

import rateLimit from 'express-rate-limit';

const app = express();
const server = http.createServer(app);
initSocket(server);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api', globalLimiter);

// Start Gmail cron polling if configured
startGmailCron();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/games', gamesRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/auth', authRouter);
app.use('/api/igdb', igdbRouter);
app.use('/api/cart', cartRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/posters', postersRouter);
app.use('/api/creators', creatorsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/sitemap.xml', sitemapRouter);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
