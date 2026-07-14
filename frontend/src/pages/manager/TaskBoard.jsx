import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getTasks, createTask, updateTask, deleteTask, getInterns } from '../../api/api'
import { PageHeader, StatusBadge, Btn, Modal, Field, Input, Select, Textarea, Spinner, ErrorMsg } from '../../components/common/index'

const COLS = [
  { key: 'todo',        label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done',        label: 'Done' },
]
const empty = { title: '', description: '', intern: '', due_date: '', status: 'todo' }

export default function ManagerTaskBoard() {
  const { token } = useAuth()
  const [tasks, setTasks]     = useState([])
  const [interns, setInterns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm]       = useState(empty)
  const [saving, setSaving]   = useState(false)

  const load = () =>
    Promise.all([getTasks(token), getInterns(token)])
      .then(([t, i]) => { setTasks(t); setInterns(i) })
      .catch(() => setError('Failed to load task board.'))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [token])

  const handleCreate = async () => {
    setSaving(true)
    try { await createTask(token, { ...form, intern: Number(form.intern) }); setModalOpen(false); setForm(empty); load() }
    catch { setError('Could not create task.') }
    finally { setSaving(false) }
  }

  const moveTask = async (task, newStatus) => {
    await updateTask(token, task.id, { status: newStatus })
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
  }

  const removeTask = async (id) => {
    if (!confirm('Delete this task?')) return
    await deleteTask(token, id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const internName = (id) => interns.find(i => i.id === id)?.name || '—'

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Task Board" subtitle="Assign and track intern tasks" action={<Btn onClick={() => { setForm(empty); setModalOpen(true) }}>+ Add Task</Btn>} />
      <ErrorMsg msg={error} />

      <div style={{ display: 'flex', gap: 16 }}>
        {COLS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key)
          return (
            <div key={col.key} style={colStyle}>
              <div style={colHeader}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{col.label}</span>
                <span style={colCount}>{colTasks.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {colTasks.map(task => (
                  <div key={task.id} style={taskCard}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{task.title}</div>
                    {task.description && <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>{task.description}</div>}
                    <div style={{ fontSize: 12, color: '#3B82F6', marginBottom: 8 }}>👤 {internName(task.intern)}</div>
                    {task.due_date && <div style={{ fontSize: 11, color: '#F59E0B' }}>Due: {task.due_date}</div>}
                    <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                      {COLS.filter(c => c.key !== col.key).map(c => (
                        <button key={c.key} onClick={() => moveTask(task, c.key)} style={moveBtn}>→ {c.label}</button>
                      ))}
                      <button onClick={() => removeTask(task.id)} style={{ ...moveBtn, color: '#EF4444', borderColor: '#FCA5A5' }}>Delete</button>
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && <div style={{ fontSize: 12, color: '#CBD5E1', textAlign: 'center', padding: 16 }}>No tasks</div>}
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Task">
        <Field label="Title"><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Description"><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
        <Field label="Assign to Intern">
          <Select value={form.intern} onChange={e => setForm({ ...form, intern: e.target.value })}>
            <option value="">Select intern…</option>
            {interns.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </Select>
        </Field>
        <Field label="Due Date"><Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></Field>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Btn onClick={handleCreate} disabled={saving}>{saving ? 'Saving…' : 'Create Task'}</Btn>
          <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  )
}

const colStyle = { flex: 1, background: '#F8FAFC', borderRadius: 12, padding: 14, border: '1px solid #E2E8F0', minWidth: 240 }
const colHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }
const colCount  = { background: '#E2E8F0', color: '#475569', borderRadius: 99, fontSize: 11, fontWeight: 700, padding: '2px 8px' }
const taskCard  = { background: '#fff', borderRadius: 10, padding: '12px 14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }
const moveBtn   = { padding: '3px 10px', borderRadius: 6, border: '1px solid #E2E8F0', background: '#fff', fontSize: 11, cursor: 'pointer', color: '#475569' }
