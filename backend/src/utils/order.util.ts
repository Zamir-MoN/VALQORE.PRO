import crypto from 'crypto';

/**
 * Generates a cryptographically secure, 8-character uppercase hex string prefixed with VP
 * Example: VP70C07E75
 */
export function generateOrderId(): string {
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `VP${randomHex}`;
}
