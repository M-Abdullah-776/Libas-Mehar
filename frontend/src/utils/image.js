/**
 * Helper to get the correct URL for an uploaded file path.
 * If the path starts with /uploads, it prepends the backend origin.
 */
export function getImageUrl(path) {
  if (!path) return '';
  let url = path;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    url = path;
  } else if (path.startsWith('/products/') || path.startsWith('/media/') || path.startsWith('/logo.png') || path.startsWith('/hero-bg.png') || path.startsWith('/stitched-preview.png') || path.startsWith('/cat-')) {
    url = path;
  } else {
    const defaultOrigin = typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:4000`
      : 'http://localhost:4000';
    const origin = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : defaultOrigin;
    url = `${origin}${path}`;
  }

  // Optimize Unsplash images to WebP format dynamically
  if (url.includes('unsplash.com')) {
    if (url.includes('fm=')) {
      url = url.replace(/fm=[a-zA-Z0-9]+/g, 'fm=webp');
    } else {
      url = `${url}&fm=webp`;
    }
  }
  return url;
}
