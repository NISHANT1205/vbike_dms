import { API_URL } from '../config/api'
import { getAuthHeaders } from './auth'

// dealerId comes from the logged-in dealer (vbike_user.dealerId in localStorage).
// Invoices are billed to `dealer` — these are the bills owed by the logged-in dealer.
export async function fetchInvoices(dealerId) {
  const res = await fetch(`${API_URL}/invoices?dealer=${dealerId}`, {
    headers: { ...getAuthHeaders() },
  })

  const json = await res.json()

  if (res.status === 404 || /not found/i.test(json.message || '')) {
    return []
  }

  if (!res.ok || json.status !== 'success') {
    throw new Error(json.message || 'Failed to fetch invoices.')
  }

  const invoices = Array.isArray(json.data) ? json.data : []

  return invoices.map((inv) => ({
    id:        inv.invoice_number || inv._id,
    date:      inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-IN') : '—',
    dealer:    inv.dealer?.companyName || '—',
    soNumber:  inv.salesOrder?.so_number || '—',
    items:     (inv.items || []).length,
    amount:    inv.grandTotal != null ? '₹' + Number(inv.grandTotal).toLocaleString('en-IN') : '—',
    balance:   inv.balanceDue != null ? '₹' + Number(inv.balanceDue).toLocaleString('en-IN') : '—',
    status:    inv.paymentStatus ? inv.paymentStatus.charAt(0).toUpperCase() + inv.paymentStatus.slice(1) : '—',
    rawItems:  inv.items || [],
    subTotal:  inv.subTotal,
    tax:       inv.tax,
    discount:  inv.discount,
    grandTotal: inv.grandTotal,
    amountPaid: inv.amountPaid,
    balanceDue: inv.balanceDue,
    remarks:   inv.remarks || '',
    invoiceNumber: inv.invoice_number,
    dealerInfo: inv.dealer || {},
  }))
}
