import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Save, RotateCcw, CheckCircle2, AlertCircle, RefreshCw, Package } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { useAuth } from '../context/AuthContext'
import { fetchDownstreamDealers } from '../api/ledger'
import { fetchSourceInventory, createManualSalesOrder } from '../api/salesOrders'

let _keyCounter = 0
const newItem = () => ({ _key: ++_keyCounter, productId: '', productType: '', productName: '', price: null, stock: null, quantity: 1 })

function fmt(n) {
  if (n == null) return '—'
  return '₹' + Number(n).toLocaleString('en-IN')
}

export default function CreateManualSalePage({ crumbs, title }) {
  const { user } = useAuth()

  const [inventory, setInventory]   = useState([])
  const [invLoading, setInvLoading] = useState(true)
  const [invError, setInvError]     = useState('')

  const [dealers, setDealers]               = useState([])
  const [dealersLoading, setDealersLoading] = useState(true)

  const [buyerType, setBuyerType]         = useState('customer') // 'customer' | 'dealer'
  const [customerName, setCustomerName]   = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [dealer, setDealer]               = useState('')

  const [items, setItems]                     = useState([newItem()])
  const [remarks, setRemarks]                 = useState('')
  const [deductInventory, setDeductInventory] = useState(true)

  const [submitting, setSubmitting]   = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess]         = useState(false)

  const loadInventory = useCallback(() => {
    if (!user?.dealerId) return
    setInvLoading(true)
    setInvError('')
    fetchSourceInventory(user.dealerId)
      .then(setInventory)
      .catch((err) => setInvError(err.message))
      .finally(() => setInvLoading(false))
  }, [user?.dealerId])

  useEffect(() => { loadInventory() }, [loadInventory])

  useEffect(() => {
    if (!user?.dealerId) return
    setDealersLoading(true)
    fetchDownstreamDealers(user.dealerId)
      .then(setDealers)
      .finally(() => setDealersLoading(false))
  }, [user?.dealerId])

  const updateItem = (key, field, value) => {
    setItems((prev) => prev.map((item) => {
      if (item._key !== key) return item
      const updated = { ...item, [field]: value }
      if (field === 'productId') {
        const prod = inventory.find((p) => p.id === value)
        updated.productType = prod?.type || ''
        updated.productName = prod?.name || ''
        updated.price       = prod ? prod.unitPrice : null
        updated.stock       = prod?.stock ?? null
      }
      return updated
    }))
  }

  const addItem    = () => setItems((prev) => [...prev, newItem()])
  const removeItem = (key) => setItems((prev) => prev.length > 1 ? prev.filter((i) => i._key !== key) : prev)

  const validItems = items.filter((i) => i.productId && i.quantity > 0)
  const totalValue = validItems.reduce((sum, i) => sum + (i.price != null ? i.price * i.quantity : 0), 0)

  const reset = () => {
    setBuyerType('customer')
    setCustomerName('')
    setCustomerPhone('')
    setDealer('')
    setItems([newItem()])
    setRemarks('')
    setDeductInventory(true)
    setSubmitError('')
    setSuccess(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (!user?.dealerId) { setSubmitError('Your dealer ID was not found. Please log out and log in again.'); return }
    if (buyerType === 'dealer' && !dealer) { setSubmitError('Select a dealer.'); return }
    if (buyerType === 'customer' && !customerName.trim()) { setSubmitError('Customer name is required.'); return }
    if (validItems.length === 0) { setSubmitError('Add at least one product to the sale.'); return }

    setSubmitting(true)
    try {
      await createManualSalesOrder({
        sourceDealer:  user.dealerId,
        dealer:        buyerType === 'dealer' ? dealer : null,
        customerName:  buyerType === 'customer' ? customerName.trim() : '',
        customerPhone: buyerType === 'customer' ? customerPhone.trim() : '',
        items: validItems.map((i) => ({
          productType: i.productType,
          product:     i.productId,
          name:        i.productName,
          quantity:    Number(i.quantity),
          unitPrice:   Number(i.price),
        })),
        remarks: remarks.trim(),
        deductInventory,
      })
      setSuccess(true)
      setCustomerName('')
      setCustomerPhone('')
      setDealer('')
      setItems([newItem()])
      setRemarks('')
      loadInventory()
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader crumbs={crumbs} title={title} subtitle="Sell a single product directly to a customer or a mapped dealer, straight from your own stock" />

      {success && (
        <div className="card mb-20" style={{ borderColor: '#4ade80', background: '#f0fdf4' }}>
          <div className="card-body flex items-center gap-3" style={{ color: '#166534' }}>
            <CheckCircle2 size={22} />
            <div>
              <b>Sale recorded successfully.</b>
              <div style={{ fontSize: 13 }}>The sales order has been created.</div>
            </div>
          </div>
        </div>
      )}

      {submitError && (
        <div className="form-error mb-20">
          <AlertCircle size={15} style={{ flexShrink: 0 }} /> {submitError}
        </div>
      )}

      <form onSubmit={submit}>

        {/* ── Sell To ── */}
        <div className="card mb-20">
          <div className="card-head"><h3>Sell To</h3></div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-field full">
                <label>Buyer Type <span className="req">*</span></label>
                <div className="flex items-center" style={{ gap: 20, marginTop: 4 }}>
                  <label className="flex items-center gap-2" style={{ fontSize: 13.5, fontWeight: 400 }}>
                    <input type="radio" name="buyerType" checked={buyerType === 'customer'} onChange={() => setBuyerType('customer')} /> Walk-in Customer
                  </label>
                  <label className="flex items-center gap-2" style={{ fontSize: 13.5, fontWeight: 400 }}>
                    <input type="radio" name="buyerType" checked={buyerType === 'dealer'} onChange={() => setBuyerType('dealer')} /> Mapped Dealer
                  </label>
                </div>
              </div>

              {buyerType === 'customer' ? (
                <>
                  <div className="form-field">
                    <label htmlFor="cms-cname">Customer Name <span className="req">*</span></label>
                    <input
                      id="cms-cname" type="text" className="form-control"
                      value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="cms-cphone">Customer Phone</label>
                    <input
                      id="cms-cphone" type="tel" className="form-control"
                      value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </>
              ) : (
                <div className="form-field full">
                  <label htmlFor="cms-dealer">Dealer <span className="req">*</span></label>
                  <select
                    id="cms-dealer" className="form-control"
                    value={dealer} onChange={(e) => setDealer(e.target.value)}
                    disabled={dealersLoading}
                  >
                    <option value="">{dealersLoading ? 'Loading dealers…' : 'Select dealer…'}</option>
                    {dealers.map((d) => (
                      <option key={d._id} value={d._id}>{d.companyName}{d.ownerName ? ` (${d.ownerName})` : ''}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Order Items ── */}
        <div className="card mb-20">
          <div className="card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Order Items</h3>
            {invError && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={loadInventory}>
                <RefreshCw size={14} /> Retry
              </button>
            )}
          </div>
          <div className="card-body" style={{ padding: 0 }}>

            {invLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 24px', color: 'var(--text-muted)', fontSize: 14 }}>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Loading your stock…
              </div>
            )}

            {invError && (
              <div style={{ padding: '12px 24px' }}>
                <div className="form-error" style={{ margin: 0 }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} /> {invError}
                </div>
              </div>
            )}

            <div className="po-table-wrap">
              <table className="po-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>#</th>
                    <th>Product</th>
                    <th style={{ width: 120 }}>Unit Price</th>
                    <th style={{ width: 90 }}>Qty</th>
                    <th style={{ width: 130 }}>Total</th>
                    <th style={{ width: 44 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item._key}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>{idx + 1}</td>
                      <td>
                        <select
                          className="form-control"
                          value={item.productId}
                          onChange={(e) => updateItem(item._key, 'productId', e.target.value)}
                          disabled={invLoading}
                          style={{ minWidth: 220 }}
                        >
                          <option value="">{invLoading ? 'Loading…' : 'Select product…'}</option>
                          {inventory.map((p) => (
                            <option key={p.id} value={p.id}>{p.name} — {p.stock} in stock</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number" min={0} step="0.01" className="form-control" style={{ width: 100 }}
                          value={item.price ?? ''}
                          onChange={(e) => updateItem(item._key, 'price', e.target.value === '' ? null : Number(e.target.value))}
                          disabled={!item.productId}
                        />
                      </td>
                      <td>
                        <input
                          type="number" className="form-control" min={1} max={item.stock ?? undefined} style={{ width: 70 }}
                          value={item.quantity}
                          onChange={(e) => {
                            let qty = Math.max(1, parseInt(e.target.value) || 1)
                            if (item.stock != null) qty = Math.min(qty, item.stock)
                            updateItem(item._key, 'quantity', qty)
                          }}
                          disabled={!item.productId}
                        />
                      </td>
                      <td style={{ fontSize: 14, fontWeight: 500 }}>
                        {item.price != null && item.productId
                          ? fmt(item.price * item.quantity)
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>
                        }
                      </td>
                      <td>
                        <button
                          type="button" className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 6px', color: 'var(--red-600, #dc2626)' }}
                          onClick={() => removeItem(item._key)}
                          disabled={items.length === 1}
                          title="Remove row"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{
              padding: '12px 24px', borderTop: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>
                <Plus size={15} /> Add Item
              </button>
              {validItems.length > 0 && (
                <div style={{ display: 'flex', gap: 24, alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    <Package size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
                    {validItems.length} product{validItems.length !== 1 ? 's' : ''}
                  </span>
                  {totalValue > 0 && (
                    <span style={{ fontWeight: 600, fontSize: 15 }}>Total: {fmt(totalValue)}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Remarks & Stock ── */}
        <div className="card mb-20">
          <div className="card-head"><h3>Remarks</h3></div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-field full">
                <label htmlFor="cms-remarks">Remarks / Notes</label>
                <textarea
                  id="cms-remarks" className="form-control" rows={3}
                  value={remarks} onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Optional — e.g. cash sale, discount given…"
                />
              </div>
              <div className="form-field full">
                <label className="flex items-center gap-2" style={{ fontWeight: 400, fontSize: 13.5 }}>
                  <input type="checkbox" checked={deductInventory} onChange={(e) => setDeductInventory(e.target.checked)} />
                  Deduct sold quantity from my stock
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <button type="button" className="btn btn-ghost" onClick={reset} disabled={submitting}>
            <RotateCcw size={16} /> Reset
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting || validItems.length === 0}>
            {submitting ? 'Submitting…' : <><Save size={16} /> Complete Sale</>}
          </button>
        </div>

      </form>
    </>
  )
}
