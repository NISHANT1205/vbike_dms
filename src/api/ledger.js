import { API_URL } from '../config/api'
import { getAuthHeaders } from './auth'

async function fetchOwnLedger(dealerId) {
  const res = await fetch(`${API_URL}/ledger/dealer/${dealerId}`, {
    headers: { ...getAuthHeaders() },
  })

  const json = await res.json()

  if (res.status === 404 || /not found/i.test(json.message || '')) return null
  if (!res.ok || json.status !== 'success') {
    throw new Error(json.message || 'Failed to fetch ledger.')
  }

  return json.data
}

// Dealers who raised a purchase order mapped to me — i.e. dealers I supply to.
// dealerId comes from the logged-in dealer (vbike_user.dealerId in localStorage)
export async function fetchDownstreamDealers(dealerId) {
  const res = await fetch(`${API_URL}/purchase-orders`, {
    headers: { ...getAuthHeaders() },
  })

  const json = await res.json()
  if (!res.ok || json.status !== 'success') return []

  const orders = json.data || []
  const seen = new Map()
  for (const po of orders) {
    if (po.mappedTo?._id === dealerId && po.dealer?._id && !seen.has(po.dealer._id)) {
      seen.set(po.dealer._id, po.dealer)
    }
  }
  return Array.from(seen.values())
}

function mapEntries(entries, dealerName, dealerId) {
  return (entries || []).map((e) => ({
    id:          e._id,
    rawDate:     e.date,
    date:        e.date ? new Date(e.date).toLocaleDateString('en-IN') : '—',
    dealer:      dealerName || '—',
    dealerId:    dealerId || e.dealer || '',
    reference:   e.referenceNumber || '—',
    description: e.description || '—',
    debit:       e.entryType === 'debit' ? '₹' + Number(e.amount).toLocaleString('en-IN') : '—',
    credit:      e.entryType === 'credit' ? '₹' + Number(e.amount).toLocaleString('en-IN') : '—',
    balance:     e.balanceAfter != null ? '₹' + Number(e.balanceAfter).toLocaleString('en-IN') : '—',
    // raw fields for the View modal / prefilling the Entry form
    entryType:   e.entryType,
    referenceType: e.referenceType || '',
    baseAmount:  e.baseAmount ?? e.amount,
    gstPercent:  e.gstPercent ?? 0,
    gstAmount:   e.gstAmount ?? 0,
    gstNumber:   e.gstNumber || '',
    amount:      e.amount,
    balanceAfter: e.balanceAfter,
    rawDescription: e.description || '',
  }))
}

// Suppliers (Super Stockist / Exclusive Dealer) see a combined ledger of every
// dealer mapped to them — their receivables. Dealers with nobody mapped below
// them (e.g. Sub Dealer) fall back to their own ledger — their payables.
export async function fetchLedger(dealerId) {
  const downstream = await fetchDownstreamDealers(dealerId)

  if (downstream.length > 0) {
    const ledgers = await Promise.all(
      downstream.map((d) => fetchOwnLedger(d._id).catch(() => null))
    )

    let rows = []
    let totalDebit = 0, totalCredit = 0, balance = 0

    ledgers.forEach((data, i) => {
      if (!data) return
      rows = rows.concat(mapEntries(data.entries, downstream[i].companyName, downstream[i]._id))
      totalDebit  += Number(data.summary?.totalDebit || 0)
      totalCredit += Number(data.summary?.totalCredit || 0)
      balance     += Number(data.summary?.balance || 0)
    })

    rows.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate))

    return { rows, summary: { totalDebit, totalCredit, balance } }
  }

  const data = await fetchOwnLedger(dealerId)
  if (!data) return { rows: [], summary: { totalDebit: 0, totalCredit: 0, balance: 0 } }

  return {
    rows: mapEntries(data.entries, data.dealer?.companyName, data.dealer?._id || dealerId),
    summary: data.summary || { totalDebit: 0, totalCredit: 0, balance: 0 },
  }
}

export async function createLedgerEntry({ dealer, entryType, baseAmount, gstPercent, gstNumber, description }) {
  const body = {
    dealer,
    entryType,
    baseAmount: Number(baseAmount),
    gstPercent: Number(gstPercent) || 0,
    description,
  }
  if (gstNumber) body.gstNumber = gstNumber

  const res = await fetch(`${API_URL}/ledger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok || data.status !== 'success') {
    throw new Error(data.message || 'Failed to create ledger entry.')
  }

  return data
}
