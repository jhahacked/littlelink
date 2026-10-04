import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './AuthContext.jsx'
import './index.css'
import App from './App.jsx'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

const app = (
  <AuthProvider>
    <App />
  </AuthProvider>
)

const appWithGoogle = googleClientId
  ? <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>
  : app

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    {appWithGoogle}
  </BrowserRouter>
)
