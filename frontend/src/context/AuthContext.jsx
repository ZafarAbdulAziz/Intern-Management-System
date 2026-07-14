import { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../api/api'

const defaultAuth = {
  user: null,
  token: null,
  login: async () => null,
  logout: () => {},
  loading: false,
}

const AuthContext = createContext(defaultAuth)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('ims_token') || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      setLoading(true)
      getMe(token)
        .then(data => setUser(data))
        .catch(() => { setToken(null); localStorage.removeItem('ims_token'); setUser(null) })
        .finally(() => setLoading(false))
    } else {
      setUser(null)
      setLoading(false)
    }
  }, [token])

  const login = async (accessToken) => {
    localStorage.setItem('ims_token', accessToken)
    setToken(accessToken)
    setLoading(true)

    try {
      const data = await getMe(accessToken)
      setUser(data)
      return data
    } catch (error) {
      localStorage.removeItem('ims_token')
      setToken(null)
      setUser(null)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('ims_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
