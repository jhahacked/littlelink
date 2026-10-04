import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import SiteHeader from './SiteHeader.jsx'
import { useAuth } from './useAuth.js'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

function LoginPage() {
  const { user, signIn } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const returnTo = new URLSearchParams(location.search).get('next')
  const destination = returnTo?.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/'

  if (user) return <Navigate to={destination} replace />

  async function handleCredential(response) {
    if (!response.credential) {
      setError('Google did not return a sign-in credential. Please try again.')
      return
    }

    setSigningIn(true)
    setError('')
    try {
      await signIn(response.credential)
      navigate(destination, { replace: true })
    } catch (signInError) {
      setError(signInError.message)
    } finally {
      setSigningIn(false)
    }
  }

  return (
    <main className="page-shell">
      <SiteHeader />
      <section className="login-page">
        <div className="eyebrow"><span /> YOUR LINKS, WHEREVER YOU GO</div>
        <h1>Welcome to <span>littlelink.</span></h1>
        <p className="intro">Sign in with Google to save your links and see them across devices.</p>
        <div className="login-card">
          {googleClientId
            ? <GoogleLogin onSuccess={handleCredential} onError={() => setError('Google sign-in was cancelled or could not be completed.')} />
            : <p className="form-error" role="alert">
              Google sign-in needs setup. Add <code>VITE_GOOGLE_CLIENT_ID</code> to the frontend environment and <code>GOOGLE_CLIENT_ID</code> to the backend environment.
            </p>}
          {signingIn && <p className="login-message" role="status">Signing you in…</p>}
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
