"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Store the Twitch Access Token in memory
let cachedToken = '';
let tokenExpiration = 0;
const getTwitchAccessToken = async () => {
    const now = Date.now();
    if (cachedToken && now < tokenExpiration) {
        return cachedToken;
    }
    const clientId = (process.env.IGDB_CLIENT_ID || '').trim();
    const clientSecret = (process.env.IGDB_CLIENT_SECRET || '').trim();
    if (!clientId || !clientSecret) {
        throw new Error('IGDB Credentials not configured in .env');
    }
    const response = await axios_1.default.post(`https://id.twitch.tv/oauth2/token`, null, {
        params: {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials',
        },
    });
    cachedToken = response.data.access_token;
    // Subtract 5 minutes to be safe
    tokenExpiration = now + (response.data.expires_in * 1000) - 300000;
    return cachedToken;
};
router.get('/search', auth_1.authMiddleware, async (req, res) => {
    const query = req.query.q;
    if (!query) {
        res.status(400).json({ error: 'Search query is required' });
        return;
    }
    try {
        const accessToken = await getTwitchAccessToken();
        const clientId = (process.env.IGDB_CLIENT_ID || '').trim();
        // Search IGDB games endpoint
        // We want to fetch games matching the exact string roughly, returning cover, platforms, genres, etc.
        const igdbResponse = await axios_1.default.post('https://api.igdb.com/v4/games', `
      search "${query.replace(/"/g, '')}";
      fields name, first_release_date, platforms.name, genres.name, involved_companies.company.name, involved_companies.developer, cover.url, total_rating;
      limit 1;
      `, {
            headers: {
                'Client-ID': clientId,
                Authorization: `Bearer ${accessToken}`,
                'Accept': 'application/json',
                'Content-Type': 'text/plain',
            },
        });
        if (igdbResponse.data && igdbResponse.data.length > 0) {
            const gameData = igdbResponse.data[0];
            // Format the data to match our frontend format
            const formattedGame = {
                title: gameData.name || '',
                releaseDate: gameData.first_release_date
                    ? new Date(gameData.first_release_date * 1000).toISOString().split('T')[0]
                    : '',
                platforms: gameData.platforms
                    ? gameData.platforms.map((p) => p.name).join(', ')
                    : '',
                genre: gameData.genres
                    ? gameData.genres.map((g) => g.name).join(', ')
                    : '',
                developer: gameData.involved_companies
                    ? gameData.involved_companies.find((ic) => ic.developer)?.company?.name || gameData.involved_companies[0]?.company?.name || ''
                    : '',
                coverImage: gameData.cover && gameData.cover.url
                    ? gameData.cover.url.replace('t_thumb', 't_1080p').replace('//', 'https://')
                    : '',
                rating: gameData.total_rating
                    ? (gameData.total_rating / 20).toFixed(1) // Convert 100 scale to 5 scale
                    : '0',
            };
            res.json(formattedGame);
        }
        else {
            res.status(404).json({ error: 'Game not found in IGDB' });
        }
    }
    catch (error) {
        console.error('IGDB Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch data from IGDB' });
    }
});
exports.default = router;
//# sourceMappingURL=igdb.js.map