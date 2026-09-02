/**
 * Formats any Order UUID or ID into a clean, short format: VP-XXXXXXXX
 * If already formatted or short, returns clean format.
 */
export function formatOrderId(id: string | null | undefined): string {
  if (!id) return 'VP-00000000';
  
  if (id.startsWith('VP-')) {
    return id.toUpperCase();
  }

  // Remove dashes and take first 8 alphanumeric characters
  const clean = id.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase();
  return `VP-${clean.padEnd(8, '0')}`;
}
