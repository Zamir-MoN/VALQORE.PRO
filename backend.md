# VALQORE_PRO - Backend Documentation

This document provides a comprehensive overview of the backend architecture, technologies, configurations, and connectivity for the **VALQORE_PRO** project.

## 1. Technology Stack & Why We Used It

* **Node.js & Express.js**: The core backend framework. We used Express because it's lightweight, fast, and provides a robust set of features for web and mobile applications (routing, middleware).
* **Prisma (ORM)**: Used for database modeling and migrations. Prisma provides a type-safe database client (`@prisma/client`) which makes querying the database intuitive and reduces runtime errors.
* **PostgreSQL (via `pg` & `@prisma/adapter-pg`)**: The relational database used to store users, games, carts, and wishlists. PostgreSQL is highly reliable and scalable for production environments. 
* **Socket.io**: Used for real-time bi-directional communication between the server and the frontend. This is specifically used to notify all connected clients instantly when the admin adds, updates, or deletes a game, allowing the UI to refresh automatically without user intervention.
* **JWT (JSON Web Tokens) & bcryptjs**: Used for secure authentication. Passwords are hashed using `bcryptjs` before saving to the database. JWT is used for stateless, secure session management, where the frontend receives a token and passes it in the `Authorization` header for protected routes.
* **Axios**: Used on the server side to make HTTP requests to the external IGDB API.
* **Multer**: Middleware used for handling `multipart/form-data`, primarily for uploading game cover images/screenshots locally.

---

## 2. Environment Variables & Hardcoded Logic

### Backend `.env` (Dynamic vs Hardcoded)
The backend relies on the `.env` file for sensitive and environment-specific data:

* `DATABASE_URL`: **Dynamic** - Contains the connection string for PostgreSQL (e.g., `postgresql://valqore_admin:...`). This changes depending on whether you are running locally or in production.
* `PORT`: **Dynamic** - Determines which port the Node.js app runs on (defaults to `5005` in code if not provided).
* `ADMIN_USERNAME` & `ADMIN_PASSWORD`: **Dynamic via .env, Hardcoded Fallbacks** - Used for the static admin login mechanism. If missing in `.env`, the code hardcodes fallbacks (`admin` / `valqore2026`).
* `IGDB_CLIENT_ID` & `IGDB_CLIENT_SECRET`: **Dynamic** (but shared for dev) - Required to authenticate with Twitch/IGDB API. 
  * `IGDB_CLIENT_ID`: `6rikwhj0jlewdqks8prnh0o86ls239`
  * `IGDB_CLIENT_SECRET`: `iyc4u35v31mc66jk7l08cyzi3mod8x`

### Frontend Variables
* `VITE_API_URL`: **Dynamic** - Located in the frontend's environment setup (via Vite). However, there is a **hardcoded fallback** in the frontend context (`src/context/GameContext.tsx`): 
  ```typescript
  const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';
  ```

---

## 3. Nginx Configuration & Logic Explanation

The project uses Nginx as a reverse proxy and static file server. Here is the configuration breakdown:

```nginx
server {
    listen 80;
    server_name valqore.pro www.valqore.pro;

    # 1. Serving the Frontend
    root /home/ubuntu/VALQORE_PRO/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 2. Proxying the REST API
    location /api/ {
        proxy_pass http://127.0.0.1:5005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 3. Proxying WebSockets (Socket.io)
    location /socket.io/ {
        proxy_pass http://localhost:5005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # 4. Proxying Static Uploads
    location /uploads/ {
        proxy_pass http://127.0.0.1:5005;
    }
}
```

### **Why this Nginx Logic is applied?**
1. **Frontend Hosting (`location /`)**: Nginx directly serves the compiled static React/Vite files from the `/dist` directory. The `try_files $uri $uri/ /index.html;` directive is critical for React Router—it ensures that if a user refreshes a page (like `/store`), Nginx doesn't return a 404, but instead serves `index.html` so React Router can handle the client-side routing.
2. **Backend Proxy (`location /api/`)**: Requests starting with `/api/` are forwarded to the Node.js server running on port `5005`. This solves CORS issues and keeps the backend hidden from direct public exposure.
3. **WebSockets (`location /socket.io/`)**: Socket.io requires HTTP/1.1 `Upgrade` headers to transition the connection from standard HTTP to WebSockets. The proxy headers configured here allow that connection upgrade to pass through Nginx successfully.
4. **Static Uploads (`location /uploads/`)**: Any user-uploaded images are forwarded to the Express static handler, making them accessible via `valqore.pro/uploads/image.png`.

