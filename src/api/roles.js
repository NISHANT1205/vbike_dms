import { API_URL } from '../config/api'

export async function fetchRoles() {
  const res = await fetch(`${API_URL}/dealer-roles`)
  const data = await res.json()

  if (!res.ok || data.status !== 'success') {
    throw new Error(data.message || 'Failed to fetch roles.')
  }

  return data.data.filter((r) => r.status)
}
