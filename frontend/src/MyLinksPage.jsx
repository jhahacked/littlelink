import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteExpiredShortUrl, getMyShortUrls } from './api.js'
import SiteHeader from './SiteHeader.jsx'
import { buildShortUrl } from './utils.js'

function isExpired(expiresAt) {
  return Boolean(expiresAt && new Date(expiresAt).getTime() <= Date.now())
}

function MyLinksPage() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const [copiedId, setCopiedId] = useState('')

  useEffect(() => {
    let active = true

    getMyShortUrls()
      .then(({ urls }) => {
        if (active) setLinks(urls)
      })
      .catch((error) => {
        if (active) setLoadError(error.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function handleCopy(shortId) {
    try {
      await navigator.clipboard.writeText(buildShortUrl(shortId))
      setCopiedId(shortId)
      window.setTimeout(() => setCopiedId(''), 1800)
    } catch {
      setActionError('Could not copy the link. Open it and copy the address instead.')
    }
  }

  async function handleDelete(link) {
    setActionError('')
    setDeletingId(link.shortId)
    try {
      await deleteExpiredShortUrl(link.shortId)
      setLinks((currentLinks) => currentLinks.filter((item) => item.shortId !== link.shortId))
    } catch (error) {
      setActionError(error.message)
    } finally {
      setDeletingId('')
    }
  }

  return (
    <main className="page-shell">
      <SiteHeader />

      <section className="links-page">
        <div className="eyebrow"><span /> YOUR LITTLE LINK LIBRARY</div>
        <h1>My <span>links.</span></h1>
        <p className="intro">Your links created in this browser, all in one place.</p>

        {loadError && <p className="form-error links-message" role="alert">{loadError}</p>}
        {actionError && <p className="form-error links-message" role="alert">{actionError}</p>}
        {loading && <p className="links-message" role="status">Loading your links…</p>}

        {!loading && !loadError && links.length === 0 && (
          <div className="empty-links">
            <span aria-hidden="true">↗</span>
            <p>No links saved here yet.</p>
            <Link to="/">Make your first little link <span aria-hidden="true">→</span></Link>
          </div>
        )}

        {!loading && links.length > 0 && (
          <div className="link-list">
            {links.map((link) => {
              const expired = isExpired(link.expiresAt)
              return (
                <article className="saved-link-card" key={link.shortId}>
                  <div className="saved-link-main">
                    <span className={`link-status${expired ? ' link-status--expired' : ''}`}>
                      <span />
                      {expired ? 'Expired' : 'Active'}
                    </span>
                    <a className="saved-short-url" href={buildShortUrl(link.shortId)} target="_blank" rel="noreferrer">
                      {buildShortUrl(link.shortId)}
                    </a>
                    <p className="saved-original-url" title={link.originalUrl}>{link.originalUrl}</p>
                  </div>
                  <div className="saved-link-meta">
                    <div className="saved-clicks">
                      <strong>{link.clicks}</strong>
                      <span>{link.clicks === 1 ? 'click' : 'clicks'}</span>
                    </div>
                    <div className="saved-link-actions">
                      <Link className="small-link-button" to={`/stats/${encodeURIComponent(link.shortId)}`}>Stats</Link>
                      <button className="small-link-button" type="button" onClick={() => handleCopy(link.shortId)}>
                        {copiedId === link.shortId ? 'Copied' : 'Copy'}
                      </button>
                      {expired && (
                        <button
                          className="small-link-button small-link-button--delete"
                          type="button"
                          disabled={deletingId === link.shortId}
                          onClick={() => handleDelete(link)}
                        >
                          {deletingId === link.shortId ? 'Deleting…' : 'Delete'}
                        </button>
                      )}
                    </div>
                    <span className="saved-date">
                      {link.expiresAt
                        ? `${expired ? 'Expired' : 'Expires'} ${new Date(link.expiresAt).toLocaleDateString()}`
                        : `Created ${new Date(link.createdAt).toLocaleDateString()}`}
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <footer className="footer">
        <span>Long links out. Little links in.</span>
        <span className="footer-spark" aria-hidden="true">✳</span>
      </footer>
    </main>
  )
}

export default MyLinksPage
