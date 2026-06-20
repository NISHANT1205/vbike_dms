import Modal from './Modal'
import Badge from './Badge'

const fmt = (n) => (n == null || isNaN(n) ? '—' : '₹' + Number(n).toLocaleString('en-IN'))

export default function LedgerEntryDetailsModal({ entry, onClose }) {
  if (!entry) return null

  const row = (label, value) => (
    <div className="flex justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span className="muted" style={{ fontSize: 13 }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 500 }}>{value}</span>
    </div>
  )

  return (
    <Modal title={entry.reference} subtitle={`Date: ${entry.date}`} onClose={onClose} width={520}>
      <div className="flex items-center justify-between mb-20" style={{ gap: 12 }}>
        <div>
          <div className="muted" style={{ fontSize: 12 }}>Dealer</div>
          <div style={{ fontWeight: 600 }}>{entry.dealer}</div>
        </div>
        <Badge value={entry.entryType === 'debit' ? 'Debit' : 'Credit'} />
      </div>

      {row('Description', entry.rawDescription || entry.description)}
      {row('Reference Type', entry.referenceType || '—')}
      {row('Base Amount', fmt(entry.baseAmount))}
      {row('GST %', entry.gstPercent ? `${entry.gstPercent}%` : '—')}
      {row('GST Amount', fmt(entry.gstAmount))}
      {entry.gstNumber && row('GST Number', entry.gstNumber)}
      {row('Total Amount', fmt(entry.amount))}
      {row('Balance After', fmt(entry.balanceAfter))}
    </Modal>
  )
}
