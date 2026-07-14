import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getInterns, getManagers, createIntern } from '../../api/api'
import { PageHeader, StatusBadge, Btn, Modal, Field, Input, Select, Spinner, ErrorMsg, Card } from '../../components/common/index'

const empty = {
  name: '', university: '', program: '', department: '',
  start_date: '', end_date: '', status: 'active',
  personal_email: '', phone: '', manager: '', username: '', password: ''
}

export default function AdminInterns() {
  const { token } = useAuth()
  const [interns, setInterns]   = useState([])
  const [managers, setManagers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')
  const [dept, setDept]         = useState('')
  const [status, setStatus]     = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm]         = useState(empty)
  const [saving, setSaving]     = useState(false)

  const load = () => Promise.all([getInterns(token), getManagers(token)])
    .then(([internData, managerData]) => {
      setInterns(internData)
      setFiltered(internData)
      setManagers(managerData)
    })
    .catch(() => setError('Failed to load interns or managers.'))
    .finally(() => setLoading(false))

  useEffect(() => { load() }, [token])

  useEffect(() => {
    let list = [...interns]
    if (search) list = list.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    if (dept)   list = list.filter(i => i.department === dept)
    if (status) list = list.filter(i => i.status === status)
    setFiltered(list)
  }, [search, dept, status, interns])

  const departments = [...new Set(interns.map(i => i.department))].filter(Boolean)

  const handleCreate = async () => {
    setSaving(true)
    try {
      if (!form.manager || !form.username.trim() || !form.password.trim()) {
        setError('Please provide a username, password, and manager for the new intern.')
        return
      }

      await createIntern(token, form)
      setModalOpen(false)
      setForm(empty)
      load()
    } catch {
      setError('Could not create intern.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Interns" subtitle="All intern profiles" action={<Btn onClick={() => setModalOpen(true)}>+ Add Intern</Btn>} />
      <ErrorMsg msg={error} />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name…" style={searchInput} />
        <select value={dept} onChange={e => setDept(e.target.value)} style={filterSelect}>
          <option value="">All departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} style={filterSelect}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="converted">Converted</option>
        </select>
      </div>

      <Card style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr>{['Name', 'Department', 'Manager', 'Start', 'End', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>No interns found.</td></tr>}
            {filtered.map(i => (
              <tr key={i.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={td}><span style={{ fontWeight: 600 }}>{i.name}</span><div style={{ fontSize: 12, color: '#94A3B8' }}>{i.university}</div></td>
                <td style={td}>{i.department}</td>
                <td style={td}>{i.manager_name || '—'}</td>
                <td style={td}>{i.start_date}</td>
                <td style={td}>{i.end_date}</td>
                <td style={td}><StatusBadge status={i.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Intern">
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <Field label="Full Name"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="University"><Input value={form.university} onChange={e => setForm({ ...form, university: e.target.value })} /></Field>
          <Field label="Program"><Input value={form.program} onChange={e => setForm({ ...form, program: e.target.value })} /></Field>
          <Field label="Department"><Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Start Date"><Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></Field>
            <Field label="End Date"><Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></Field>
          </div>
          <Field label="Personal Email"><Input type="email" value={form.personal_email} onChange={e => setForm({ ...form, personal_email: e.target.value })} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Assign Manager">
            <Select value={form.manager} onChange={e => setForm({ ...form, manager: e.target.value })}>
              <option value="">Select manager…</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>{manager.name || manager.username}</option>
              ))}
            </Select>
          </Field>
          <Field label="Intern Username"><Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} /></Field>
          <Field label="Intern Password"><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></Field>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <Btn onClick={handleCreate} disabled={saving}>{saving ? 'Saving…' : 'Create Intern'}</Btn>
          <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  )
}

const th = { textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #E2E8F0' }
const td = { padding: '12px 14px', verticalAlign: 'middle' }
const searchInput = { padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14, width: 220 }
const filterSelect = { padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14 }
