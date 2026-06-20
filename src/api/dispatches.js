import { API_URL } from '../config/api'
import { getAuthHeaders } from './auth'

export async function createDispatch({ purchaseOrder }) {
  const res = await fetch(`${API_URL}/dispatches/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ purchaseOrder }),
  })

  const data = await res.json()

  if (!res.ok || data.status !== 'success') {
    throw new Error(data.message || 'Failed to create dispatch.')
  }

  return data
}
