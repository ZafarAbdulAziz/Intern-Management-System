import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getInterns, getDocuments } from '../../api/api'
import { PageHeader, StatusBadge, Spinner, ErrorMsg, Card } from '../../components/common/index'

export default function InternProfile() {
  const { token, user } = useAuth()
  const [intern, setIntern]   = useState(null)
  const [docs, setDocs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    Promise.all([getInterns(token), getDocuments(token)])
      .then(([interns, documents]) => {
        setIntern(interns[0] || null)
        setDocs(documents)
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <Spinner />
  if (error)   return <ErrorMsg msg={error} />
  if (!intern) return <div style={{ color: '#94A3B8', padding: 32 }}>No profile found. Contact HR.</div>

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Your internship information" />

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'start' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #F1F5F9' }}>
            <div style={avatar}>{intern.name.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{intern.name}</div>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>{intern.program} · {intern.university}</div>
              <div style={{ marginTop: 6 }}><StatusBadge status={intern.status} /></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Department',  value: intern.department },
              { label: 'Manager',     value: intern.manager_name || '—' },
              { label: 'Start Date',  value: intern.start_date },
              { label: 'End Date',    value: intern.end_date },
              { label: 'University',  value: intern.university },
              { label: 'Program',     value: intern.program },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 14, color: '#0F172A', fontWeight: 500 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>My Documents</h2>
          {docs.length === 0 && <p style={{ color: '#94A3B8', fontSize: 14 }}>No documents submitted yet.</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {docs.map(doc => (
              <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{doc.type}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</div>
                </div>
                <StatusBadge status={doc.signed_status ? 'complete' : 'pending'} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

const avatar = {
  width: 56, height: 56, borderRadius: '50%', background: '#BFDBFE',
  color: '#1D4ED8', fontWeight: 800, fontSize: 18,
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
}