---

## 4. External APIs: IGDB Integration

**What we used & Why:**
We integrated the **IGDB API (Internet Game Database)** to allow the admin to automatically fetch game metadata (covers, platforms, genres, release dates, ratings) by simply searching a game title. This prevents manual data entry.

**Logic Applied:**
1. **Twitch Authentication**: IGDB requires a Twitch OAuth token. The backend makes a `POST` request to `https://id.twitch.tv/oauth2/token` using the `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET`.
2. **Token Caching**: To prevent rate limits and speed up requests, the backend caches the Twitch Access Token in server memory (`cachedToken`). It calculates the expiration time and only requests a new token if the current one has expired.
3. **Data Formatting**: The raw IGDB response is mapped and formatted on the server side to perfectly match the frontend `Game` object schema before sending it to the client.

---

## 5. API Endpoints & Application Logic

### **Ports Used**
- Node.js Backend: **`5005`**
- PostgreSQL: **`5432`**
- Nginx (Public Web): **`80`**

### **API Routes (`/api/*`)**

#### 1. Authentication (`/api/auth/*`)
- `POST /register`: Hashes password, creates User in DB, returns JWT.
- `POST /login`: Validates credentials (or admin hardcoded fallback), returns JWT.
- `GET /me`: Uses `authMiddleware` to verify JWT and return the current user's profile.

#### 2. Games (`/api/games/*`)
- `GET /`: Returns all games, sorted by creation date.
- `GET /:id`: Returns a specific game.
- `POST /` & `PUT /:id` & `DELETE /:id`: Protected admin routes to modify games. 
  - **Crucial Logic**: Whenever a game is modified, the server calls `getIO()?.emit('games_updated')`. This tells all connected frontend clients to re-fetch the game list seamlessly.

#### 3. IGDB (`/api/igdb/*`)
- `GET /search?q=gamename`: Protected route that fetches game info from IGDB.

#### 4. Cart & Wishlist (`/api/cart/*`, `/api/wishlist/*`)
- Full CRUD operations linking users and games.
- Built using Prisma relational logic. `@@unique([userId, gameId])` is defined in the schema to ensure a user cannot add the same game twice.

#### 5. File Uploads (`/api/upload/*`)
- Configured using `multer`. Saves files physically to the `/home/ubuntu/VALQORE_PRO/backend/uploads` directory.

---

## 6. Backend to Frontend Connectivity (Full Flow)

1. **HTTP REST**: The frontend uses `axios` to make HTTP calls. Base URL is set to `https://valqore.pro/api` in production. 
2. **Authentication Flow**: When a user logs in, the backend sends a JWT. The frontend stores this token (usually in `localStorage`) and attaches it as a `Bearer` token to the `Authorization` header for any subsequent API calls using a protected route (e.g., adding to cart).
3. **Real-time Synchronization**: 
   - The frontend's `GameContext.tsx` establishes a Socket.io connection (`const socket = io(...)`).
   - It listens for the `games_updated` event.
   - When the backend triggers this event (e.g., Admin edits a game price), the frontend silently runs `axios.get('/games')` to update the UI globally without the user having to hit "refresh".

## Summary for Development
- **Database Modifying**: Update `prisma/schema.prisma` -> run `npx prisma db push` (or migrate) -> Generate Prisma Client.
- **Starting locally**: In `backend/`, run `npm run dev`. Ensure PostgreSQL is running on `5432` and `DATABASE_URL` is correct in `.env`.
- **Nginx restarts**: If adding new route endpoints that aren't under `/api/`, Nginx must be updated (`sudo nano /etc/nginx/sites-available/valqore.pro`) and restarted (`sudo systemctl restart nginx`).
