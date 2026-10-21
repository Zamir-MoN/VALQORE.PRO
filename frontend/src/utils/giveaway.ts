import { GiveawayConfig } from '../types';

export const DEFAULT_INSTAGRAM_URL = 'https://www.instagram.com/valqore.pro/';
export const DEFAULT_INSTAGRAM_DM = 'https://ig.me/m/valqore.pro';

export function getInstagramHandle(url: string = DEFAULT_INSTAGRAM_URL): string {
  try {
    const clean = url.replace(/\/+$/, '').split('?')[0];
    const parts = clean.split('/');
    const handle = parts[parts.length - 1]?.replace('@', '');
    return handle || 'valqore.pro';
  } catch {
    return 'valqore.pro';
  }
}

export function getInstagramDmUrl(url: string = DEFAULT_INSTAGRAM_URL): string {
  const handle = getInstagramHandle(url);
  return `https://ig.me/m/${handle}`;
}

export function parseGiveawayRules(rules?: string | null): GiveawayConfig {
  if (!rules) {
    return {
      category: 'Subscription',
      worth: 0,
      endDate: '',
      winnersCount: 1,
      tasks: {
        instagram: { required: true, url: DEFAULT_INSTAGRAM_URL }
      },
      rules: '',
      winner: null
    };
  }

  try {
    const parsed = JSON.parse(rules);
    if (typeof parsed === 'object' && parsed !== null) {
      return {
        category: parsed.category || 'Subscription',
        worth: Number(parsed.worth) || 0,
        endDate: parsed.endDate || '',
        winnersCount: Number(parsed.winnersCount) || 1,
        tasks: {
          instagram: {
            required: true,
            url: parsed.tasks?.instagram?.url || DEFAULT_INSTAGRAM_URL
          }
        },
        rules: parsed.rules || '',
        winner: parsed.winner || null
      };
    }
  } catch {
    // Legacy plain string fallback
    return {
      category: 'Subscription',
      worth: 0,
      endDate: '',
      winnersCount: 1,
      tasks: {
        instagram: { required: true, url: DEFAULT_INSTAGRAM_URL }
      },
      rules: rules,
      winner: null
    };
  }

  return {
    category: 'Subscription',
    worth: 0,
    endDate: '',
    winnersCount: 1,
    tasks: {
      instagram: { required: true, url: DEFAULT_INSTAGRAM_URL }
    },
    rules: '',
    winner: null
  };
}
