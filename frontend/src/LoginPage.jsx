import { GoogleLogin } from '@react-oauth/google'
import { Link, Navigate, useLocation } from 'react-router-dom'
import SiteHeader from './SiteHeader.jsx'
import { useAuth } from './useAuth.js'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

function LoginPage() {
  const { user } = useAuth()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const returnTo = searchParams.get('next')
  const destination = returnTo?.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/'
  const error = searchParams.get('error')

  if (user) return <Navigate to={destination} replace />

  return (
    <main className="page-shell">
      <SiteHeader />
      <section className="login-page">
        <div className="eyebrow"><span /> YOUR LINKS, WHEREVER YOU GO</div>
        <h1>Welcome to <span>littlelink.</span></h1>
        <p className="intro">Sign in with Google to save your links and see them across devices.</p>
        <div className="login-card">
          {googleClientId
            ? <GoogleLogin
              ux_mode="redirect"
              login_uri={`${window.location.origin}/api/auth/google/redirect`}
              state={destination}
            />
            : <p className="form-error" role="alert">
              Google sign-in needs setup. Add <code>VITE_GOOGLE_CLIENT_ID</code> to the frontend environment and <code>GOOGLE_CLIENT_ID</code> to the backend environment.
            </p>}
          {error && <p className="form-error login-message" role="alert">{error}</p>}
        </div>
        <Link className="login-back" to="/">Back to shortening links</Link>
      </section>
      <footer className="footer">
        <span>Long links out. Little links in.</span>
        <span className="footer-spark" aria-hidden="true">✳</span>
      </footer>
    </main>
  )
}

export default LoginPage
