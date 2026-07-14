// ── StatusBadge ───────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    active:         { bg: '#DCFCE7', color: '#15803D' },
    completed:      { bg: '#F1F5F9', color: '#475569' },
    converted:      { bg: '#EFF6FF', color: '#1D4ED8' },
    open:           { bg: '#DCFCE7', color: '#15803D' },
    closed:         { bg: '#FEE2E2', color: '#DC2626' },
    applied:        { bg: '#EFF6FF', color: '#2563EB' },
    screened:       { bg: '#FEF3C7', color: '#B45309' },
    interviewed:    { bg: '#F3E8FF', color: '#7C3AED' },
    offered:        { bg: '#CFFAFE', color: '#0E7490' },
    accepted:       { bg: '#DCFCE7', color: '#15803D' },
    rejected:       { bg: '#FEE2E2', color: '#DC2626' },
    todo:           { bg: '#F1F5F9', color: '#475569' },
    in_progress:    { bg: '#EFF6FF', color: '#2563EB' },
    done:           { bg: '#DCFCE7', color: '#15803D' },
    pending:        { bg: '#FEF3C7', color: '#B45309' },
    complete:       { bg: '#DCFCE7', color: '#15803D' },
    'mid-point':    { bg: '#F3E8FF', color: '#7C3AED' },
    final:          { bg: '#EFF6FF', color: '#1D4ED8' },
    convert:        { bg: '#DCFCE7', color: '#15803D' },
    extend:         { bg: '#FEF3C7', color: '#B45309' },
    not_converting: { bg: '#FEE2E2', color: '#DC2626' },
  }
  const s = map[status] || { bg: '#F1F5F9', color: '#475569' }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 9999,
      fontSize: 12, fontWeight: 600,
      background: s.bg, color: s.color,
    }}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

// ── StatCard ──────────────────────────────────
export function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #E2E8F0',
      borderRadius: 12, padding: '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: accent || '#0F172A' }}>{value}</div>
    </div>
  )
}

// ── PageHeader ────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A' }}>{title}</h1>
        {subtitle && <p style={{ color: '#475569', marginTop: 2, fontSize: 14 }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ── Btn ───────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', type = 'button', disabled }) {
  const styles = {
    primary: { background: '#3B82F6', color: '#fff', border: 'none' },
    secondary: { background: '#fff', color: '#475569', border: '1px solid #E2E8F0' },
    danger: { background: '#EF4444', color: '#fff', border: 'none' },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {children}
    </button>
  )
}

// ── Card ──────────────────────────────────────
export function Card({ children, style }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #E2E8F0',
      borderRadius: 12, padding: 20,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Modal ─────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 14, padding: 28, width: 480, maxWidth: '90vw',
        boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#94A3B8' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Field ─────────────────────────────────────
export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

// ── Input ─────────────────────────────────────
export function Input({ ...props }) {
  return (
    <input {...props} style={{
      width: '100%', padding: '8px 12px', borderRadius: 8,
      border: '1px solid #E2E8F0', fontSize: 14, color: '#0F172A',
      outline: 'none', background: '#fff',
    }} />
  )
}

// ── Select ────────────────────────────────────
export function Select({ children, ...props }) {
  return (
    <select {...props} style={{
      width: '100%', padding: '8px 12px', borderRadius: 8,
      border: '1px solid #E2E8F0', fontSize: 14, color: '#0F172A',
      outline: 'none', background: '#fff',
    }}>
      {children}
    </select>
  )
}

// ── Textarea ──────────────────────────────────
export function Textarea({ ...props }) {
  return (
    <textarea {...props} style={{
      width: '100%', padding: '8px 12px', borderRadius: 8,
      border: '1px solid #E2E8F0', fontSize: 14, color: '#0F172A',
      outline: 'none', background: '#fff', minHeight: 90, resize: 'vertical',
    }} />
  )
}

// ── Spinner ───────────────────────────────────
export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <div style={{
        width: 28, height: 28, border: '3px solid #BFDBFE',
        borderTopColor: '#3B82F6', borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── ErrorMsg ──────────────────────────────────
export function ErrorMsg({ msg }) {
  if (!msg) return null
  return (
    <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
      {msg}
    </div>
  )
}

// ── ProgressBar ───────────────────────────────
export function ProgressBar({ value, max }) {
  const pct = max ? Math.round((value / max) * 100) : 0
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#94A3B8' }}>{value}/{max} complete</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#3B82F6' }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: '#E2E8F0', borderRadius: 99 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#3B82F6', borderRadius: 99, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

// ── Table ─────────────────────────────────────
export function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #E2E8F0' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '12px 14px', color: '#0F172A', verticalAlign: 'middle' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={headers.length} style={{ padding: '32px 14px', textAlign: 'center', color: '#94A3B8' }}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
