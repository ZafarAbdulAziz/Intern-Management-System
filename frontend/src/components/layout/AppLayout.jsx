import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useRef, useState } from 'react'

const adminNav = [
  { to: '/admin/dashboard',    label: 'Dashboard' },
  { to: '/admin/positions',    label: 'Positions' },
  { to: '/admin/applications', label: 'Applications' },
  { to: '/admin/interns',      label: 'Interns' },
  { to: '/admin/managers',     label: 'Managers' },
  { to: '/admin/onboarding',   label: 'Onboarding' },
  { to: '/admin/evaluations',  label: 'Evaluations' },
  { to: '/admin/offboarding',  label: 'Offboarding' },
]
const managerNav = [
  { to: '/manager/interns',     label: 'My Interns' },
  { to: '/manager/tasks',       label: 'Task Board' },
  { to: '/manager/evaluations', label: 'Evaluations' },
]
const internNav = [
  { to: '/intern/profile',     label: 'My Profile' },
  { to: '/intern/onboarding',  label: 'Onboarding' },
  { to: '/intern/tasks',       label: 'My Tasks' },
  { to: '/intern/evaluations', label: 'Evaluations' },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems =
    user?.role === 'Admin'   ? adminNav :
    user?.role === 'Manager' ? managerNav : internNav

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const handleLogout = () => { logout(); navigate('/login') }
  const toggleMenu = () => setOpen(prev => !prev)

  useEffect(() => {
    const onClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div style={styles.shell}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>IMS</span>
        </div>

        <nav style={styles.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {})
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarFooter} ref={menuRef}>
          <div style={styles.userChip}>
            <div style={styles.avatar}>{initials}</div>
            <div>
              <div style={styles.userName}>{user?.name}</div>
              <div style={styles.userRole}>{user?.role}</div>
            </div>
          </div>

          <button onClick={toggleMenu} style={styles.settingsBtn} aria-haspopup="true" aria-expanded={open}>
            <span style={styles.settingsIcon}>⚙︎</span>
            Settings
          </button>

          {open && (
            <div style={styles.menu}>
              <button style={styles.menuItem} onClick={() => { navigate('settings/profile-picture'); setOpen(false) }}>
                Change profile picture
              </button>
              <button style={styles.menuItem} onClick={() => { navigate('settings/password'); setOpen(false) }}>
                Change password
              </button>
              <button style={styles.menuItem} onClick={handleLogout}>
                Log out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div style={styles.main}>
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

const styles = {
  shell: { display: 'flex', height: '100vh', overflow: 'hidden' },
  sidebar: {
    width: 240, background: '#fff', borderRight: '1px solid #E2E8F0',
    display: 'flex', flexDirection: 'column', flexShrink: 0,
  },
  logo: {
    padding: '20px 20px 16px',
    borderBottom: '1px solid #E2E8F0',
  },
  logoIcon: {
    fontSize: 20, fontWeight: 700, color: '#3B82F6', letterSpacing: '-0.5px',
  },
  nav: { flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 },
  navLink: {
    display: 'block', padding: '9px 12px', borderRadius: 8,
    color: '#475569', fontWeight: 500, fontSize: 14, transition: 'all 0.15s',
  },
  navLinkActive: { background: '#EFF6FF', color: '#2563EB', fontWeight: 600 },
  sidebarFooter: { padding: '16px', borderTop: '1px solid #E2E8F0' },
  userChip: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: {
    width: 34, height: 34, borderRadius: '50%', background: '#BFDBFE',
    color: '#1D4ED8', fontWeight: 700, fontSize: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  userName: { fontSize: 13, fontWeight: 600, color: '#0F172A' },
  userRole: { fontSize: 11, color: '#94A3B8' },
  settingsBtn: {
    width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #E2E8F0',
    background: '#fff', color: '#475569', fontSize: 13, fontWeight: 500,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    cursor: 'pointer',
  },
  settingsIcon: {
    fontSize: 15,
  },
  menu: {
    marginTop: 10, borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)', overflow: 'hidden',
  },
  menuItem: {
    width: '100%', textAlign: 'left', padding: '12px 14px', border: 'none',
    background: 'transparent', color: '#0F172A', fontSize: 14, cursor: 'pointer',
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  content: { flex: 1, overflowY: 'auto', padding: 28, background: '#F8FAFC' },
}
