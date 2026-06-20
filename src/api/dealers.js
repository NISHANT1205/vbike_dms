import { API_URL } from '../config/api'
import { getAuthHeaders } from './auth'

export async function fetchDealer(dealerId) {
  const res = await fetch(`${API_URL}/dealers/${dealerId}`, {
    headers: { ...getAuthHeaders() },
  })

  const json = await res.json()

  if (!res.ok || json.status !== 'success') {
    throw new Error(json.message || 'Failed to fetch profile.')
  }

  return json.data
}

// payload may include any subset of: phone, fullAddress, city, state, pincode,
// password + confirmPassword (password change is optional — omit both to keep it unchanged).
export async function updateDealer(dealerId, payload) {
  const res = await fetch(`${API_URL}/dealers/${dealerId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok || data.status !== 'success') {
    throw new Error(data.message || 'Failed to update profile.')
  }

  return data
}

export async function createDealer(payload) {
  const res = await fetch(`${API_URL}/dealers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok || data.status !== 'success') {
    throw new Error(data.message || 'Failed to onboard dealer.')
  }

  return data
}
