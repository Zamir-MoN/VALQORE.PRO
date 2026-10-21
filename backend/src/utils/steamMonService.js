"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.grantGameAccess = exports.createSteamMonUser = exports.generateSecurePassword = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const STEAM_MON_API_URL = process.env.STEAM_MON_API_URL || 'http://localhost:3001/api';
const STEAM_MON_ADMIN_USERNAME = process.env.STEAM_MON_ADMIN_USERNAME || 'zamir';
const STEAM_MON_ADMIN_PASSWORD = process.env.STEAM_MON_ADMIN_PASSWORD;
let adminToken = null;
const generateSecurePassword = () => {
    return crypto_1.default.randomBytes(6).toString('hex'); // 12 character hex password
};
exports.generateSecurePassword = generateSecurePassword;
const getAdminToken = async () => {
    if (adminToken)
        return adminToken;
    try {
        const response = await axios_1.default.post(`${STEAM_MON_API_URL}/auth/login`, {
            username: STEAM_MON_ADMIN_USERNAME,
            password: STEAM_MON_ADMIN_PASSWORD
        });
        adminToken = response.data.token;
        return adminToken;
    }
    catch (error) {
        console.error('[STEAM MON LOGIN ERROR]', error);
        throw new Error('Failed to authenticate with Steam Mon backend');
    }
};
const createSteamMonUser = async (username, password_hash) => {
    try {
        const token = await getAdminToken();
        const response = await axios_1.default.post(`${STEAM_MON_API_URL}/auth/create-user`, {
            username,
            password: password_hash,
            role: 'user',
            access_plan: 'SELECTIVE'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.user;
    }
    catch (error) {
        if (error.response?.data?.error === 'Username already exists') {
            // Fetch user if they already exist
            const token = await getAdminToken();
            const usersRes = await axios_1.default.get(`${STEAM_MON_API_URL}/auth/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const existingUser = usersRes.data.find((u) => u.username === username);
            if (existingUser)
                return existingUser;
        }
        console.error('[STEAM MON CREATE USER ERROR]', error?.response?.data || error);
        throw new Error('Failed to create user in Steam Mon');
    }
};
exports.createSteamMonUser = createSteamMonUser;
const grantGameAccess = async (steamMonUserId, steamAppId) => {
    try {
        const token = await getAdminToken();
        // 1. Fetch all accounts to find the one matching the steamAppId
        const accountsRes = await axios_1.default.get(`${STEAM_MON_API_URL}/accounts`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const account = accountsRes.data.find((acc) => acc.app_id === steamAppId);
        if (!account) {
            console.warn(`[STEAM MON] No account found with app_id: ${steamAppId}`);
            return;
        }
        // 2. Grant access
        await axios_1.default.post(`${STEAM_MON_API_URL}/auth/users/${steamMonUserId}/selective-access`, { account_id: account.id }, { headers: { Authorization: `Bearer ${token}` } });
        console.log(`[STEAM MON] Granted access for user ${steamMonUserId} to account ${account.id}`);
    }
    catch (error) {
        console.error('[STEAM MON GRANT ACCESS ERROR]', error?.response?.data || error);
        throw new Error('Failed to grant game access in Steam Mon');
    }
};
exports.grantGameAccess = grantGameAccess;
//# sourceMappingURL=steamMonService.js.map