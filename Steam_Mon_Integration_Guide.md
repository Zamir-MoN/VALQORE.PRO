# 🔗 Connecting Valqore.Pro to STe-MoN

This guide explains exactly how to configure the environment variables on your VPS so that your Valqore.Pro website can talk to your STe-MoN desktop launcher backend automatically.

## Step 1: Configure STe-MoN Backend `.env`

First, you need to set up the admin credentials that STe-MoN will expect.

1. On your VPS, go to `/home/ubuntu/STe-MoN/backend`
2. Create or edit the `.env` file (`nano .env`)
3. Add these lines:

```env
# The port your STe-MoN API runs on
PORT=3001

# The secret admin credentials the website will use to create accounts
ADMIN_USERNAME=admin
ADMIN_PASSWORD=adminpassword

# Your SQLite database path (already configured by default)
DATABASE_URL="file:./dev.db"
```
4. Save the file and restart STe-MoN: `pm2 restart steam-mon-backend`

---

## Step 2: Configure Valqore.Pro Backend `.env`

Now, you need to tell Valqore.Pro where STe-MoN is and give it the admin credentials.

1. On your VPS, go to `/home/ubuntu/VALQORE_PRO/backend`
2. Create or edit the `.env` file (`nano .env`)
3. Add these exact lines at the bottom of the file:

```env
# URL to your STe-MoN API (since it's on the same VPS, localhost is perfect)
STEAM_MON_API_URL="http://localhost:3001/api"

# MUST match exactly what you set in STe-MoN's .env!
STEAM_MON_ADMIN_USERNAME="admin"
STEAM_MON_ADMIN_PASSWORD="adminpassword"
```
4. Save the file and restart Valqore.Pro: `pm2 restart valqore-backend`

---

## Step 3: Link Games in the Admin Panel

The connection is now live! The last step is mapping your store games to the launcher accounts.

1. Go to your Valqore.Pro Admin Dashboard on the website.
2. Edit a game (e.g., Red Dead Redemption 2).
3. Find the new **Steam Mon App ID (Optional)** field.
4. Enter the App ID you use for that game inside STe-MoN (e.g., `1196590`).
5. Save the game.

When a customer buys that game, Valqore.Pro will log into STe-MoN as `admin`, create an account for the user, find the Steam account with `app_id: 1196590`, and give the user selective access to it automatically!

> [!TIP]
> **Troubleshooting:** If automatic creation fails when you buy a game, check the logs on your VPS by running `pm2 logs valqore-backend`. Look for any messages starting with `[STEAM MON INTEGRATION ERROR]`.
