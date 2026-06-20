import { API_URL } from '../config/api'
import { getAuthHeaders } from './auth'

export async function createPurchaseOrder({ dealer, items, remarks }) {
  const res = await fetch(`${API_URL}/purchase-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ dealer, items, remarks }),
  })

  const data = await res.json()

  if (!res.ok || data.status !== 'success') {
    throw new Error(data.message || 'Failed to create purchase order.')
  }

  return data
}

// dealerId comes from the logged-in dealer (vbike_user.dealerId in localStorage)
export async function fetchPurchaseOrderHistory(dealerId) {
  const res = await fetch(`${API_URL}/purchase-orders?dealer=${dealerId}`, {
    headers: { ...getAuthHeaders() },
  })

  const json = await res.json()

  // No orders raised yet for this dealer — treat as an empty history, not an error
  if (res.status === 404 || /not found/i.test(json.message || '')) {
    return []
  }

  if (!res.ok || json.status !== 'success') {
    throw new Error(json.message || 'Failed to fetch purchase order history.')
  }

  const orders = Array.isArray(json.data) ? json.data : (json.data ? [json.data] : [])

  return orders.map((po) => ({
    id:        po.po_number || po._id,
    date:      po.createdAt ? new Date(po.createdAt).toLocaleDateString('en-IN') : '—',
    rawDate:   po.createdAt,
    supplier:  po.mappedTo?.companyName || po.mappedTo?.name || '—',
    items:     (po.items || []).length,
    amount:    po.grandTotal != null ? '₹' + Number(po.grandTotal).toLocaleString('en-IN') : '—',
    status:    po.status ? po.status.charAt(0).toUpperCase() + po.status.slice(1) : '—',
    rawItems:  po.items || [],
    subTotal:  po.subTotal,
    tax:       po.tax,
    discount:  po.discount,
    grandTotal: po.grandTotal,
    remarks:   po.remarks || '',
  }))
}

// Purchase orders raised by other dealers that have been mapped to the
// logged-in dealer (i.e. this dealer is the upstream supplier for that order)
export async function fetchIncomingPurchaseOrders(dealerId) {
  const res = await fetch(`${API_URL}/purchase-orders`, {
    headers: { ...getAuthHeaders() },
  })

  const json = await res.json()

  if (!res.ok || json.status !== 'success') {
    throw new Error(json.message || 'Failed to fetch incoming purchase orders.')
  }

  const orders = (json.data || []).filter((po) => po.mappedTo?._id === dealerId)

  return orders.map((po) => ({
    id:        po.po_number || po._id,
    poId:      po._id,
    date:      po.createdAt ? new Date(po.createdAt).toLocaleDateString('en-IN') : '—',
    rawDate:   po.createdAt,
    dealer:    po.dealer?.companyName || '—',
    items:     (po.items || []).length,
    amount:    po.grandTotal != null ? '₹' + Number(po.grandTotal).toLocaleString('en-IN') : '—',
    status:    po.status ? po.status.charAt(0).toUpperCase() + po.status.slice(1) : '—',
    rawItems:  po.items || [],
    subTotal:  po.subTotal,
    tax:       po.tax,
    discount:  po.discount,
    grandTotal: po.grandTotal,
    remarks:   po.remarks || '',
  }))
}
