import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getEvaluations, createEvaluation, getInterns } from '../../api/api'
import { PageHeader, StatusBadge, Btn, Textarea, Field, Spinner, ErrorMsg, Card } from '../../components/common/index'

export default function InternMyEvaluation() {
  const { token } = useAuth()
  const [evals, setEvals]     = useState([])
  const [intern, setIntern]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [selected, setSelected] = useState(null)
  const [selfNote, setSelfNote] = useState('')
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    Promise.all([getEvaluations(token), getInterns(token)])
      .then(([e, i]) => { setEvals(e); setIntern(i[0] || null) })
      .catch(() => setError('Failed to load evaluations.'))
      .finally(() => setLoading(false))
  }, [token])

  const handleSelfEval = async () => {
    if (!intern || !selfNote.trim()) { setError('Write something before submitting.'); return }
    setSaving(true); setError('')
    try {
      await createEvaluation(token, {
        intern: intern.id, period: 'final',
        scores: {}, comments: selfNote, internal_notes: ''
      })
      setSuccess('Self-evaluation submitted.')
      setSelfNote('')
      getEvaluations(token).then(setEvals)
    } catch { setError('Could not submit self-evaluation.') }
    finally { setSaving(false) }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="My Evaluations" subtitle="View your performance feedback" />
      <ErrorMsg msg={error} />
      {success && <div style={{ background: '#DCFCE7', color: '#15803D', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Evaluation list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {evals.length === 0 && <Card><p style={{ color: '#94A3B8' }}>No evaluations yet.</p></Card>}
          {evals.map(e => (
            <Card
              key={e.id}
              style={{ cursor: 'pointer', border: selected?.id === e.id ? '2px solid #3B82F6' : '1px solid #E2E8F0' }}
              onClick={() => setSelected(e)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <StatusBadge status={e.period} />
                <span style={{ fontSize: 12, color: '#94A3B8' }}>{new Date(e.created_at).toLocaleDateString()}</span>
              </div>

              {e.scores && Object.keys(e.scores).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {Object.entries(e.scores).map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#475569', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[1,2,3,4,5].map(n => (
                          <div key={n} style={{ width: 14, height: 14, borderRadius: 3, background: n <= val ? '#3B82F6' : '#E2E8F0' }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Detail + self eval */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selected && (
            <Card>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Feedback</h3>
              {selected.comments
                ? <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7 }}>{selected.comments}</p>
                : <p style={{ fontSize: 14, color: '#94A3B8' }}>No written feedback provided.</p>
              }
            </Card>
          )}

          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Self Evaluation</h3>
            <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 14 }}>Reflect on your internship experience.</p>
            <Field label="Your reflection">
              <Textarea
                value={selfNote}
                onChange={e => setSelfNote(e.target.value)}
                placeholder="What did you learn? What went well? What would you improve?"
                style={{ minHeight: 120 }}
              />
            </Field>
            <Btn onClick={handleSelfEval} disabled={saving}>{saving ? 'Submitting…' : 'Submit'}</Btn>
          </Card>
        </div>
      </div>
    </div>
  )
}
