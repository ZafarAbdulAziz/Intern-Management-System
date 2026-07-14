import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getInterns, getPositions, getApplications, getOffboarding } from '../../api/api'
import { StatCard, PageHeader, Card, StatusBadge, Spinner, ErrorMsg } from '../../components/common/index'

export default function AdminDashboard() {
  const { token } = useAuth()
  const [interns, setInterns]         = useState([])
  const [positions, setPositions]     = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  useEffect(() => {
    Promise.all([getInterns(token), getPositions(token), getApplications(token)])
      .then(([i, p, a]) => { setInterns(i); setPositions(p); setApplications(a) })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <Spinner />
  if (error)   return <ErrorMsg msg={error} />

  const activeInterns   = interns.filter(i => i.status === 'active').length
  const openPositions   = positions.filter(p => p.status === 'open').length
  const pendingApps     = applications.filter(a => a.status === 'applied').length

  const today = new Date()
  const in30  = new Date(today); in30.setDate(today.getDate() + 30)
  const upcomingOffboard = interns.filter(i => {
    const end = new Date(i.end_date)
    return end >= today && end <= in30
  }).length

  const recent = [...interns].sort((a, b) => b.id - a.id).slice(0, 5)

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your intern program" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Active Interns"       value={activeInterns}    accent="#3B82F6" />
        <StatCard label="Open Positions"       value={openPositions}    accent="#10B981" />
        <StatCard label="Pending Applications" value={pendingApps}      accent="#F59E0B" />
        <StatCard label="Ending in 30 Days"    value={upcomingOffboard} accent="#EF4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card>
          <h2 style={s.sectionTitle}>Recent Interns</h2>
          {recent.length === 0 && <p style={s.empty}>No interns yet.</p>}
          {recent.map(i => (
            <div key={i.id} style={s.row}>
              <div>
                <div style={s.name}>{i.name}</div>
                <div style={s.meta}>{i.department}</div>
              </div>
              <StatusBadge status={i.status} />
            </div>
          ))}
        </Card>

        <Card>
          <h2 style={s.sectionTitle}>Open Positions</h2>
          {positions.filter(p => p.status === 'open').length === 0 && <p style={s.empty}>No open positions.</p>}
          {positions.filter(p => p.status === 'open').map(p => (
            <div key={p.id} style={s.row}>
              <div>
                <div style={s.name}>{p.title}</div>
                <div style={s.meta}>{p.department}</div>
              </div>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

const s = {
  sectionTitle: { fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#0F172A' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F1F5F9' },
  name: { fontSize: 14, fontWeight: 600, color: '#0F172A' },
  meta: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
  empty: { fontSize: 14, color: '#94A3B8', padding: '16px 0' },
}
