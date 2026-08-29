/**
 * Helper to get the correct URL for an image path.
 * Supports absolute URLs, static public assets, backend uploads, data URIs, and Unsplash optimization.
 */
export function getImageUrl(path) {
  if (!path) return '';
  let url = String(path).trim();

  // If it's already an absolute URL (http, https, data URI, or protocol-relative //)
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('//')) {
    if (url.startsWith('//')) {
      url = `https:${url}`;
    }
  } else if (
    url.startsWith('/products/') ||
    url.startsWith('/media/') ||
    url.startsWith('/logo.png') ||
    url.startsWith('/hero-bg.png') ||
    url.startsWith('/stitched-preview.png') ||
    url.startsWith('/cat-')
  ) {
    // Local static asset in frontend public folder
    url = url;
  } else {
    // Relative upload path (e.g. /uploads/... or uploads/...)
    const defaultOrigin = typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:4000`
      : 'http://localhost:4000';
    
    let origin = defaultOrigin;
    if (import.meta.env.VITE_API_URL) {
      origin = import.meta.env.VITE_API_URL.trim().replace(/\/api\/?$/, '').replace(/\/$/, '');
    }

    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    url = `${origin}${cleanPath}`;
  }

  // Safely format Unsplash image URLs for optimization
  if (url.includes('unsplash.com')) {
    if (url.includes('fm=')) {
      url = url.replace(/fm=[a-zA-Z0-9]+/g, 'fm=webp');
    } else if (url.includes('?')) {
      url = `${url}&fm=webp`;
    } else {
      url = `${url}?fm=webp`;
    }
  }

  return url;
}
