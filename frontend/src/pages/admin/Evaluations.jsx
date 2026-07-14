import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getEvaluations, getInterns } from '../../api/api'
import { PageHeader, StatusBadge, Modal, Spinner, ErrorMsg, Card } from '../../components/common/index'

export default function AdminEvaluations() {
  const { token } = useAuth()
  const [evals, setEvals]     = useState([])
  const [interns, setInterns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    Promise.all([getEvaluations(token), getInterns(token)])
      .then(([e, i]) => { setEvals(e); setInterns(i) })
      .catch(() => setError('Failed to load evaluations.'))
      .finally(() => setLoading(false))
  }, [token])

  const internName = (id) => interns.find(i => i.id === id)?.name || '—'

  if (loading) return <Spinner />
  if (error)   return <ErrorMsg msg={error} />

  return (
    <div>
      <PageHeader title="Evaluations" subtitle="All intern evaluations" />

      <Card style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr>{['Intern', 'Period', 'Date', 'Action'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {evals.length === 0 && <tr><td colSpan={4} style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>No evaluations yet.</td></tr>}
            {evals.map(e => (
              <tr key={e.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={td}><span style={{ fontWeight: 600 }}>{internName(e.intern)}</span></td>
                <td style={td}><StatusBadge status={e.period} /></td>
                <td style={td}>{new Date(e.created_at).toLocaleDateString()}</td>
                <td style={td}><button onClick={() => setSelected(e)} style={viewBtn}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Evaluation Details">
        {selected && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{internName(selected.intern)}</div>
              <StatusBadge status={selected.period} />
            </div>

            {selected.scores && Object.keys(selected.scores).length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Scores</div>
                {Object.entries(selected.scores).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#475569', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[1,2,3,4,5].map(n => (
                        <div key={n} style={{ width: 18, height: 18, borderRadius: 4, background: n <= val ? '#3B82F6' : '#E2E8F0' }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selected.comments && (
              <div style={{ background: '#F8FAFC', borderRadius: 8, padding: 12, fontSize: 13, color: '#475569', marginBottom: 12 }}>
                <strong>Comments:</strong> {selected.comments}
              </div>
            )}
            {selected.internal_notes && (
              <div style={{ background: '#FEF3C7', borderRadius: 8, padding: 12, fontSize: 13, color: '#92400E' }}>
                <strong>Internal Notes:</strong> {selected.internal_notes}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

const th = { textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #E2E8F0' }
const td = { padding: '12px 14px', verticalAlign: 'middle' }
const viewBtn = { padding: '5px 14px', borderRadius: 6, border: '1px solid #E2E8F0', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#3B82F6', fontWeight: 600 }
