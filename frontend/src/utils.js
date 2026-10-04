const SHORT_URL_BASE = import.meta.env.VITE_SHORT_URL_BASE || 'http://localhost:5000'

export function buildShortUrl(shortId) {
  return `${SHORT_URL_BASE.replace(/\/+$/, '')}/${encodeURIComponent(shortId)}`
}

export function extractShortId(value) {
  const trimmedValue = value.trim()
  if (!trimmedValue) return ''

  try {
    const parsedUrl = new URL(trimmedValue)
    return parsedUrl.pathname.split('/').filter(Boolean).at(-1) || ''
  } catch {
    return trimmedValue.replace(/^\/+|\/+$/g, '')
  }
}
