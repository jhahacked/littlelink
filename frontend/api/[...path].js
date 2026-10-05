import { Buffer } from 'node:buffer'
import process from 'node:process'

export const config = {
  api: {
    bodyParser: false,
  },
}

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-encoding',
  'content-length',
  'host',
  'keep-alive',
  'transfer-encoding',
])

async function readRequestBody(request) {
  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  return Buffer.concat(chunks)
}

export default async function proxyApi(request, response) {
  const backendUrl = process.env.BACKEND_URL?.trim().replace(/\/+$/, '')
  if (!backendUrl) {
    response.status(503).json({ message: 'The API backend is not configured.' })
    return
  }

  try {
    const headers = new Headers()
    for (const [name, value] of Object.entries(request.headers)) {
      if (value && !HOP_BY_HOP_HEADERS.has(name.toLowerCase())) {
        headers.set(name, Array.isArray(value) ? value.join(', ') : value)
      }
    }

    const method = request.method || 'GET'
    const incomingUrl = new URL(request.url, 'http://localhost')
    const backendPath = incomingUrl.pathname.startsWith('/api/short/')
      ? incomingUrl.pathname.slice('/api/short'.length)
      : incomingUrl.pathname
    const body = method === 'GET' || method === 'HEAD'
      ? undefined
      : await readRequestBody(request)
    const upstream = await fetch(new URL(`${backendPath}${incomingUrl.search}`, backendUrl), {
      method,
      headers,
      body,
      redirect: 'manual',
    })

    response.status(upstream.status)
    upstream.headers.forEach((value, name) => {
      if (!HOP_BY_HOP_HEADERS.has(name.toLowerCase()) && name.toLowerCase() !== 'set-cookie') {
        response.setHeader(name, value)
      }
    })

    const cookies = upstream.headers.getSetCookie?.() || []
    if (cookies.length) response.setHeader('Set-Cookie', cookies)
    response.setHeader('Cache-Control', 'no-store')

    if (method === 'HEAD' || upstream.status === 204 || upstream.status === 304) {
      response.end()
      return
    }

    response.end(Buffer.from(await upstream.arrayBuffer()))
  } catch {
    response.status(502).json({ message: 'Could not reach the API backend.' })
  }
}
