import { useState } from 'react'
import { Save, AlertCircle } from 'lucide-react'
import Modal from './Modal'
import { respondToQuery, updateQueryStatus } from '../../api/queries'

const STATUS_OPTIONS = ['open', 'responded', 'closed']

export default function QueryRespondModal({ query, onClose, onSaved }) {
  const [response, setResponse] = useState(query.response || '')
  const [status, setStatus]     = useState(query.status.toLowerCase())
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitting(true)
    try {
      if (response.trim() && response.trim() !== query.response) {
        await respondToQuery(query.id, response.trim())
      }
      if (status !== query.status.toLowerCase()) {
        await updateQueryStatus(query.id, status)
      }
      onSaved()
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={`Respond — ${query.subject}`} subtitle={`Raised by: ${query.dealer}`} onClose={onClose} width={520}>
      {submitError && (
        <div className="form-error mb-20">
          <AlertCircle size={15} style={{ flexShrink: 0 }} /> {submitError}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Message</div>
        <div style={{
          padding: '10px 14px', borderRadius: 9, background: 'var(--gray-50)',
          border: '1px solid var(--border)', fontSize: 13.5, lineHeight: 1.5,
        }}>
          {query.message || '—'}
        </div>
      </div>

      <form onSubmit={submit}>
        <div className="form-grid">
          <div className="form-field full">
            <label htmlFor="qr-response">Response</label>
            <textarea
              id="qr-response"
              className="form-control"
              rows={3}
              placeholder="e.g. 2 din me dispatch ho jayega"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="qr-status">Status</label>
            <select id="qr-status" className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : <><Save size={16} /> Save</>}
          </button>
        </div>
      </form>
    </Modal>
  )
}
