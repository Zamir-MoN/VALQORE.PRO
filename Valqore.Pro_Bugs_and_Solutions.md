# VALQORE.PRO - Bugs, Solutions & Deployment Cheat Sheet

This document tracks the major updates, squashed bugs, and essential VPS deployment commands from our recent development sessions.

## 🛠️ Major Updates & Features
1. **Wishlist Removed**: Completely cleaned out wishlist logic from the backend and frontend for a more streamlined store experience.
2. **Order Lifecycle**: Implemented full order purchasing, history tracking in the Profile, and order cancellation.
3. **Premium UI Overhaul**: Upgraded `Profile.tsx`, `Navbar.tsx`, and `AdminDashboard.tsx` with high-end glassmorphism, dynamic gradients, smooth micro-animations, and responsive designs.
4. **Real-time "Out of Stock" System**:
   - Added `outOfStock` boolean to the Prisma schema.
   - Designed a premium iOS-style toggle switch for the Admin Dashboard.
   - Built-in WebSocket (Socket.io) broadcasting so that when an admin marks a game out of stock, it instantly grays out the game image and replaces "Buy Now" buttons with "OUT OF STOCK" banners for all live users, **without requiring a page refresh**.

---

## 🐛 Bugs & Solutions

### 1. The "Prisma Sync Illusion" Bug
**Bug**: The admin updated the database schema (`outOfStock` field), pushed code to the VPS, and ran `npx prisma db push`. The terminal output said `The database is already in sync with the Prisma schema.`, but the live API was returning `500 Internal Server Error` when trying to toggle the Out of Stock switch.
**Cause**: Because the database structure itself *was* already in sync, Prisma skipped the internal step of regenerating the Node.js Prisma Client. PM2 restarted the backend using an outdated Prisma Client that didn't know the `outOfStock` field existed.
**Solution**: Manually force the client to regenerate using `npx prisma generate` before restarting the PM2 server.

### 2. Trending Games "Group Hover" Bug
**Bug**: Hovering over one card in the Trending Games grid caused the text color of *all* cards to change simultaneously.
**Cause**: The parent container was using the `group` class improperly, causing all child text elements to respond to the hover state of the entire grid rather than individual cards.
**Solution**: Moved the `group` class directly onto the individual `GameCard` wrapper div, isolating the hover state exclusively to the specific card being hovered.

---

## 🚀 VPS Deployment Cheat Sheet

Whenever you make major changes (especially to the database schema or UI), run these exact commands on your VPS to ensure a smooth, error-free deployment.

```bash
# 1. Enter the project directory and pull latest code from GitHub
cd ~/VALQORE_PRO
git pull origin main

# 2. Update the Backend & Database
cd backend
npm install
npx prisma db push          # Applies any new schema changes to PostgreSQL
npx prisma generate         # CRITICAL: Forces Prisma to generate the new Client
pm2 restart valqore-backend-new  # Restarts the backend process

# 3. Build the Frontend
cd ../frontend
npm install
npm run build               # Compiles the new React/Vite UI for Nginx to serve
```

### Quick PM2 Commands
- **View logs**: `pm2 logs valqore-backend-new`
- **Check status**: `pm2 status`
- **Restart everything**: `pm2 restart all`
