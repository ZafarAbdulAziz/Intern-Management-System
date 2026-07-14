import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Auth
import Login from './pages/auth/Login'

// Admin
import AdminDashboard    from './pages/admin/Dashboard'
import AdminPositions    from './pages/admin/Positions'
import AdminApplications from './pages/admin/Applications'
import AdminInterns      from './pages/admin/Interns'
import AdminManagers     from './pages/admin/Managers'
import AdminOnboarding   from './pages/admin/Onboarding'
import AdminEvaluations  from './pages/admin/Evaluations'
import AdminOffboarding  from './pages/admin/Offboarding'

// Manager
import ManagerInterns     from './pages/manager/MyInterns'
import ManagerTasks       from './pages/manager/TaskBoard'
import ManagerEvaluations from './pages/manager/EvaluationForm'

// Intern
import InternProfile    from './pages/intern/MyProfile'
import InternOnboarding from './pages/intern/MyOnboarding'
import InternTasks      from './pages/intern/MyTasks'
import InternEvaluations from './pages/intern/MyEvaluation'

// Layout
import AppLayout from './components/layout/AppLayout'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: 40, color: '#475569' }}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

function RoleRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'Admin')   return <Navigate to="/admin/dashboard" replace />
  if (user.role === 'Manager') return <Navigate to="/manager/interns" replace />
  return <Navigate to="/intern/profile" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard"    element={<AdminDashboard />} />
            <Route path="positions"    element={<AdminPositions />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="interns"      element={<AdminInterns />} />
            <Route path="managers"     element={<AdminManagers />} />
            <Route path="onboarding"   element={<AdminOnboarding />} />
            <Route path="evaluations"  element={<AdminEvaluations />} />
            <Route path="offboarding"  element={<AdminOffboarding />} />
          </Route>

          {/* Manager routes */}
          <Route path="/manager" element={
            <ProtectedRoute allowedRoles={['Manager']}>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="interns"     element={<ManagerInterns />} />
            <Route path="tasks"       element={<ManagerTasks />} />
            <Route path="evaluations" element={<ManagerEvaluations />} />
          </Route>

          {/* Intern routes */}
          <Route path="/intern" element={
            <ProtectedRoute allowedRoles={['Intern']}>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="profile"     element={<InternProfile />} />
            <Route path="onboarding"  element={<InternOnboarding />} />
            <Route path="tasks"       element={<InternTasks />} />
            <Route path="evaluations" element={<InternEvaluations />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
