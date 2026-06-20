import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Save, RotateCcw, CheckCircle2, AlertCircle, RefreshCw, Package } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { useAuth } from '../context/AuthContext'
import { fetchProducts } from '../api/products'
import { createPurchaseOrder } from '../api/purchaseOrders'

let _keyCounter = 0
const newItem = () => ({ _key: ++_keyCounter, productId: '', productType: '', productName: '', price: null, stock: null, quantity: 1 })

function fmt(n) {
  if (n == null) return '—'
  return '₹' + Number(n).toLocaleString('en-IN')
}

// Dealer's role decides which price tier of the product they pay
const ROLE_PRICE_FIELD = {
  super_stockist:   'super_stockist_price',
  exclusive_dealer: 'exclusive_price',
  sub_dealer:       'sub_dealer_price',
}

function priceForRole(product, roleId) {
  const field = ROLE_PRICE_FIELD[roleId]
  const rolePrice = field ? product[field] : null
  return rolePrice ? rolePrice : (product.price ?? null)
}

function TypeBadge({ type }) {
  const colors = {
    bike:      { bg: '#f0f0f0', color: '#111' },
    battery:   { bg: '#e8f5e9', color: '#2e7d32' },
    accessory: { bg: '#e3f2fd', color: '#1565c0' },
  }
  const s = colors[type] || { bg: '#f5f5f5', color: '#555' }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
      fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
      background: s.bg, color: s.color, textTransform: 'capitalize',
    }}>
      {type || '—'}
    </span>
  )
}

