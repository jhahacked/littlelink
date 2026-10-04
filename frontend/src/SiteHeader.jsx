import { Link } from 'react-router-dom'
import { useAuth } from './useAuth.js'

function SiteHeader() {
  const { user, loading, authError, signOut } = useAuth()

  return (
    <header className="topbar">
      <Link className="brand" to="/" aria-label="Little Link home">
        <span className="brand-mark" aria-hidden="true">↗</span>
        littlelink
      </Link>
      <div className="topbar-actions">
        {authError && <span className="auth-error" role="alert">{authError}</span>}
        <span className="topbar-note">A shorter way around</span>
        <Link className="topbar-link" to="/stats">Link stats <span aria-hidden="true">→</span></Link>
        <Link className="topbar-link" to="/links">My links <span aria-hidden="true">→</span></Link>
        {!loading && (user
          ? <button className="topbar-button" type="button" onClick={signOut}>Sign out</button>
          : <Link className="topbar-link" to="/login">Sign in <span aria-hidden="true">→</span></Link>)}
      </div>
    </header>
  )
}

export default SiteHeader
