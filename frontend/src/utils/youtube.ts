export const getYouTubeVideoId = (url: string | null | undefined): string | null => {
  if (!url) return null;

  // If it's already a clean 11-character video ID, return it.
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Check if hostname is a valid YouTube domain
    const validDomains = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com'];
    if (!validDomains.includes(hostname)) {
      return null;
    }

    let videoId: string | null = null;

    // Handle youtu.be/VIDEO_ID
    if (hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } 
    // Handle youtube.com/watch?v=VIDEO_ID
    else if (urlObj.pathname === '/watch') {
      videoId = urlObj.searchParams.get('v');
    }
    // Handle youtube.com/embed/VIDEO_ID or youtube.com/shorts/VIDEO_ID
    else if (urlObj.pathname.startsWith('/embed/') || urlObj.pathname.startsWith('/shorts/')) {
      videoId = urlObj.pathname.split('/')[2];
    }

    // A valid YouTube ID is typically 11 characters long containing only alphanumeric characters, dashes, and underscores.
    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return videoId;
    }

    return null;
  } catch (e) {
    // Invalid URL format
    return null;
  }
};
