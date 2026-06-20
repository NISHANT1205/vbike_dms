import { API_URL } from '../config/api'
import { getAuthHeaders } from './auth'

// A sales order is just an incoming purchase order (raised by a downstream
// dealer, mapped to me as their supplier) once I've dispatched it — it's no
// longer "pending" fulfilment, it's a completed sale from my side.
export async function fetchSalesOrders(dealerId) {
  const res = await fetch(`${API_URL}/purchase-orders`, {
    headers: { ...getAuthHeaders() },
  })

  const json = await res.json()

  if (!res.ok || json.status !== 'success') {
    throw new Error(json.message || 'Failed to fetch sales orders.')
  }

  const orders = (json.data || []).filter(
    (po) => po.mappedTo?._id === dealerId && po.status !== 'pending'
  )

  return orders.map((po) => ({
    id:        po.po_number || po._id,
    poId:      po._id,
    date:      po.createdAt ? new Date(po.createdAt).toLocaleDateString('en-IN') : '—',
    rawDate:   po.createdAt,
    customer:  po.dealer?.companyName || '—',
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

// Products currently in this dealer's own stock — used to populate the product
// picker when creating a manual (direct-to-customer) sale.
export async function fetchSourceInventory(dealerId) {
  const res = await fetch(`${API_URL}/sales-orders/source-inventory?source=dealer&dealer_id=${dealerId}`, {
    headers: { ...getAuthHeaders() },
  })

  const json = await res.json()

  if (res.status === 404 || /not found/i.test(json.message || '')) return []
  if (!res.ok || json.status !== 'success') {
    throw new Error(json.message || 'Failed to fetch product inventory.')
  }

  const items = Array.isArray(json.data) ? json.data : []

  return items.map((it) => ({
    id:        it.product_id || it._id || it.product,
    name:      it.product_name || it.name || '—',
    type:      it.product_type || it.productType || 'bike',
    unitPrice: Number(it.unit_price ?? it.price ?? 0),
    stock:     Number(it.available_stock ?? it.stock_quantity ?? it.quantity ?? 0),
  }))
}

// A dealer selling a single product directly — to a mapped dealer, or to a
// walk-in customer — without going through the purchase-order flow.
export async function createManualSalesOrder({ sourceDealer, dealer, customerName, customerPhone, items, remarks, deductInventory }) {
  const body = {
    sourceType: 'dealer',
    sourceDealer,
    items,
    remarks,
    deductInventory,
  }
  if (dealer) {
    body.dealer = dealer
  } else {
    body.customerName = customerName
    body.customerPhone = customerPhone
  }

  const res = await fetch(`${API_URL}/sales-orders/manual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok || data.status !== 'success') {
    throw new Error(data.message || 'Failed to create sale.')
  }

  return data
}

// Only this dealer's own direct sales — the endpoint returns every manual
// sale in the system, so it's filtered here to the ones this dealer sold
// (sourceDealer is the seller; dealer/customerName is the buyer).
export async function fetchManualSalesOrders(dealerId) {
  const res = await fetch(`${API_URL}/sales-orders?isManual=true`, {
    headers: { ...getAuthHeaders() },
  })

  const json = await res.json()

  if (res.status === 404 || /not found/i.test(json.message || '')) return []
  if (!res.ok || json.status !== 'success') {
    throw new Error(json.message || 'Failed to fetch sales.')
  }

  const orders = (Array.isArray(json.data) ? json.data : [])
    .filter((so) => (so.sourceDealer?._id || so.sourceDealer) === dealerId)

  return orders.map((so) => ({
    id:         so.so_number || so._id,
    soId:       so._id,
    date:       so.createdAt ? new Date(so.createdAt).toLocaleDateString('en-IN') : '—',
    rawDate:    so.createdAt,
    customer:   so.dealer?.companyName || so.customerName || '—',
    dealer:     so.dealer?.companyName || so.customerName || '—',
    items:      (so.items || []).length,
    amount:     so.grandTotal != null ? '₹' + Number(so.grandTotal).toLocaleString('en-IN') : '—',
    status:     so.status ? so.status.charAt(0).toUpperCase() + so.status.slice(1) : '—',
    rawItems:   so.items || [],
    subTotal:   so.subTotal,
    tax:        so.tax,
    discount:   so.discount,
    grandTotal: so.grandTotal,
    remarks:    so.remarks || '',
  }))
}

export async function deleteSalesOrder(id) {
  const res = await fetch(`${API_URL}/sales-orders/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  })

  const data = await res.json()

  if (!res.ok || data.status !== 'success') {
    throw new Error(data.message || 'Failed to delete sale.')
  }

  return data
}
