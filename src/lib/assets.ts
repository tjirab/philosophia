/**
 * Resolves static public asset URLs taking basePath and GitHub Pages into account.
 */
export function getAssetUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  let basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  if (!basePath && typeof window !== 'undefined') {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    // If hosted under a sub-path like /philosophia on github.io or custom deployment
    if (
      pathSegments.length > 0 &&
      (pathSegments[0] === 'philosophia' || window.location.hostname.endsWith('github.io'))
    ) {
      basePath = `/${pathSegments[0]}`;
    }
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (basePath && cleanPath.startsWith(`${basePath}/`)) {
    return cleanPath;
  }
  return `${basePath}${cleanPath}`;
}
