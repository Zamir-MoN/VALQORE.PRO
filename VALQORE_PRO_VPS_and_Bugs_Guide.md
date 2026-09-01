# VALQORE_PRO & STe-MoN: Bug Fixes & VPS Deployment Guide

This document contains a summary of all the bugs we solved, features we added, and the exact VPS commands used to manage and deploy your servers.

## 🐛 Bugs Solved & Features Added

### 1. Game Deletion Foreign Key Error
*   **The Issue:** When trying to delete a game from the Admin Dashboard, the database threw a foreign key constraint error because the game was still linked to users' carts, wishlists, and order histories.
*   **The Fix:** Updated the `DELETE /api/games/:id` route to manually delete associated `CartItem`, `WishlistItem`, and `OrderItem` records before attempting to delete the game itself.

### 2. Detailed Error Reporting
*   **The Issue:** The frontend toast notifications were just saying "Operation failed" or "Authentication failed" instead of showing the actual database error.
*   **The Fix:** Updated the catch blocks in `games.ts` and `auth.ts` to capture the exact error message and send it to the frontend.

### 3. "Delete All Orders" Feature
*   **The Issue:** You had a bunch of test orders clogging up the database and no easy way to clear them from the admin panel.
*   **The Fix:** Added a new `DELETE /api/orders/admin/all` endpoint in the backend and a red **"Delete All"** button in the `AdminDashboard.tsx` Order Management section to instantly wipe all order history.

### 4. Steam Mon Credentials Showing Without Orders
*   **The Issue:** The "Steam Launcher Access" banner containing the user's generated STe-MoN Username and Password was showing up in the "My Orders" tab even if the user had deleted all their orders.
*   **The Fix:** Updated `Profile.tsx` to completely hide the Steam Launcher Access banner if the user has 0 orders.

### 5. Steam Mon Credentials Showing for Pending Orders
*   **The Issue:** When a user placed a new order, their STe-MoN credentials would instantly show up even while the order was still `PENDING`, giving them access before the admin approved it.
*   **The Fix:** Changed the logic in `Profile.tsx` so the credentials banner **only** appears if the user has at least one order marked as `COMPLETED`.


---

## 💻 Essential VPS Commands

Here is the master list of commands you need to manage your VPS hosted applications.

### 1. Full Deployment Update (Pull, Build, Restart)
Run this command from anywhere in your VPS when you want to pull new GitHub changes, rebuild the React frontend, and restart the backend.
```bash
cd /home/ubuntu/VALQORE_PRO && git pull origin main && cd frontend && npm run build && cd ../backend && pm2 restart all
```

### 2. Updating Database Schema
If you ever add new columns to your Prisma schema (like `steamAppId` or `steamMonUsername`), you must run this on the VPS to update the live database:
```bash
cd /home/ubuntu/VALQORE_PRO/backend
npx prisma db push
```

### 3. Managing PM2 Processes
PM2 is the tool that keeps your backends running 24/7. 

**View all running backends:**
```bash
pm2 status
```

**View live logs / errors for all apps:**
```bash
pm2 logs --lines 50
```

**View errors ONLY:**
```bash
pm2 logs --err --lines 50
```

### 4. How to run BOTH Backends (Valqore & STe-MoN)
If your `valqore-backend` ever disappears from `pm2 status`, here is how you start it up alongside `steam-mon-backend`:

**Step 1: Start the Valqore Backend:**
```bash
cd /home/ubuntu/VALQORE_PRO/backend
pm2 start npm --name "valqore-backend" -- run start
```

**Step 2: Save the PM2 list so they both auto-start on server reboot:**
```bash
pm2 save
```
