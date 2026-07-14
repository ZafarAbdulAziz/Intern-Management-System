import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getApplications, updateApplication, createApplication, getPositions } from '../../api/api'
import { PageHeader, StatusBadge, Btn, Modal, Field, Input, Select, Spinner, ErrorMsg } from '../../components/common/index'

const STAGES = ['applied', 'screened', 'interviewed', 'offered', 'accepted', 'rejected']
const STAGE_LABELS = { applied: 'Applied', screened: 'Screened', interviewed: 'Interviewed', offered: 'Offered', accepted: 'Accepted', rejected: 'Rejected' }
const empty = { position: '', candidate_name: '', email: '', university: '', resume_url: '', status: 'applied' }

export default function AdminApplications() {
  const { token } = useAuth()
  const [apps, setApps]           = useState([])
  const [positions, setPositions] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [selected, setSelected]   = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [newModal, setNewModal]   = useState(false)
  const [form, setForm]           = useState(empty)
  const [saving, setSaving]       = useState(false)

  const load = () =>
    Promise.all([getApplications(token), getPositions(token)])
      .then(([a, p]) => { setApps(a); setPositions(p) })
      .catch(() => setError('Failed to load applications.'))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [token])

  const openDetail = (app) => { setSelected(app); setModalOpen(true) }

  const changeStatus = async (id, status) => {
    await updateApplication(token, id, { status })
    load()
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }))
  }

  const handleCreate = async () => {
    setSaving(true)
    try { await createApplication(token, { ...form, position: Number(form.position) }); setNewModal(false); setForm(empty); load() }
    catch { setError('Could not create application.') }
    finally { setSaving(false) }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Applications" subtitle="Candidate pipeline" action={<Btn onClick={() => setNewModal(true)}>+ New Application</Btn>} />
      <ErrorMsg msg={error} />

      {/* Kanban board */}
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
        {STAGES.map(stage => {
          const stageApps = apps.filter(a => a.status === stage)
          return (
            <div key={stage} style={col}>
              <div style={colHeader}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{STAGE_LABELS[stage]}</span>
                <span style={colCount}>{stageApps.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stageApps.map(app => (
                  <div key={app.id} style={appCard} onClick={() => openDetail(app)}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{app.candidate_name}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>{app.university}</div>
                    <div style={{ fontSize: 12, color: '#3B82F6', marginTop: 4 }}>
                      {positions.find(p => p.id === app.position)?.title || '—'}
                    </div>
                  </div>
                ))}
                {stageApps.length === 0 && <div style={{ fontSize: 12, color: '#CBD5E1', padding: '12px 0', textAlign: 'center' }}>Empty</div>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Application Detail">
        {selected && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{selected.candidate_name}</div>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>{selected.university}</div>
              <div style={{ marginTop: 8 }}><StatusBadge status={selected.status} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16, fontSize: 13 }}>
              <div><span style={{ color: '#94A3B8' }}>Email:</span> {selected.email || '—'}</div>
              <div><span style={{ color: '#94A3B8' }}>Applied:</span> {selected.applied_date}</div>
              {selected.resume_url && <div><a href={selected.resume_url} target="_blank" rel="noreferrer" style={{ color: '#3B82F6' }}>View Resume ↗</a></div>}
            </div>
            {selected.interview_notes && (
              <div style={{ background: '#F8FAFC', borderRadius: 8, padding: 12, fontSize: 13, color: '#475569', marginBottom: 16 }}>
                <strong>Interview Notes:</strong> {selected.interview_notes}
              </div>
            )}
            <Field label="Move to stage">
              <Select value={selected.status} onChange={e => changeStatus(selected.id, e.target.value)}>
                {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </Select>
            </Field>
          </div>
        )}
      </Modal>

      {/* New application modal */}
      <Modal open={newModal} onClose={() => setNewModal(false)} title="New Application">
        <Field label="Position">
          <Select value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}>
            <option value="">Select position…</option>
            {positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </Select>
        </Field>
        <Field label="Candidate Name"><Input value={form.candidate_name} onChange={e => setForm({ ...form, candidate_name: e.target.value })} /></Field>
        <Field label="Email"><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="University"><Input value={form.university} onChange={e => setForm({ ...form, university: e.target.value })} /></Field>
        <Field label="Resume URL"><Input value={form.resume_url} onChange={e => setForm({ ...form, resume_url: e.target.value })} /></Field>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Btn onClick={handleCreate} disabled={saving}>{saving ? 'Saving…' : 'Create'}</Btn>
          <Btn variant="secondary" onClick={() => setNewModal(false)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  )
}

const col = { minWidth: 200, flex: '0 0 200px', background: '#F8FAFC', borderRadius: 12, padding: 14, border: '1px solid #E2E8F0' }
const colHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }
const colCount = { background: '#E2E8F0', color: '#475569', borderRadius: 99, fontSize: 11, fontWeight: 700, padding: '2px 8px' }
const appCard = { background: '#fff', borderRadius: 8, padding: '12px 14px', border: '1px solid #E2E8F0', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }
