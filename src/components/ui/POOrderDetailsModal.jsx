import Modal from './Modal'
import Badge from './Badge'

const fmt = (n) => (n == null || isNaN(n) ? '—' : '₹' + Number(n).toLocaleString('en-IN'))

function productName(item) {
  return item.name || item.product?.name || item.productName || '—'
}

function unitPrice(item) {
  const p = item.unitPrice ?? item.product?.price ?? item.price
  return p != null ? Number(p) : null
}

function lineTotal(item, price, qty) {
  if (item.total != null) return Number(item.total)
  return price != null ? price * qty : null
}

export default function POOrderDetailsModal({ order, partyLabel, onClose }) {
  if (!order) return null

  const items = order.rawItems || []

  return (
    <Modal
      title={order.id}
      subtitle={`Date: ${order.date}`}
      onClose={onClose}
      width={720}
    >
      <div className="flex items-center justify-between mb-20" style={{ gap: 12 }}>
        <div>
          <div className="muted" style={{ fontSize: 12 }}>{partyLabel}</div>
          <div style={{ fontWeight: 600 }}>{order.supplier || order.dealer || '—'}</div>
        </div>
        <Badge value={order.status} />
      </div>

      <div className="po-table-wrap">
        <table className="po-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>#</th>
              <th>Product</th>
              <th style={{ width: 110 }}>Type</th>
              <th style={{ width: 90 }}>Qty</th>
              <th style={{ width: 120 }}>Unit Price</th>
              <th style={{ width: 130 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No item details available</td></tr>
            ) : (
              items.map((item, idx) => {
                const price = unitPrice(item)
                const qty = Number(item.quantity) || 0
                const total = lineTotal(item, price, qty)
                return (
                  <tr key={item._id || idx}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>{idx + 1}</td>
                    <td>{productName(item)}</td>
                    <td>{item.productType || '—'}</td>
                    <td>{qty}</td>
                    <td>{price != null ? fmt(price) : '—'}</td>
                    <td style={{ fontWeight: 500 }}>{total != null ? fmt(total) : '—'}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between" style={{ marginTop: 20, paddingTop: 12, borderTop: '1px solid var(--border)', alignItems: 'flex-end' }}>
        <span className="muted" style={{ fontSize: 12.5 }}>{order.remarks ? `Remarks: ${order.remarks}` : ''}</span>
        <div style={{ textAlign: 'right', fontSize: 13 }}>
          <div className="flex justify-between" style={{ gap: 24, color: 'var(--text-muted)' }}><span>Subtotal</span><span>{fmt(order.subTotal)}</span></div>
          <div className="flex justify-between" style={{ gap: 24, color: 'var(--text-muted)' }}><span>Tax</span><span>{fmt(order.tax)}</span></div>
          {!!order.discount && (
            <div className="flex justify-between" style={{ gap: 24, color: 'var(--text-muted)' }}><span>Discount</span><span>-{fmt(order.discount)}</span></div>
          )}
          <div className="flex justify-between" style={{ gap: 24, marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 600 }}>Grand Total</span>
            <span style={{ fontSize: 17, fontWeight: 700 }}>{fmt(order.grandTotal)}</span>
          </div>
          {order.amountPaid != null && (
            <div className="flex justify-between" style={{ gap: 24, color: 'var(--text-muted)' }}><span>Amount Paid</span><span>{fmt(order.amountPaid)}</span></div>
          )}
          {order.balanceDue != null && (
            <div className="flex justify-between" style={{ gap: 24, color: 'var(--red-600, #dc2626)', fontWeight: 600 }}><span>Balance Due</span><span>{fmt(order.balanceDue)}</span></div>
          )}
        </div>
      </div>
    </Modal>
  )
}
