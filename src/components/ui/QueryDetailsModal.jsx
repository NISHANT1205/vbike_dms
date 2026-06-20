import Modal from './Modal'
import Badge from './Badge'

export default function QueryDetailsModal({ query, onClose }) {
  if (!query) return null

  return (
    <Modal title={query.subject} subtitle={`Raised on: ${query.date}`} onClose={onClose} width={560}>
      <div className="flex items-center justify-between mb-20" style={{ gap: 12 }}>
        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Raised By</div>
            <div style={{ fontWeight: 600 }}>{query.dealer}</div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Recipient</div>
            <div style={{ fontWeight: 600 }}>{query.recipient}</div>
          </div>
        </div>
        <Badge value={query.status} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Message</div>
        <div style={{
          padding: '10px 14px', borderRadius: 9, background: 'var(--gray-50)',
          border: '1px solid var(--border)', fontSize: 13.5, lineHeight: 1.5,
        }}>
          {query.message || '—'}
        </div>
      </div>

      <div>
        <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Response</div>
        <div style={{
          padding: '10px 14px', borderRadius: 9,
          background: query.response ? 'var(--green-50, #f0fdf4)' : 'var(--gray-50)',
          border: '1px solid var(--border)', fontSize: 13.5, lineHeight: 1.5,
          color: query.response ? undefined : 'var(--text-muted)',
        }}>
          {query.response || 'No response yet.'}
        </div>
      </div>
    </Modal>
  )
}
