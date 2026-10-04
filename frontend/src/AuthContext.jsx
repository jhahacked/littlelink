import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser, signInWithGoogle, signOut as signOutRequest } from './api.js'
import AuthContext from './authContext.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    let active = true
    getCurrentUser()
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser)
      })
      .catch((error) => {
        if (!active) return
        if (error.status !== 401) setAuthError(error.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function signIn(credential) {
    setAuthError('')
    const result = await signInWithGoogle(credential)
    setUser(result.user)
    return result.user
  }

  async function signOut() {
    try {
      await signOutRequest()
      setAuthError('')
      setUser(null)
    } catch (error) {
      setAuthError(error.message)
    }
  }

  const value = useMemo(
    () => ({ user, loading, authError, signIn, signOut }),
    [user, loading, authError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
