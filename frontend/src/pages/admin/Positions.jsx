import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getPositions, createPosition, updatePosition, deletePosition } from '../../api/api'
import { PageHeader, StatusBadge, Btn, Modal, Field, Input, Select, Textarea, Spinner, ErrorMsg, Card } from '../../components/common/index'

const empty = { title: '', department: '', description: '', status: 'open' }

export default function AdminPositions() {
  const { token } = useAuth()
  const [positions, setPositions] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm]           = useState(empty)
  const [editing, setEditing]     = useState(null)
  const [saving, setSaving]       = useState(false)

  const load = () => getPositions(token).then(setPositions).catch(() => setError('Failed to load positions.')).finally(() => setLoading(false))
  useEffect(() => { load() }, [token])

  const openCreate = () => { setForm(empty); setEditing(null); setModalOpen(true) }
  const openEdit   = (p) => { setForm({ title: p.title, department: p.department, description: p.description, status: p.status }); setEditing(p.id); setModalOpen(true) }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) await updatePosition(token, editing, form)
      else          await createPosition(token, form)
      setModalOpen(false)
      load()
    } catch { setError('Could not save position.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this position?')) return
    await deletePosition(token, id)
    load()
  }

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Positions" subtitle="Manage open internship positions" action={<Btn onClick={openCreate}>+ New Position</Btn>} />
      <ErrorMsg msg={error} />

      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr>
              {['Title', 'Department', 'Status', 'Created', 'Actions'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>No positions yet. Create one to get started.</td></tr>
            )}
            {positions.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={td}><span style={{ fontWeight: 600 }}>{p.title}</span></td>
                <td style={td}>{p.department}</td>
                <td style={td}><StatusBadge status={p.status} /></td>
                <td style={td}>{new Date(p.created_at).toLocaleDateString()}</td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Btn variant="secondary" onClick={() => openEdit(p)}>Edit</Btn>
                    <Btn variant="danger"    onClick={() => handleDelete(p.id)}>Delete</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Position' : 'New Position'}>
        <Field label="Title"><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Software Engineering Intern" /></Field>
        <Field label="Department"><Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="e.g. Engineering" /></Field>
        <Field label="Description"><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Role description..." /></Field>
        <Field label="Status">
          <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </Select>
        </Field>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn>
          <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  )
}

const th = { textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #E2E8F0' }
const td = { padding: '12px 14px', verticalAlign: 'middle' }
