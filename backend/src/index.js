"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
const path_1 = __importDefault(require("path"));
const games_1 = __importDefault(require("./routes/games"));
const upload_1 = __importDefault(require("./routes/upload"));
const auth_1 = __importDefault(require("./routes/auth"));
const igdb_1 = __importDefault(require("./routes/igdb"));
const cart_1 = __importDefault(require("./routes/cart"));
const wishlist_1 = __importDefault(require("./routes/wishlist"));
const orders_1 = __importDefault(require("./routes/orders"));
const coupons_1 = __importDefault(require("./routes/coupons"));
const posters_1 = __importDefault(require("./routes/posters"));
const creators_1 = __importDefault(require("./routes/creators"));
const payments_1 = __importDefault(require("./routes/payments"));
const sitemap_1 = require("./routes/sitemap");
const gmail_service_1 = require("./services/gmail.service");
const http_1 = __importDefault(require("http"));
const socket_1 = require("./socket");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const app = (0, express_1.default)();
app.set('trust proxy', 1); // Trust first proxy (Nginx) for correct IP in express-rate-limit
const server = http_1.default.createServer(app);
(0, socket_1.initSocket)(server);
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', globalLimiter);
// Start Gmail cron polling if configured
(0, gmail_service_1.startGmailCron)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/api/games', games_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/igdb', igdb_1.default);
app.use('/api/cart', cart_1.default);
app.use('/api/wishlist', wishlist_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/coupons', coupons_1.default);
app.use('/api/posters', posters_1.default);
app.use('/api/creators', creators_1.default);
app.use('/api/payments', payments_1.default);
app.use('/api/sitemap.xml', sitemap_1.sitemapRouter);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
server.listen(PORT, '127.0.0.1', () => {
    console.log(`Server is running on 127.0.0.1:${PORT}`);
});
//# sourceMappingURL=index.js.map