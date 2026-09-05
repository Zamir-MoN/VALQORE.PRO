/**
 * Formats any Order UUID or ID into a clean, short format: VPXXXXXXXX
 * If already formatted or short, returns clean format.
 */
export function formatOrderId(id: string | null | undefined): string {
  if (!id) return 'VP00000000';
  
  const clean = id.replace(/[^a-zA-Z0-9]/g, '').replace(/^VP/i, '').substring(0, 8).toUpperCase();
  return `VP${clean.padEnd(8, '0')}`;
}
