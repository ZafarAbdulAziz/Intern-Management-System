import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getInterns, createEvaluation, getEvaluations } from '../../api/api'
import { PageHeader, StatusBadge, Btn, Field, Select, Textarea, Spinner, ErrorMsg, Card } from '../../components/common/index'

const CRITERIA = ['Communication', 'Technical Skills', 'Initiative', 'Teamwork', 'Punctuality']
const defaultScores = Object.fromEntries(CRITERIA.map(c => [c.toLowerCase().replace(/ /g, '_'), 3]))

export default function ManagerEvaluationForm() {
  const { token } = useAuth()
  const [interns, setInterns]   = useState([])
  const [evals, setEvals]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [form, setForm]         = useState({ intern: '', period: 'mid-point', scores: defaultScores, comments: '', internal_notes: '' })
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    Promise.all([getInterns(token), getEvaluations(token)])
      .then(([i, e]) => { setInterns(i); setEvals(e) })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false))
  }, [token])

  const setScore = (key, val) => setForm(prev => ({ ...prev, scores: { ...prev.scores, [key]: val } }))

  const handleSubmit = async () => {
    if (!form.intern) { setError('Select an intern.'); return }
    setSaving(true); setError(''); setSuccess('')
    try {
      await createEvaluation(token, { ...form, intern: Number(form.intern) })
      setSuccess('Evaluation submitted successfully.')
      setForm({ intern: '', period: 'mid-point', scores: defaultScores, comments: '', internal_notes: '' })
      getEvaluations(token).then(setEvals)
    } catch { setError('Could not submit evaluation.') }
    finally { setSaving(false) }
  }

  const internName = (id) => interns.find(i => i.id === id)?.name || '—'

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Evaluations" subtitle="Submit intern evaluations" />
      <ErrorMsg msg={error} />
      {success && <div style={{ background: '#DCFCE7', color: '#15803D', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Form */}
        <Card>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>New Evaluation</h2>
          <Field label="Intern">
            <Select value={form.intern} onChange={e => setForm({ ...form, intern: e.target.value })}>
              <option value="">Select intern…</option>
              {interns.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </Select>
          </Field>
          <Field label="Period">
            <Select value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}>
              <option value="mid-point">Mid-Point</option>
              <option value="final">Final</option>
            </Select>
          </Field>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Scores</div>
            {CRITERIA.map(c => {
              const key = c.toLowerCase().replace(/ /g, '_')
              return (
                <div key={c} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 14, color: '#475569', width: 140 }}>{c}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setScore(key, n)} style={{
                        width: 32, height: 32, borderRadius: 8, border: '1px solid',
                        borderColor: form.scores[key] >= n ? '#3B82F6' : '#E2E8F0',
                        background: form.scores[key] >= n ? '#3B82F6' : '#fff',
                        color: form.scores[key] >= n ? '#fff' : '#94A3B8',
                        fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      }}>{n}</button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <Field label="Comments"><Textarea value={form.comments} onChange={e => setForm({ ...form, comments: e.target.value })} placeholder="Feedback visible to the intern…" /></Field>
          <Field label="Internal Notes (not visible to intern)"><Textarea value={form.internal_notes} onChange={e => setForm({ ...form, internal_notes: e.target.value })} placeholder="Private notes for HR/management…" /></Field>
          <Btn onClick={handleSubmit} disabled={saving}>{saving ? 'Submitting…' : 'Submit Evaluation'}</Btn>
        </Card>

        {/* Past evaluations */}
        <Card>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Past Evaluations</h2>
          {evals.length === 0 && <p style={{ color: '#94A3B8', fontSize: 14 }}>No evaluations submitted yet.</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {evals.map(e => (
              <div key={e.id} style={{ padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{internName(e.intern)}</span>
                  <StatusBadge status={e.period} />
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{new Date(e.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
