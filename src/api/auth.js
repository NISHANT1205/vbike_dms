import { API_URL } from '../config/api'

export async function loginRequest({ email, password, role }) {
  const res = await fetch(`${API_URL}/dealers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  })

  const data = await res.json()

  if (!res.ok || data.status !== 'success') {
    throw new Error(data.message || 'Login failed. Please check your credentials.')
  }

  return data
}

/* Returns Bearer auth header using the stored token.
   Import this wherever you make authenticated API calls. */
export function getAuthHeaders() {
  try {
    const token = localStorage.getItem('vbike_token') || ''
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}
