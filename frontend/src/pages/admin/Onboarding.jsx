import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getInterns, getOnboarding, updateOnboarding } from '../../api/api'
import { PageHeader, ProgressBar, StatusBadge, Spinner, ErrorMsg, Card } from '../../components/common/index'

export default function AdminOnboarding() {
  const { token } = useAuth()
  const [interns, setInterns]     = useState([])
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [expanded, setExpanded]   = useState(null)

  useEffect(() => {
    Promise.all([getInterns(token), getOnboarding(token)])
      .then(([i, o]) => { setInterns(i); setItems(o) })
      .catch(() => setError('Failed to load onboarding data.'))
      .finally(() => setLoading(false))
  }, [token])

  const toggle = async (item) => {
    const newStatus = item.status === 'complete' ? 'pending' : 'complete'
    await updateOnboarding(token, item.id, { status: newStatus, completed_date: newStatus === 'complete' ? new Date().toISOString().split('T')[0] : null })
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i))
  }

  if (loading) return <Spinner />
  if (error)   return <ErrorMsg msg={error} />

  return (
    <div>
      <PageHeader title="Onboarding Tracker" subtitle="Track onboarding progress for all interns" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {interns.length === 0 && <p style={{ color: '#94A3B8' }}>No interns found.</p>}
        {interns.map(intern => {
          const internItems = items.filter(i => i.intern === intern.id)
          const done = internItems.filter(i => i.status === 'complete').length
          const isOpen = expanded === intern.id
          return (
            <Card key={intern.id} style={{ padding: 0 }}>
              <div
                style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => setExpanded(isOpen ? null : intern.id)}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{intern.name}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>{intern.department}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, minWidth: 240 }}>
                  <div style={{ flex: 1 }}><ProgressBar value={done} max={internItems.length || 1} /></div>
                  <StatusBadge status={intern.status} />
                  <span style={{ color: '#94A3B8', fontSize: 18 }}>{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>

              {isOpen && (
                <div style={{ borderTop: '1px solid #F1F5F9', padding: '0 20px 16px' }}>
                  {internItems.length === 0 && <p style={{ color: '#94A3B8', padding: '16px 0' }}>No checklist items.</p>}
                  {internItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F8FAFC' }}>
                      <input
                        type="checkbox"
                        checked={item.status === 'complete'}
                        onChange={() => toggle(item)}
                        style={{ width: 16, height: 16, accentColor: '#3B82F6', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1, fontSize: 14, color: item.status === 'complete' ? '#94A3B8' : '#0F172A', textDecoration: item.status === 'complete' ? 'line-through' : 'none' }}>
                        {item.item}
                      </div>
                      <StatusBadge status={item.status} />
                      {item.completed_date && <span style={{ fontSize: 12, color: '#94A3B8' }}>{item.completed_date}</span>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