export default function CreatePOPage({ crumbs, title }) {
  const { user } = useAuth()

  const [products, setProducts]           = useState([])
  const [prodsLoading, setProdsLoading]   = useState(true)
  const [prodsError, setProdsError]       = useState('')

  const [items, setItems]                 = useState([newItem()])
  const [remarks, setRemarks]             = useState('')
  const [submitting, setSubmitting]       = useState(false)
  const [submitError, setSubmitError]     = useState('')
  const [success, setSuccess]             = useState(false)

  const loadProducts = useCallback(() => {
    setProdsLoading(true)
    setProdsError('')
    fetchProducts()
      .then(setProducts)
      .catch((err) => setProdsError(err.message))
      .finally(() => setProdsLoading(false))
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  // Group products by product_type for <optgroup>
  const grouped = products.reduce((acc, p) => {
    const t = p.product_type || 'other'
    if (!acc[t]) acc[t] = []
    acc[t].push(p)
    return acc
  }, {})

  const updateItem = (key, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item._key !== key) return item
        const updated = { ...item, [field]: value }
        if (field === 'productId') {
          const prod = products.find((p) => p._id === value)
          updated.productType = prod?.product_type || ''
          updated.productName = prod?.name || ''
          updated.price       = prod ? priceForRole(prod, user?.id) : null
          updated.stock       = prod?.stock_quantity ?? null
        }
        return updated
      }),
    )
  }

  const addItem    = () => setItems((prev) => [...prev, newItem()])
  const removeItem = (key) => setItems((prev) => prev.length > 1 ? prev.filter((i) => i._key !== key) : prev)

  const reset = () => {
    setItems([newItem()])
    setRemarks('')
    setSubmitError('')
    setSuccess(false)
  }

  const validItems = items.filter((i) => i.productId && i.quantity > 0)

  const totalValue = validItems.reduce((sum, i) => {
    return i.price != null ? sum + i.price * i.quantity : sum
  }, 0)

  const submit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (!user?.dealerId) {
      setSubmitError('Dealer ID not found. Please log out and log in again.')
      return
    }
    if (validItems.length === 0) {
      setSubmitError('Add at least one product to the order.')
      return
    }

    setSubmitting(true)
    try {
      await createPurchaseOrder({
        dealer:  user.dealerId,            // from vbike_user.dealerId in localStorage
        items:   validItems.map((i) => ({
          productType: i.productType,
          product:     i.productId,
          quantity:    Number(i.quantity),
        })),
        remarks: remarks.trim(),
      })
      setSuccess(true)
      setItems([newItem()])
      setRemarks('')
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader crumbs={crumbs} title={title} subtitle="Select products and quantities to place a new purchase order" />

      {success && (
        <div className="card mb-20" style={{ borderColor: '#4ade80', background: '#f0fdf4' }}>
          <div className="card-body flex items-center gap-3" style={{ color: '#166534' }}>
            <CheckCircle2 size={22} />
            <div>
              <b>Purchase order placed successfully.</b>
              <div style={{ fontSize: 13 }}>Your order has been submitted for processing.</div>
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

        {/* ── Order Items ── */}
        <div className="card mb-20">
          <div className="card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Order Items</h3>
            {prodsError && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={loadProducts}>
                <RefreshCw size={14} /> Retry
              </button>
            )}
          </div>
          <div className="card-body" style={{ padding: 0 }}>

            {prodsLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 24px', color: 'var(--text-muted)', fontSize: 14 }}>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Loading products…
              </div>
            )}

            {prodsError && (
              <div style={{ padding: '12px 24px' }}>
                <div className="form-error" style={{ margin: 0 }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} /> {prodsError}
                </div>
              </div>
            )}

            <div className="po-table-wrap">
              <table className="po-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>#</th>
                    <th>Product</th>
                    <th style={{ width: 110 }}>Type</th>
                    <th style={{ width: 120 }}>Unit Price</th>
                    <th style={{ width: 90 }}>Qty</th>
                    <th style={{ width: 130 }}>Total</th>
                    <th style={{ width: 44 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item._key}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
                        {idx + 1}
                      </td>
                      <td>
                        <select
                          className="form-control"
                          value={item.productId}
                          onChange={(e) => updateItem(item._key, 'productId', e.target.value)}
                          disabled={prodsLoading}
                          style={{ minWidth: 220 }}
                        >
                          <option value="">Select product…</option>
                          {Object.entries(grouped).map(([type, prods]) => (
                            <optgroup key={type} label={type.charAt(0).toUpperCase() + type.slice(1) + 's'}>
                              {prods.map((p) => {
                                const rolePrice = priceForRole(p, user?.id)
                                return (
                                  <option key={p._id} value={p._id}>
                                    {p.name}{rolePrice != null
                                      ? ` — ₹${Number(rolePrice).toLocaleString('en-IN')}`
                                      : ' — Price TBD'}
                                  </option>
                                )
                              })}
                            </optgroup>
                          ))}
                        </select>
                      </td>
                      <td>
                        {item.productType
                          ? <TypeBadge type={item.productType} />
                          : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>
                        }
                      </td>
                      <td style={{ fontSize: 14 }}>{item.productId ? fmt(item.price) : '—'}</td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          min={1}
                          max={item.stock ?? undefined}
                          style={{ width: 70 }}
                          value={item.quantity}
                          onChange={(e) => {
                            let qty = Math.max(1, parseInt(e.target.value) || 1)
                            if (item.stock != null) qty = Math.min(qty, item.stock)
                            updateItem(item._key, 'quantity', qty)
                          }}
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
                          type="button"
                          className="btn btn-ghost btn-sm"
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
                    <span style={{ fontWeight: 600, fontSize: 15 }}>
                      Total: {fmt(totalValue)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Remarks ── */}
        <div className="card mb-20">
          <div className="card-head"><h3>Remarks</h3></div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-field full">
                <label htmlFor="po-remarks">Remarks / Notes</label>
                <textarea
                  id="po-remarks"
                  className="form-control"
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Optional — e.g. urgent, special delivery instructions…"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <button type="button" className="btn btn-ghost" onClick={reset} disabled={submitting}>
            <RotateCcw size={16} /> Reset
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || validItems.length === 0}
          >
            {submitting ? 'Submitting…' : <><Save size={16} /> Place Order</>}
          </button>
        </div>

      </form>
    </>
  )
}
