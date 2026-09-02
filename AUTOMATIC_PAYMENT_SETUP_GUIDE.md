# ⚡ Automatic UPI UTR Email Verification & Order Confirmation Guide

This document explains **how the automatic payment verification system works** in VALQORE.PRO and provides a **complete step-by-step setup guide** to connect your Gmail inbox so bank payment receipt emails automatically confirm customer orders in real time.

---

## 🧠 1. How the Automatic Verification System Works

```
   [ Customer Scans QR & Pays via UPI ]
                    │
                    ▼
     [ Customer Submits 12-Digit UTR ]
                    │
                    ▼
       Order Status = PENDING
   (Waiting for Bank Email Confirmation)
                    │
                    ├──────────────────────────────────────────────────┐
                    ▼                                                  ▼
     [ Bank / FamApp sends Payment Email ]             [ Backend Gmail Cron Checks Inbox ]
   (Subject: Money Received / UTR: 123456789012)        (Runs automatically every 5 seconds)
                    │                                                  │
                    └─────────────────┬────────────────────────────────┘
                                      ▼
                      [ Email Parser Reads Body ]
               Extracts: UTR, Amount (₹), Sender, TxID
                                      │
                                      ▼
                   [ Database Transaction Matcher ]
        Matches Email UTR === Customer Submitted Order UTR
        Matches Email Amount (₹) === Order Total Amount (₹)
                                      │
                    ┌─────────────────┴─────────────────┐
                    ▼                                   ▼
             [ MATCH SUCCESS ]                   [ NO MATCH / PENDING ]
          • Order = COMPLETED                 • Order stays PENDING
          • Steam Mon auto-unlocked           • Admin can review in dashboard
          • Live WebSocket pushes to UI
          • User Library unlocks instantly!
```

---

## ⚙️ 2. Step-by-Step Setup Guide: Connect Your Gmail Inbox

The backend uses the official **Google Gmail API (OAuth2)** to securely fetch unread payment receipt emails from your bank / FamApp.

---

### Step 2.1: Enable Gmail API in Google Cloud Console

1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Select your existing project (or create a new one, e.g. `Valqore-Payments`).
3. In the search bar at the top, search for **Gmail API** and click **Enable**.

---

### Step 2.2: Configure OAuth Consent Screen

1. In Google Cloud Console, navigate to **APIs & Services > OAuth consent screen**.
2. Select User Type: **External** and click **Create**.
3. Fill in:
   - **App name**: `VALQORE Payments`
   - **User support email**: Your email (e.g. `valqore.pro@gmail.com`)
   - **Developer contact email**: Your email
4. Click **Save and Continue**.
5. Under **Scopes**, click **Add or Remove Scopes**:
   - Add: `https://www.googleapis.com/auth/gmail.readonly` (Read-only access to messages).
6. Click **Save and Continue**.
7. Under **Test Users**, add your personal Gmail address where bank payment receipts arrive (e.g. `valqore.pro@gmail.com`).
8. Click **Save and Continue**.

---

### Step 2.3: Create OAuth2 Credentials

1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials > OAuth Client ID**.
3. Application Type: **Web Application**.
4. Name: `VALQORE Gmail Service`.
5. Under **Authorized redirect URIs**, add:
   ```text
   https://developers.google.com/oauthplayground
   ```
6. Click **Create**.
7. Copy your **Client ID** and **Client Secret**.

---

### Step 2.4: Generate Refresh Token via OAuth2 Playground

1. Go to **[Google OAuth2 Playground](https://developers.google.com/oauthplayground)**.
2. In the top-right corner, click the **Gear icon (⚙️)**:
   - Check the box: **Use your own OAuth credentials**.
   - Paste your **OAuth Client ID** from Step 2.3.
   - Paste your **OAuth Client Secret** from Step 2.3.
   - Click **Close**.
3. On the left under **Step 1 Select & authorize APIs**:
   - Scroll down to **Gmail API v1**.
   - Check: `https://www.googleapis.com/auth/gmail.readonly`.
   - Click the blue **Authorize APIs** button.
4. Sign in with the Gmail account where your payment receipts arrive (e.g. `valqore.pro@gmail.com`) and click **Allow**.
5. You will be redirected to **Step 2 (Exchange authorization code for tokens)**:
   - Click the blue button: **Exchange authorization code for tokens**.
6. Copy the generated **Refresh token**.

---

## 🔑 3. Update Backend `.env` on Your VPS

Open your VPS terminal and edit `/home/ubuntu/VALQORE_PRO/backend/.env`:

```bash
nano ~/VALQORE_PRO/backend/.env
```

Add the following keys at the bottom:

```env
# ==========================================
# 📧 GMAIL AUTOMATIC PAYMENT VERIFICATION
# ==========================================
ENABLE_GMAIL_CRON=true
GMAIL_CLIENT_ID="YOUR_GMAIL_CLIENT_ID_HERE"
GMAIL_CLIENT_SECRET="YOUR_GMAIL_CLIENT_SECRET_HERE"
GMAIL_REFRESH_TOKEN="YOUR_GMAIL_REFRESH_TOKEN_HERE"
```

Save and exit (`Ctrl + O`, `Enter`, `Ctrl + X`).

---

## 🚀 4. Restart Backend Process on VPS

```bash
cd ~/VALQORE_PRO && git pull origin main
pm2 restart valqore-backend
pm2 logs valqore-backend --lines 30 --nostream
```

You should see:
```text
[DELTA PAY] Starting Gmail Polling Cron Job (every 5 seconds)
```

---

## 🔍 5. Customizing for Different Banks (HDFC, SBI, Paytm, PhonePe)

The email parser is located in:
[`backend/src/utils/parser.util.ts`](file:///c:/Users/zisha/Desktop/Test%20VS/VALQORE_PRO/VALQORE_PRO/backend/src/utils/parser.util.ts)

By default, it parses standard UPI receipt formats:
```ts
// Extracts ₹Amount
const amountMatch = cleanText.match(/₹([\d.]+)/);

// Extracts 12-digit UTR
const utrMatch = cleanText.match(/UTR\s*:\s*(\d{12})/i);

// Extracts Transaction ID
const txMatch = cleanText.match(/Transaction ID\s*:\s*([a-zA-Z0-9]+)/i);
```

If your bank sends emails with a different subject or sender (e.g. `alerts@hdfcbank.net`, `nodal@phonepe.com`, `no-reply@famapp.in`), you can adjust the Gmail search query in [`backend/src/services/gmail.service.ts`](file:///c:/Users/zisha/Desktop/Test%20VS/VALQORE_PRO/VALQORE_PRO/backend/src/services/gmail.service.ts#L25):

```ts
const res = await gmailClient.users.messages.list({
  userId: 'me',
  q: 'is:unread (from:no-reply@famapp.in OR from:alerts@hdfcbank.net OR subject:"UPI") newer_than:1d',
});
```

---

## 🛡️ 6. Manual Fallback & Admin Control

If a customer types the wrong UTR or the bank email is delayed:
1. Log into **Admin Dashboard** (`https://valqore.pro/admin`).
2. Go to the **Payments** tab.
3. You will see the customer's **Order ID (`VP-XXXXXXXX`)**, **Submitted UTR**, and **Amount**.
4. Click **Approve** to manually verify the order and immediately unlock the game and Steam Launcher access for the user.
