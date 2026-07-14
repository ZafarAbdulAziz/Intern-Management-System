const BASE = '/api'

async function request(path, token, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (res.status === 401) {
    localStorage.removeItem('ims_token')
    window.location.href = '/login'
    return
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
  if (res.status === 204) return null
  return res.json()
}

// ── Auth ──────────────────────────────────────
export const loginApi = (username, password) =>
  request('/token/', null, { method: 'POST', body: JSON.stringify({ username, password }) })

export const getMe = (token) => request('/auth/me/', token)
export const getManagers = (token) => request('/managers/', token)
export const createManager = (token, data) => request('/managers/', token, { method: 'POST', body: JSON.stringify(data) })
export const deleteManager = (token, id) => request(`/managers/${id}/`, token, { method: 'DELETE' })

// ── Positions ─────────────────────────────────
export const getPositions  = (token) => request('/positions/', token)
export const createPosition = (token, data) => request('/positions/', token, { method: 'POST', body: JSON.stringify(data) })
export const updatePosition = (token, id, data) => request(`/positions/${id}/`, token, { method: 'PATCH', body: JSON.stringify(data) })
export const deletePosition = (token, id) => request(`/positions/${id}/`, token, { method: 'DELETE' })

// ── Applications ──────────────────────────────
export const getApplications  = (token) => request('/applications/', token)
export const createApplication = (token, data) => request('/applications/', token, { method: 'POST', body: JSON.stringify(data) })
export const updateApplication = (token, id, data) => request(`/applications/${id}/`, token, { method: 'PATCH', body: JSON.stringify(data) })

// ── Interns ───────────────────────────────────
export const getInterns  = (token) => request('/interns/', token)
export const getIntern   = (token, id) => request(`/interns/${id}/`, token)
export const createIntern = (token, data) => request('/interns/', token, { method: 'POST', body: JSON.stringify(data) })
export const updateIntern = (token, id, data) => request(`/interns/${id}/`, token, { method: 'PATCH', body: JSON.stringify(data) })

// ── Onboarding ────────────────────────────────
export const getOnboarding  = (token) => request('/onboarding/', token)
export const createOnboarding = (token, data) => request('/onboarding/', token, { method: 'POST', body: JSON.stringify(data) })
export const updateOnboarding = (token, id, data) => request(`/onboarding/${id}/`, token, { method: 'PATCH', body: JSON.stringify(data) })

// ── Documents ─────────────────────────────────
export const getDocuments = (token) => request('/documents/', token)
export const createDocument = (token, data) => request('/documents/', token, { method: 'POST', body: JSON.stringify(data) })

// ── Tasks ─────────────────────────────────────
export const getTasks  = (token) => request('/tasks/', token)
export const createTask = (token, data) => request('/tasks/', token, { method: 'POST', body: JSON.stringify(data) })
export const updateTask = (token, id, data) => request(`/tasks/${id}/`, token, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteTask = (token, id) => request(`/tasks/${id}/`, token, { method: 'DELETE' })

// ── Evaluations ───────────────────────────────
export const getEvaluations  = (token) => request('/evaluations/', token)
export const createEvaluation = (token, data) => request('/evaluations/', token, { method: 'POST', body: JSON.stringify(data) })
export const getEvaluation   = (token, id) => request(`/evaluations/${id}/`, token)

// ── Offboarding ───────────────────────────────
export const getOffboarding  = (token) => request('/offboarding/', token)
export const updateOffboarding = (token, id, data) => request(`/offboarding/${id}/`, token, { method: 'PATCH', body: JSON.stringify(data) })

// ── Conversions ───────────────────────────────
export const getConversions  = (token) => request('/conversions/', token)
export const createConversion = (token, data) => request('/conversions/', token, { method: 'POST', body: JSON.stringify(data) })
export const updateConversion = (token, id, data) => request(`/conversions/${id}/`, token, { method: 'PATCH', body: JSON.stringify(data) })
