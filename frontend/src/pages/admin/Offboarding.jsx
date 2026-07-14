import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getInterns, getOffboarding, updateOffboarding, getConversions, createConversion } from '../../api/api'
import { PageHeader, StatusBadge, ProgressBar, Btn, Modal, Field, Select, Textarea, Spinner, ErrorMsg, Card } from '../../components/common/index'

export default function AdminOffboarding() {
  const { token } = useAuth()
  const [interns, setInterns]         = useState([])
  const [offItems, setOffItems]       = useState([])
  const [conversions, setConversions] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [expanded, setExpanded]       = useState(null)
  const [convModal, setConvModal]     = useState(false)
  const [convForm, setConvForm]       = useState({ intern: '', decision: 'convert', notes: '' })
  const [saving, setSaving]           = useState(false)

  const load = () =>
    Promise.all([getInterns(token), getOffboarding(token), getConversions(token)])
      .then(([i, o, c]) => { setInterns(i); setOffItems(o); setConversions(c) })
      .catch(() => setError('Failed to load offboarding data.'))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [token])

  const toggle = async (item) => {
    const newStatus = item.status === 'complete' ? 'pending' : 'complete'
    await updateOffboarding(token, item.id, { status: newStatus, completed_date: newStatus === 'complete' ? new Date().toISOString().split('T')[0] : null })
    setOffItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i))
  }

  const handleConversion = async () => {
    setSaving(true)
    try { await createConversion(token, { ...convForm, intern: Number(convForm.intern) }); setConvModal(false); load() }
    catch { setError('Could not save conversion decision.') }
    finally { setSaving(false) }
  }

  const today = new Date()
  const in30  = new Date(today); in30.setDate(today.getDate() + 30)
  const ending = interns.filter(i => { const e = new Date(i.end_date); return e >= today && e <= in30 })
  const internName = (id) => interns.find(i => i.id === id)?.name || '—'

  if (loading) return <Spinner />
  if (error)   return <ErrorMsg msg={error} />

  return (
    <div>
      <PageHeader title="Offboarding & Conversions" subtitle="Manage intern exits and conversion decisions" />

      <h2 style={sectionTitle}>Ending within 30 Days</h2>
      {ending.length === 0 && <p style={{ color: '#94A3B8', marginBottom: 24 }}>No interns ending soon.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {ending.map(intern => {
          const items = offItems.filter(o => o.intern === intern.id)
          const done  = items.filter(i => i.status === 'complete').length
          const isOpen = expanded === intern.id
          return (
            <Card key={intern.id} style={{ padding: 0 }}>
              <div style={{ padding: '14px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => setExpanded(isOpen ? null : intern.id)}>
                <div>
                  <div style={{ fontWeight: 700 }}>{intern.name}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>Ends: {intern.end_date}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 220 }}>
                  <div style={{ flex: 1 }}><ProgressBar value={done} max={items.length || 1} /></div>
                  <span style={{ color: '#94A3B8' }}>{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>
              {isOpen && (
                <div style={{ borderTop: '1px solid #F1F5F9', padding: '0 20px 14px' }}>
                  {items.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: '1px solid #F8FAFC' }}>
                      <input type="checkbox" checked={item.status === 'complete'} onChange={() => toggle(item)} style={{ accentColor: '#3B82F6', cursor: 'pointer' }} />
                      <span style={{ flex: 1, color: item.status === 'complete' ? '#94A3B8' : '#0F172A', textDecoration: item.status === 'complete' ? 'line-through' : 'none' }}>{item.item}</span>
                      <StatusBadge status={item.status} />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={sectionTitle}>Conversion Decisions</h2>
        <Btn onClick={() => setConvModal(true)}>+ Add Decision</Btn>
      </div>
      <Card style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead><tr>{['Intern', 'Decision', 'Notes', 'Date'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {conversions.length === 0 && <tr><td colSpan={4} style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>No decisions recorded.</td></tr>}
            {conversions.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={td}><span style={{ fontWeight: 600 }}>{internName(c.intern)}</span></td>
                <td style={td}><StatusBadge status={c.decision} /></td>
                <td style={td}>{c.notes || '—'}</td>
                <td style={td}>{new Date(c.decided_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={convModal} onClose={() => setConvModal(false)} title="Conversion Decision">
        <Field label="Intern">
          <Select value={convForm.intern} onChange={e => setConvForm({ ...convForm, intern: e.target.value })}>
            <option value="">Select intern…</option>
            {interns.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </Select>
        </Field>
        <Field label="Decision">
          <Select value={convForm.decision} onChange={e => setConvForm({ ...convForm, decision: e.target.value })}>
            <option value="convert">Convert to Full-Time</option>
            <option value="extend">Extend Internship</option>
            <option value="not_converting">Not Converting</option>
          </Select>
        </Field>
        <Field label="Notes"><Textarea value={convForm.notes} onChange={e => setConvForm({ ...convForm, notes: e.target.value })} /></Field>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Btn onClick={handleConversion} disabled={saving}>{saving ? 'Saving…' : 'Save Decision'}</Btn>
          <Btn variant="secondary" onClick={() => setConvModal(false)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  )
}

const sectionTitle = { fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 14 }
const th = { textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #E2E8F0' }
const td = { padding: '12px 14px', verticalAlign: 'middle' }
