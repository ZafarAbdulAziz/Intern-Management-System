import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { PageHeader, Card, Btn } from '../../components/common/index'
import { changePassword } from '../../api/api'

export default function ChangePassword() {
  const { token: authToken } = useAuth()
  const token = authToken || localStorage.getItem('ims_token')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('')
    if (!token) {
      setMessage('You must be logged in to update your password.')
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match.')
      return
    }

    try {
      await changePassword(token, {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
      setStatus('success')
      setMessage('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      let msg = 'Failed to update password.'
      try {
        const payload = JSON.parse(error.message)
        if (payload.current_password) msg = payload.current_password[0]
        else if (payload.confirm_password) msg = payload.confirm_password[0]
        else if (payload.new_password) msg = payload.new_password[0]
        else if (payload.detail) msg = payload.detail
        else if (typeof payload === 'string') msg = payload
        else if (payload && typeof payload === 'object') {
          msg = Object.values(payload).flat().join(' ')
        }
      } catch (_) {
        msg = error.message
      }
      setStatus('error')
      setMessage(msg)
      console.error('Password change error:', error)
    }
  }

  return (
    <div>
      <PageHeader title="Change Password" subtitle="Update your account password." />
      <Card>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 6, fontSize: 14, color: '#475569' }}>
            Current Password
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0' }}
            />
          </label>

          <label style={{ display: 'grid', gap: 6, fontSize: 14, color: '#475569' }}>
            New Password
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0' }}
            />
          </label>

          <label style={{ display: 'grid', gap: 6, fontSize: 14, color: '#475569' }}>
            Confirm Password
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0' }}
            />
          </label>

          {message && <div style={{ color: '#475569', fontSize: 13 }}>{message}</div>}
          <Btn type="submit">Save new password</Btn>
        </form>
      </Card>
    </div>
  )
}
