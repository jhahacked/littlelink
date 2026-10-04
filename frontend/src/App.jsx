import { useState } from 'react'
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { createShortUrl } from './api.js'
import { useAuth } from './useAuth.js'
import LoginPage from './LoginPage.jsx'
import MyLinksPage from './MyLinksPage.jsx'
import SiteHeader from './SiteHeader.jsx'
import StatsPage from './StatsPage.jsx'
import { buildShortUrl } from './utils.js'

function getLocalDateTimeMin() {
  const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000)
  return now.toISOString().slice(0, 16)
}

function Courier({ stage }) {
  return (
    <svg
      className={`courier courier--${stage}`}
      viewBox="0 0 330 360"
      role="img"
      aria-label="A western courier carrying a parcel"
    >
      <ellipse cx="170" cy="338" rx="108" ry="12" fill="#e9e2d6" />
      <path d="m109 275-12 53h35l17-51m47-2 8 53h34l-3-66" fill="#604331" />
      <path d="m96 323-13 13c-3 4 0 9 5 9h48c5 0 7-4 5-8l-7-14m61 0 2 14c0 5 3 8 8 8h42c5 0 8-5 4-9l-15-14" fill="#362b27" />
      <path d="M113 177c-7 26-11 57-8 97 20 15 66 19 102 5l-8-101z" fill="#627f70" />
      <path d="m118 184 31 29 26-34 15 10-30 57-45-36z" fill="#f1eadc" />
      <path d="m150 212 18 14-12 22-16-16z" fill="#c66c4d" />
      <path d="m115 192-28 42 17 13 33-42m67-17 27 39-16 14-34-35" fill="#627f70" />
      <path d="m86 232-8 14c-2 5 2 9 7 8l18-5 7-13m91-1 13 14c4 4 8 4 11 0l7-14-11-12" fill="#d49b70" />
      <path d="M122 279h-13l-7 19 31 7 10-18m50-7 14 1 10 20-32 6-11-17" fill="#4d3930" />
      <path d="m130 144-3 28c7 15 37 20 51 1l-4-32z" fill="#d49b70" />
      <path d="M116 103c0-32 21-53 48-53 31 0 50 22 50 55v27c0 29-21 49-49 49-27 0-48-21-48-49z" fill="#dba87c" />
      <path d="M115 112c7-8 15-12 25-14 22-5 43-4 68 0v20l12-5c-1-44-22-69-56-69-31 0-53 25-53 64z" fill="#44342e" />
      <path d="M111 101c14-15 29-20 50-20 22 0 40 6 55 18l12-10c-14-18-38-29-67-29-27 0-50 10-64 28z" fill="#805a3b" />
      <path d="M99 91c18-10 40-15 69-15 28 0 51 5 68 15l-3 10c-21-6-42-9-65-9-24 0-46 3-66 9z" fill="#9b7048" />
      <path d="M151 124c5-4 11-4 16 0m24 0c5-4 11-4 16 0" fill="none" stroke="#49342b" strokeLinecap="round" strokeWidth="3" />
      <path d="M179 128v16l-8 4m-3 13c8 5 17 5 25-1" fill="none" stroke="#9a5c43" strokeLinecap="round" strokeWidth="3" />
      <path d="m118 190 18-13 17 25-13 17m36-3 15-35 19 9-17 40" fill="#f5efe4" />
      <path d="m135 202 18 12-10 17-18-13m48 10 8-19 17 8-10 21" fill="#c66c4d" />
      <path d="M38 187h99v74H38z" fill="#d79b55" />
      <path d="M38 187h99v14H38z" fill="#e8b76d" />
      <path d="m83 187 13-16 14 16m-27 74 13-17 14 17" fill="none" stroke="#bd8244" strokeWidth="4" />
      <path d="M80 219h16v17H80z" fill="#f2d4a5" />
      <path d="m142 216-18-17-14 15 17 20m39-15 17 3 3 18-22-4" fill="#dba87c" />
    </svg>
  )
}

