export const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  
  // If it's already an absolute URL or data URI, return as is
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  
  // Get backend base URL from VITE_API_URL by removing '/api'
  const apiUrl = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');
  
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};
