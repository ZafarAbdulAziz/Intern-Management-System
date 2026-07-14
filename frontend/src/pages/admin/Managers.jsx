import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getManagers, createManager, deleteManager } from '../../api/api'
import { PageHeader, Btn, Modal, Field, Input, Spinner, ErrorMsg, Card } from '../../components/common/index'

const empty = {
  username: '',
  email: '',
  password: '',
  first_name: '',
  last_name: ''
}

export default function AdminManagers() {
  const { token } = useAuth()
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = () => getManagers(token)
    .then(setManagers)
    .catch(() => setError('Failed to load managers.'))
    .finally(() => setLoading(false))

  useEffect(() => { load() }, [token])

  const handleCreate = async () => {
    setSaving(true)
    try {
      if (!form.username.trim() || !form.password.trim()) {
        setError('Please provide a username and password for the manager.')
        return
      }

      await createManager(token, { ...form, role: 'Manager' })
      setModalOpen(false)
      setForm(empty)
      load()
    } catch {
      setError('Could not create manager.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (managerId) => {
    if (!window.confirm('Delete this manager? This will also remove the login account.')) return
    try {
      await deleteManager(token, managerId)
      load()
    } catch {
      setError('Could not delete manager.')
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Managers" subtitle="Manage manager accounts and assigned interns" action={<Btn onClick={() => setModalOpen(true)}>+ Add Manager</Btn>} />
      <ErrorMsg msg={error} />

      <Card style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr>{['Manager', 'Email', 'Interns', 'Assigned Interns', 'Action'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {managers.length === 0 && <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>No managers yet.</td></tr>}
            {managers.map(manager => (
              <tr key={manager.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={td}><span style={{ fontWeight: 700 }}>{manager.name || manager.username}</span><div style={{ fontSize: 12, color: '#94A3B8' }}>{manager.username}</div></td>
                <td style={td}>{manager.email || '—'}</td>
                <td style={td}>{manager.intern_count || 0}</td>
                <td style={td}>{(manager.assigned_interns || []).join(', ') || '—'}</td>
                <td style={td}>
                  <Btn variant="danger" onClick={() => handleDelete(manager.id)}>Delete</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Manager">
        <Field label="Username"><Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} /></Field>
        <Field label="Email"><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Password"><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></Field>
        <Field label="First Name"><Input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} /></Field>
        <Field label="Last Name"><Input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} /></Field>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <Btn onClick={handleCreate} disabled={saving}>{saving ? 'Saving…' : 'Create Manager'}</Btn>
          <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  )
}

const th = { textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #E2E8F0' }
const td = { padding: '12px 14px', verticalAlign: 'middle' }
