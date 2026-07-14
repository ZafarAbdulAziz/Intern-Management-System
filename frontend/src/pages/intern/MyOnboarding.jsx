import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getOnboarding, updateOnboarding } from '../../api/api'
import { PageHeader, StatusBadge, ProgressBar, Spinner, ErrorMsg, Card } from '../../components/common/index'

export default function InternOnboarding() {
  const { token } = useAuth()
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    getOnboarding(token)
      .then(setItems)
      .catch(() => setError('Failed to load onboarding checklist.'))
      .finally(() => setLoading(false))
  }, [token])

  const toggle = async (item) => {
    // Interns can only mark pending → complete (not undo)
    if (item.status === 'complete') return
    const updated = { status: 'complete', completed_date: new Date().toISOString().split('T')[0] }
    await updateOnboarding(token, item.id, updated)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, ...updated } : i))
  }

  const done  = items.filter(i => i.status === 'complete').length
  const total = items.length

  if (loading) return <Spinner />
  if (error)   return <ErrorMsg msg={error} />

  return (
    <div>
      <PageHeader title="My Onboarding" subtitle="Complete these steps to get started" />

      <Card style={{ marginBottom: 20 }}>
        <ProgressBar value={done} max={total || 1} />
      </Card>

      <Card>
        {items.length === 0 && <p style={{ color: '#94A3B8' }}>No onboarding items yet.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {items.map(item => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 0', borderBottom: '1px solid #F8FAFC',
            }}>
              <div
                onClick={() => toggle(item)}
                style={{
                  width: 22, height: 22, borderRadius: 6, border: '2px solid',
                  borderColor: item.status === 'complete' ? '#3B82F6' : '#CBD5E1',
                  background: item.status === 'complete' ? '#3B82F6' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: item.status === 'complete' ? 'default' : 'pointer', flexShrink: 0,
                }}
              >
                {item.status === 'complete' && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>✓</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 14, fontWeight: 500,
                  color: item.status === 'complete' ? '#94A3B8' : '#0F172A',
                  textDecoration: item.status === 'complete' ? 'line-through' : 'none',
                }}>
                  {item.item}
                </div>
                {item.completed_date && (
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Completed {item.completed_date}</div>
                )}
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
