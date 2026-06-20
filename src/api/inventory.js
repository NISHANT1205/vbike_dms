import { API_URL } from '../config/api'
import { getAuthHeaders } from './auth'

// dealerId comes from the logged-in dealer (vbike_user.dealerId in localStorage)
export async function fetchERPInventory(dealerId) {
  const res = await fetch(`${API_URL}/dealer-inventory/erp?dealer_id=${dealerId}`, {
    headers: { ...getAuthHeaders() },
  })

  const json = await res.json()

  if (res.status === 404 || /not found/i.test(json.message || '')) {
    return { rows: [], summary: { total_products: 0, total_quantity: 0, total_value: 0 } }
  }

  if (!res.ok || json.status !== 'success') {
    throw new Error(json.message || 'Failed to fetch inventory.')
  }

  const items = Array.isArray(json.data) ? json.data : []

  const rows = items.map((it) => ({
    id:          it.product_id || it._id,
    name:        it.product_name || '—',
    type:        it.product_type ? it.product_type.charAt(0).toUpperCase() + it.product_type.slice(1) : '—',
    quantity:    it.stock_quantity ?? 0,
    unitPrice:   it.unit_price != null ? '₹' + Number(it.unit_price).toLocaleString('en-IN') : '—',
    taxRate:     it.tax_rate != null ? (Number(it.tax_rate) * 100).toFixed(0) + '%' : '—',
    landedCost:  it.landed_unit_cost != null ? '₹' + Number(it.landed_unit_cost).toLocaleString('en-IN') : '—',
    stockValue:  it.stock_value != null ? '₹' + Number(it.stock_value).toLocaleString('en-IN') : '—',
    status:      (it.stock_quantity ?? 0) > 0 ? 'In Stock' : 'Out of Stock',
  }))

  return { rows, summary: json.summary || { total_products: rows.length, total_quantity: 0, total_value: 0 } }
}

export async function fetchInventoryTransactionSummary(dealerId) {
  const res = await fetch(`${API_URL}/inventory-transactions/summary?owner_id=${dealerId}`, {
    headers: { ...getAuthHeaders() },
  })

  const json = await res.json()

  if (res.status === 404 || /not found/i.test(json.message || '')) {
    return []
  }

  if (!res.ok || json.status !== 'success') {
    throw new Error(json.message || 'Failed to fetch inventory transaction history.')
  }

  const rows = Array.isArray(json.data) ? json.data : []

  return rows.map((it) => ({
    id:       it.product || it.productName,
    name:     it.productName || '—',
    type:     it.productType ? it.productType.charAt(0).toUpperCase() + it.productType.slice(1) : '—',
    opening:  it.opening ?? 0,
    stockIn:  it.total_in ?? 0,
    stockOut: it.total_out ?? 0,
    balance:  it.current_balance ?? 0,
    inFrom:   (it.in_from || []).map((x) => `${x.name} (${x.quantity})`).join(', ') || '—',
    outTo:    (it.out_to || []).map((x) => `${x.name} (${x.quantity})`).join(', ') || '—',
  }))
}
