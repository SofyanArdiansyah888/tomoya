/**
 * Resolve API base URL for same-origin deploy (tomoya.appsku + tomoya4management.net).
 * VITE_API_URL remains optional override for local dev against a remote API.
 */
export function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '')
  }

  return `${window.location.origin}/api`
}

/** Public storage files are served from /storage, not under /api. */
export function getStorageUrl(path: string): string {
  const cleanPath = path.replace(/^\//, '')

  if (import.meta.env.VITE_API_URL) {
    const origin = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    return `${origin}/storage/${cleanPath}`
  }

  return `/storage/${cleanPath}`
}
