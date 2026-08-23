import axios from 'axios';
import crypto from 'crypto';

const STEAM_MON_API_URL = process.env.STEAM_MON_API_URL || 'http://localhost:3001/api';
const STEAM_MON_ADMIN_USERNAME = process.env.STEAM_MON_ADMIN_USERNAME || 'zamir';
const STEAM_MON_ADMIN_PASSWORD = process.env.STEAM_MON_ADMIN_PASSWORD || 'zamir';

let adminToken: string | null = null;

export const generateSecurePassword = () => {
  return crypto.randomBytes(6).toString('hex'); // 12 character hex password
};

const getAdminToken = async () => {
  if (adminToken) return adminToken;

  try {
    const response = await axios.post(`${STEAM_MON_API_URL}/auth/login`, {
      username: STEAM_MON_ADMIN_USERNAME,
      password: STEAM_MON_ADMIN_PASSWORD
    });
    adminToken = response.data.token;
    return adminToken;
  } catch (error) {
    console.error('[STEAM MON LOGIN ERROR]', error);
    throw new Error('Failed to authenticate with Steam Mon backend');
  }
};

export const createSteamMonUser = async (username: string, password_hash: string) => {
  try {
    const token = await getAdminToken();
    const response = await axios.post(
      `${STEAM_MON_API_URL}/auth/create-user`,
      {
        username,
        password: password_hash,
        role: 'user',
        access_plan: 'SELECTIVE'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data.user;
  } catch (error: any) {
    if (error.response?.data?.error === 'Username already exists') {
       // Fetch user if they already exist
       const token = await getAdminToken();
       const usersRes = await axios.get(`${STEAM_MON_API_URL}/auth/users`, {
         headers: { Authorization: `Bearer ${token}` }
       });
       const existingUser = usersRes.data.find((u: any) => u.username === username);
       if (existingUser) return existingUser;
    }
    console.error('[STEAM MON CREATE USER ERROR]', error?.response?.data || error);
    throw new Error('Failed to create user in Steam Mon');
  }
};

export const grantGameAccess = async (steamMonUserId: number, steamAppId: string) => {
  try {
    const token = await getAdminToken();
    
    // 1. Fetch all accounts to find the one matching the steamAppId
    const accountsRes = await axios.get(`${STEAM_MON_API_URL}/accounts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const account = accountsRes.data.find((acc: any) => acc.app_id === steamAppId);
    if (!account) {
      console.warn(`[STEAM MON] No account found with app_id: ${steamAppId}`);
      return;
    }

    // 2. Grant access
    await axios.post(
      `${STEAM_MON_API_URL}/auth/users/${steamMonUserId}/selective-access`,
      { account_id: account.id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`[STEAM MON] Granted access for user ${steamMonUserId} to account ${account.id}`);
  } catch (error: any) {
    console.error('[STEAM MON GRANT ACCESS ERROR]', error?.response?.data || error);
    throw new Error('Failed to grant game access in Steam Mon');
  }
};
