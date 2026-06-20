import { API_URL } from '../config/api'
import { getAuthHeaders } from './auth'

export async function raiseQuery({ dealer, subject, message }) {
  const res = await fetch(`${API_URL}/dealer-queries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ dealer, subject, message }),
  })

  const data = await res.json()

  if (!res.ok || data.status !== 'success') {
    throw new Error(data.message || 'Failed to raise query.')
  }

  return data
}

function mapQuery(q, dealerId) {
  const recipientId = q.recipient?._id || (typeof q.recipient === 'string' ? q.recipient : '')
  return {
    id:            q._id,
    rawDate:       q.createdAt,
    date:          q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-IN') : '—',
    subject:       q.subject || '—',
    dealer:        q.dealer?.companyName || '—',
    dealerId:      q.dealer?._id || (typeof q.dealer === 'string' ? q.dealer : ''),
    recipient:     q.recipientType === 'company' ? 'Company' : (q.recipient?.companyName || '—'),
    recipientId,
    recipientType: q.recipientType || 'dealer',
    status:        q.status ? q.status.charAt(0).toUpperCase() + q.status.slice(1) : '—',
    message:       q.message || '',
    response:      q.response || '',
    canRespond:    q.recipientType === 'dealer' && recipientId === dealerId,
  }
}

// Shows queries I raised, plus queries addressed to me (as the mapped recipient
// who's allowed to respond / change status).
export async function fetchQueries(dealerId) {
  const [raisedRes, receivedRes] = await Promise.all([
    fetch(`${API_URL}/dealer-queries?dealer=${dealerId}`, { headers: { ...getAuthHeaders() } }),
    fetch(`${API_URL}/dealer-queries?recipient=${dealerId}`, { headers: { ...getAuthHeaders() } }),
  ])

  const raisedJson   = await raisedRes.json().catch(() => ({}))
  const receivedJson = await receivedRes.json().catch(() => ({}))

  const raised   = raisedRes.ok && raisedJson.status === 'success' ? (raisedJson.data || []) : []
  const received = receivedRes.ok && receivedJson.status === 'success' ? (receivedJson.data || []) : []

  const merged = new Map()
  for (const q of [...raised, ...received]) merged.set(q._id, q)

  return Array.from(merged.values())
    .map((q) => mapQuery(q, dealerId))
    .sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate))
}

export async function respondToQuery(id, response) {
  const res = await fetch(`${API_URL}/dealer-queries/${id}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ response }),
  })

  const data = await res.json()

  if (!res.ok || data.status !== 'success') {
    throw new Error(data.message || 'Failed to respond to query.')
  }

  return data
}

export async function updateQueryStatus(id, status) {
  const res = await fetch(`${API_URL}/dealer-queries/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ status }),
  })

  const data = await res.json()

  if (!res.ok || data.status !== 'success') {
    throw new Error(data.message || 'Failed to update query status.')
  }

  return data
}

export async function deleteQuery(id) {
  const res = await fetch(`${API_URL}/dealer-queries/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  })

  const data = await res.json()

  if (!res.ok || data.status !== 'success') {
    throw new Error(data.message || 'Failed to delete query.')
  }

  return data
}