function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [longUrl, setLongUrl] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [stage, setStage] = useState('idle')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!user) {
      navigate('/login?next=%2F')
      return
    }
    setShortUrl('')
    setStage('leaving')

    try {
      const originalUrl = longUrl.trim()
      const expiryDate = expiresAt ? new Date(expiresAt) : null
      const data = await createShortUrl(originalUrl, expiryDate?.toISOString())
      const resultUrl = buildShortUrl(data.shortId)
      setShortUrl(resultUrl)
      setStage('returning')
    } catch (requestError) {
      setError(requestError.message || 'Could not reach the server. Please try again.')
      setStage('idle')
    }
  }

  async function copyShortUrl() {
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('Could not copy the link. Please select and copy it instead.')
    }
  }

  return (
    <main className="page-shell">
      <SiteHeader />

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span /> YOUR FRIENDLY URL SHORTENER</div>
          <h1>That’s a long link.<br /><span>Let’s make it little.</span></h1>
          <p className="intro">Hand over that extra-long URL. Our courier will bring you back a neat little link.</p>

          <form className="url-form" onSubmit={handleSubmit}>
            <label htmlFor="long-url">Your long URL</label>
            <div className="input-row">
              <span className="link-icon" aria-hidden="true">↗</span>
              <input
                id="long-url"
                type="url"
                placeholder="https://something-really-long.com/..."
                value={longUrl}
                onChange={(event) => setLongUrl(event.target.value)}
                required
              />
              <button type="submit" disabled={stage === 'leaving'}>
                {stage === 'leaving' ? 'On the way…' : user ? 'Make it little' : 'Sign in to shorten'}
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <div className="expiry-field">
              <label htmlFor="expires-at">Expiration (optional)</label>
              <input
                id="expires-at"
                type="datetime-local"
                value={expiresAt}
                min={getLocalDateTimeMin()}
                onChange={(event) => setExpiresAt(event.target.value)}
              />
            </div>
            <p className="form-hint">Paste a full link, starting with https://</p>
            {error && <p className="form-error" role="alert">{error}</p>}
          </form>

          {shortUrl && (
            <section className="result-card" aria-live="polite" aria-label="Your short URL">
              <div className="result-icon" aria-hidden="true">✓</div>
              <div className="result-content">
                <span>Your little link is here</span>
                <a href={shortUrl} target="_blank" rel="noreferrer">{shortUrl}</a>
              </div>
              <button className="copy-button" type="button" onClick={copyShortUrl}>
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </section>
          )}
        </div>

        <div className="delivery-scene" aria-hidden="true">
          <div className="scene-sun" />
          <div className="scene-label">{stage === 'returning' ? 'DELIVERY COMPLETE' : 'EXPRESS DELIVERY'}</div>
          <div className="scene-ground" />
          <Courier stage={stage} />
          <div className="scene-package">
            <span>{stage === 'returning' ? 'SHORT URL' : 'LONG URL'}</span>
            <i>{stage === 'returning' ? '↗' : '•••'}</i>
          </div>
          <div className="scene-caption">
            <span className="caption-dot" />
            {stage === 'leaving' ? 'Off to shorten your link…' : stage === 'returning' ? 'Back with something smaller.' : 'Your link is in good hands.'}
          </div>
        </div>
      </section>

      <footer className="footer">
        <span>Long links out. Little links in.</span>
        <span className="footer-spark" aria-hidden="true">✳</span>
      </footer>
    </main>
  )
}

function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <main className="page-shell"><p className="links-message" role="status">Checking your sign-in…</p></main>
  }

  if (!user) {
    const next = `${location.pathname}${location.search}`
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />
  }

  return <Outlet />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/stats/:shortId" element={<StatsPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/links" element={<MyLinksPage />} />
      </Route>
      <Route path="*" element={<main className="not-found"><h1>Page not found</h1><Link to="/">Back to Littlelink</Link></main>} />
    </Routes>
  )
}

export default App
