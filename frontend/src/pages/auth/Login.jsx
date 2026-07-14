import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { loginApi } from '../../api/api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loginApi(username, password)
      const me = await login(data.access)

      if (me?.role === 'Admin') navigate('/admin/dashboard')
      else if (me?.role === 'Manager') navigate('/manager/interns')
      else navigate('/intern/profile')
    } catch {
      setError('Incorrect username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <span style={styles.logo}>Intern Management System</span>
        </div>
        <h1 style={styles.title}>Hello There!</h1>
        <p style={styles.sub}>Sign in to your account</p>

        {error && (
          <div style={styles.error}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoFocus
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
  },
  card: {
    background: '#fff', borderRadius: 16, padding: '40px 36px', width: 400,
    boxShadow: '0 8px 32px rgba(59,130,246,0.10)',
  },
  logoRow: { marginBottom: 24 },
  logo: { fontSize: 22, fontWeight: 800, color: '#3B82F6', letterSpacing: '-0.5px' },
  title: { fontSize: 22, fontWeight: 700, color: '#0F172A', marginBottom: 4 },
  sub: { fontSize: 14, color: '#94A3B8', marginBottom: 28 },
  error: {
    background: '#FEE2E2', color: '#DC2626', padding: '10px 14px',
    borderRadius: 8, fontSize: 13, marginBottom: 16,
  },
  field: { marginBottom: 16 },
  label: {
    display: 'block', fontSize: 12, fontWeight: 600, color: '#475569',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #E2E8F0', fontSize: 14, color: '#0F172A',
    outline: 'none', boxSizing: 'border-box',
  },
  btn: {
    width: '100%', padding: '11px 0', borderRadius: 8, border: 'none',
    background: '#3B82F6', color: '#fff', fontSize: 15, fontWeight: 700,
    cursor: 'pointer', marginTop: 8,
  },
}
