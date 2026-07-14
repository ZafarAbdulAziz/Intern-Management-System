import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getInterns, getTasks } from '../../api/api'
import { PageHeader, StatusBadge, Spinner, ErrorMsg } from '../../components/common/index'

export default function ManagerMyInterns() {
  const { token } = useAuth()
  const [interns, setInterns] = useState([])
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    Promise.all([getInterns(token), getTasks(token)])
      .then(([i, t]) => { setInterns(i); setTasks(t) })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <Spinner />
  if (error)   return <ErrorMsg msg={error} />

  return (
    <div>
      <PageHeader title="My Interns" subtitle={`${interns.length} intern${interns.length !== 1 ? 's' : ''} assigned to you`} />

      {interns.length === 0 && <p style={{ color: '#94A3B8' }}>No interns assigned yet.</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {interns.map(intern => {
          const internTasks = tasks.filter(t => t.intern === intern.id)
          const done  = internTasks.filter(t => t.status === 'done').length
          const total = internTasks.length
          const pct   = total ? Math.round((done / total) * 100) : 0

          return (
            <div key={intern.id} style={card}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={avatar}>{intern.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                <StatusBadge status={intern.status} />
              </div>

              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{intern.name}</div>
              <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>{intern.department}</div>
              <div style={{ fontSize: 12, color: '#475569', marginBottom: 16 }}>{intern.university}</div>

              {/* Dates */}
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#475569', marginBottom: 16 }}>
                <span>📅 {intern.start_date}</span>
                <span>→ {intern.end_date}</span>
              </div>

              {/* Task progress ring */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg width={44} height={44} viewBox="0 0 44 44">
                  <circle cx={22} cy={22} r={18} fill="none" stroke="#E2E8F0" strokeWidth={4} />
                  <circle
                    cx={22} cy={22} r={18} fill="none" stroke="#3B82F6" strokeWidth={4}
                    strokeDasharray={`${2 * Math.PI * 18}`}
                    strokeDashoffset={`${2 * Math.PI * 18 * (1 - pct / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 22 22)"
                  />
                  <text x={22} y={26} textAnchor="middle" fontSize={10} fontWeight={700} fill="#0F172A">{pct}%</text>
                </svg>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{done}/{total} tasks done</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>Task completion</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const card = {
  background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14,
  padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
}
const avatar = {
  width: 42, height: 42, borderRadius: '50%', background: '#BFDBFE',
  color: '#1D4ED8', fontWeight: 800, fontSize: 14,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
