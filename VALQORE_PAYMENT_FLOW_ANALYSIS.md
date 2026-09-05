# Valqore.pro Payment Flow Analysis

This document provides a detailed inspection of the current payment flow architecture, automatic detection systems, and the precise changes required to automate transaction reconciliation using Order IDs.

---

### 1. ORDER CREATION
- **Exact backend file:** `backend/src/routes/payments.ts`
- **Exact function/endpoint:** `POST /create-session` (Lines 26-156)
- **Where the Order ID is generated:** The Order ID is generated at the database level by Prisma via `backend/prisma/schema.prisma`.
- **Order ID format:** A standard 36-character UUID string (e.g., `123e4567-e89b-12d3-a456-426614174000`).
- **Database model containing the order:** `Order` model in `schema.prisma`.
- **Relevant fields:** `id` (String UUID), `status` (String), `totalAmount` (Float), `purpose` (String), `submittedUtr` (String).

### 2. UPI PAYMENT CREATION
- **Exact backend file:** `backend/src/routes/payments.ts`
- **Exact function generating the UPI URI:** Directly inside `POST /create-session` and `GET /:orderId` routes.
- **Exact function generating the QR code:** `QRCode.toDataURL(upiUri, {...})`
- **Current UPI URI construction logic:**
  ```ts
  const upiUri = `upi://pay?pa=20-delta-mondal@fam&pn=Delta%20X&mc=0000&am=${order.totalAmount}&tn=${purpose}&tr=${purpose}&cu=INR`;
  ```
- **Currently Passed Values:**
  - `pa`: `20-delta-mondal@fam`
  - `pn`: `Delta X`
  - `am`: `${order.totalAmount}` (Dynamic from cart total)
  - `tn`: `${purpose}` (A generated string like `DX-K8M2P5R1Q7`)
  - `tr`: `${purpose}` (The same generated string)
  - `purpose/note/message`: This is controlled by the `tn` and `tr` parameters.
- **QR Generation Method:** The QR is generated directly from the constructed UPI URI string using the `qrcode` NPM library. No third-party API service is used for QR generation.

### 3. PAYMENT API
- **Exact backend routes:** `backend/src/routes/payments.ts`
- **Endpoint initializing payment:** `POST /create-session`
- **Endpoint for UTR confirmation:** `POST /:orderId/confirm` (Lines 209-283)
- **Function handling UTR confirmation:** Updates the `Order` status to `COMPLETED`, updates `submittedUtr`, links any existing `Transaction` record to the order, emits a WebSocket update, and finally calls `fulfillOrderSteamAccess(order.id)`.
- **Where order status changes:** `backend/src/routes/payments.ts` inside the `prisma.order.update` call in the confirm endpoint.

### 4. PAYMENT STATUS / WEBSOCKET
- **Backend implementation:** Uses Socket.io via `getIO()` exported from `backend/src/socket.ts`.
- **Where it is emitted:**
  - `backend/src/routes/payments.ts` (`/:orderId/confirm` and `/admin/:orderId/verify`)
  - `backend/src/services/verification.service.ts` (`processPaymentEmail`)
- **What causes it to be emitted:** The successful verification of a UTR (either manually submitted, admin approved, or automatically matched by email).
- **Emitted by:** `getIO()?.emit(\`payment_status_${order.id}\`, { status: 'COMPLETED' });`

### 5. POLLING
- **Backend endpoint:** `GET /payments/:orderId` (Lines 158-207)
- **What status it returns:** It queries `prisma.order.findUnique` and returns the database `order.status` (e.g., `PENDING`, `COMPLETED`, `CANCELLED`).

### 6. AUTOMATIC PAYMENT DETECTION
- **Does it exist?** YES.
- **Exact files:**
  - `backend/src/services/gmail.service.ts`
  - `backend/src/services/verification.service.ts`
  - `backend/src/utils/parser.util.ts`
- **The Flow:**
  1. A cron job in `gmail.service.ts` polls the connected Gmail inbox every 5 seconds.
  2. It searches for unread emails from `no-reply@famapp.in`.
  3. It extracts the email text and passes it to `parseFamAppEmail` to extract UTR, Amount, Transaction ID, Sender, and Purpose.
  4. It passes this data to `processPaymentEmail()` in `verification.service.ts`.
  5. The service saves a `Transaction` to the database.
  6. It checks if there is a `PENDING` order with a matching `submittedUtr` OR matching `purpose`.
  7. If a match is found and the `amount` matches exactly, it automatically updates the order to `COMPLETED` and emits the success websocket, unlocking the game.

### 7. PAYMENT PROVIDER
- **How Valqore.pro receives payments:** The platform operates strictly on **Peer-to-Peer (P2P) UPI transfers**.
- **Integration type:** There is no official payment gateway (like Razorpay/Stripe). The system merely generates a UPI QR code pointing to a static FamApp UPI ID (`20-delta-mondal@fam`).
- **Confirmation mechanism:** It relies entirely on IMAP Gmail polling (reading FamApp email receipts) and manual customer UTR submission.

### 8. EMAILS
- **Payment-related emails:** There are currently **NO** payment receipt or order confirmation emails being sent to the customer or admin from the backend.
- **Existing email functionality:** The `resend` library is only used in `backend/src/routes/auth.ts` to send OTP emails (`sendOtpEmail`) and in `creators.ts` for creator approvals (`sendApprovalEmail`).
- **Data Availability:** Even though emails are not currently sent, the system *does* have access to the UTR, Transaction ID, Amount, Purpose, and Order ID inside `verification.service.ts` at the exact moment the order is marked `COMPLETED`.

### 9. ENVIRONMENT VARIABLES
Relevant variables from `.env` powering this flow:
- `ENABLE_GMAIL_CRON`
- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REFRESH_TOKEN`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `ADMIN_EMAIL`

### 10. RECOMMENDED CHANGE LOCATION
- **Exact File:** `backend/src/routes/payments.ts`
- **Exact Code Section:**
  Inside `POST /create-session` (Line 131) and `GET /:orderId` (Line 182).
- **The Change:**
  Modify the `upiUri` construction to use `order.id` for the `tn` (Transaction Note) and `tr` (Transaction Reference) parameters instead of the randomly generated `purpose`.
  ```ts
  // From:
  const upiUri = `upi://pay?pa=20-delta-mondal@fam&pn=Delta%20X&mc=0000&am=${order.totalAmount}&tn=${purpose}&tr=${purpose}&cu=INR`;

  // To:
  const upiUri = `upi://pay?pa=20-delta-mondal@fam&pn=Delta%20X&mc=0000&am=${order.totalAmount}&tn=${order.id}&tr=${order.id}&cu=INR`;
  ```

### 11. AUTOMATION FEASIBILITY
Can we achieve the fully automatic flow?

- **A. What is already implemented:**
  - Order creation and QR generation.
  - Gmail polling and FamApp email parsing (Amount, UTR, Purpose/Message extraction).
  - Database saving of incoming transactions.
  - WebSocket emission upon order completion.
  - Product unlocking (`fulfillOrderSteamAccess`).

- **B. What is missing:**
  - The UPI QR `tn` parameter currently uses a random 13-character string (`DX-XXXXXXXXXX`) instead of the `Order ID`.
  - Admin/Customer order confirmation emails are missing.

- **C. What is required to make it fully automatic:**
  1. Change the `tn` and `tr` variables in the UPI string in `payments.ts` to use `order.id`.
  2. Ensure the email parser (`parseFamAppEmail`) correctly extracts the UUID from the `Purpose` line of the FamApp email.
  3. Update `verification.service.ts` to look up the `PENDING` order using `where: { id: data.purpose }` instead of `where: { purpose: data.purpose }`.

### 12. IMPORTANT SAFETY/RELIABILITY CHECK
- **Is matching only by amount unsafe?**
  **Extremely unsafe.** If two customers create pending orders for a ₹40 game at the same time, an incoming ₹40 transaction cannot be definitively assigned without a unique identifier (UTR or Purpose). The system would guess and likely fulfill the wrong order.
- **Is using Order ID as Note/Purpose reliable?**
  **Yes, highly reliable.** It provides a definitive 1:1 mapping between the bank transaction and the database order, allowing instant fulfillment without waiting for the user to type the UTR.
- **Limitations:**
  UUIDs are 36 characters long. While the UPI specification allows up to 50 characters for the `tn` field, some older banking apps or specific third-party UPI apps might truncate long messages or drop the note entirely. If a customer's UPI app drops the note, the automatic matching will fail, and the system will fallback to requiring the customer to manually enter their UTR (which the current system gracefully handles).
