import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getTasks, updateTask } from '../../api/api'
import { PageHeader, Spinner, ErrorMsg } from '../../components/common/index'

const COLS = [
  { key: 'todo',        label: 'To Do',       color: '#F1F5F9' },
  { key: 'in_progress', label: 'In Progress',  color: '#EFF6FF' },
  { key: 'done',        label: 'Done',         color: '#F0FDF4' },
]

export default function InternMyTasks() {
  const { token } = useAuth()
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    getTasks(token)
      .then(setTasks)
      .catch(() => setError('Failed to load tasks.'))
      .finally(() => setLoading(false))
  }, [token])

  const moveTask = async (task, newStatus) => {
    await updateTask(token, task.id, { status: newStatus })
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
  }

  const isOverdue = (due) => due && new Date(due) < new Date()

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="My Tasks" subtitle="Track your assigned work" />
      <ErrorMsg msg={error} />

      <div style={{ display: 'flex', gap: 16 }}>
        {COLS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key)
          return (
            <div key={col.key} style={{ flex: 1, background: col.color, borderRadius: 12, padding: 14, border: '1px solid #E2E8F0', minWidth: 220 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{col.label}</span>
                <span style={{ background: '#E2E8F0', color: '#475569', borderRadius: 99, fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>{colTasks.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {colTasks.map(task => (
                  <div key={task.id} style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{task.title}</div>
                    {task.description && <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>{task.description}</div>}
                    {task.due_date && (
                      <div style={{ fontSize: 11, color: isOverdue(task.due_date) ? '#EF4444' : '#F59E0B', marginBottom: 8, fontWeight: 600 }}>
                        {isOverdue(task.due_date) ? '⚠ Overdue: ' : '📅 Due: '}{task.due_date}
                      </div>
                    )}
                    {/* Status selector */}
                    <select
                      value={task.status}
                      onChange={e => moveTask(task, e.target.value)}
                      style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', width: '100%' }}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                ))}
                {colTasks.length === 0 && <div style={{ fontSize: 12, color: '#CBD5E1', textAlign: 'center', padding: 16 }}>Nothing here</div>}
              </div>
            </div>
          )
        })}
      </div>

      {tasks.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: 48, color: '#94A3B8' }}>
          No tasks assigned yet. Check back soon.
        </div>
      )}
    </div>
  )
}
