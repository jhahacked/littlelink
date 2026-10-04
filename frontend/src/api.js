async function request(path, options) {
  const headers = new Headers(options?.headers)
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

  const response = await fetch(`${apiBaseUrl}${path}`, { ...options, credentials: 'include', headers })
  const contentType = response.headers.get('content-type') || ''
  let data

  if (contentType.includes('application/json')) {
    try {
      data = await response.json()
    } catch {
      throw new Error('The server returned an invalid response.')
    }
  } else {
    data = await response.text()
  }

  if (!response.ok) {
    const message = typeof data === 'object' && data !== null && 'message' in data
      ? data.message
      : `Request failed (${response.status}).`
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  return data
}

export function signInWithGoogle(credential) {
  return request('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  })
}

export function getCurrentUser() {
  return request('/api/auth/me')
}

export function signOut() {
  return request('/api/auth/logout', { method: 'POST' })
}

export function createShortUrl(originalUrl, expiresAt) {
  return request('/api/createshorturl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      originalUrl,
      ...(expiresAt ? { expiresAt } : {}),
    }),
  })
}

export function getMyShortUrls() {
  return request('/api/my/urls')
}

export function getShortUrlClicks(shortId) {
  return request(`/api/shorturl/${encodeURIComponent(shortId)}/clicks`)
}

export function deleteExpiredShortUrl(shortId) {
  return request(`/api/shorturl/${encodeURIComponent(shortId)}`, {
    method: 'DELETE',
  })
}
