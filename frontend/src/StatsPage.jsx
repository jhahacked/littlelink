import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getShortUrlClicks } from './api.js'
import SiteHeader from './SiteHeader.jsx'
import { buildShortUrl, extractShortId } from './utils.js'

function StatsPage() {
  const { shortId } = useParams()
  const navigate = useNavigate()
  const [lookup, setLookup] = useState('')
  const [lookupState, setLookupState] = useState({ shortId: null, stats: null, error: '' })
  const loading = Boolean(shortId) && lookupState.shortId !== shortId
  const stats = lookupState.shortId === shortId ? lookupState.stats : null
  const error = lookupState.shortId === shortId ? lookupState.error : ''

  useEffect(() => {
    if (!shortId) return

    let active = true

    getShortUrlClicks(shortId)
      .then((result) => {
        if (active) setLookupState({ shortId, stats: result, error: '' })
      })
      .catch((requestError) => {
        if (active) setLookupState({ shortId, stats: null, error: requestError.message })
      })

    return () => {
      active = false
    }
  }, [shortId])

  function handleLookup(event) {
    event.preventDefault()
    const id = extractShortId(lookup)
    if (id) navigate(`/stats/${encodeURIComponent(id)}`)
  }

  return (
    <main className="page-shell">
      <SiteHeader />

      <section className="stats-page">
        <div className="eyebrow"><span /> LINK LOOKUP</div>
        <h1>How’s your link <span>doing?</span></h1>
        <p className="intro">Enter a short link or its code to see how many times it has been opened.</p>

        <form className="url-form stats-form" onSubmit={handleLookup}>
          <label htmlFor="short-url">Short URL or code</label>
          <div className="input-row">
            <span className="link-icon" aria-hidden="true">↗</span>
            <input
              id="short-url"
              type="text"
              placeholder="http://localhost:5000/abc123"
              value={lookup}
              onChange={(event) => setLookup(event.target.value)}
              required
            />
            <button type="submit">Check clicks <span aria-hidden="true">→</span></button>
          </div>
        </form>

        {loading && <p className="stats-message" role="status">Checking your link…</p>}
        {error && <p className="form-error stats-message" role="alert">{error}</p>}
        {stats && (
          <section className="stats-card" aria-live="polite">
            <div className="result-icon" aria-hidden="true">↗</div>
            <div className="result-content">
              <span>Short link</span>
              <a href={buildShortUrl(stats.shortId)} target="_blank" rel="noreferrer">
                {buildShortUrl(stats.shortId)}
              </a>
            </div>
            <div className="click-count">
              <strong>{stats.clicks}</strong>
              <span>{stats.clicks === 1 ? 'click' : 'clicks'}</span>
            </div>
          </section>
        )}
      </section>

      <footer className="footer">
        <span>Long links out. Little links in.</span>
        <span className="footer-spark" aria-hidden="true">✳</span>
      </footer>
    </main>
  )
}

export default StatsPage
