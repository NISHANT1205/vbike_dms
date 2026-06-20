import { useState } from 'react'
import { Send, AlertCircle } from 'lucide-react'
import Modal from './Modal'
import { raiseQuery } from '../../api/queries'

export default function RaiseQueryModal({ dealerId, onClose, onSaved }) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (!subject.trim() || !message.trim()) {
      setSubmitError('Subject and message are both required.')
      return
    }

    setSubmitting(true)
    try {
      await raiseQuery({ dealer: dealerId, subject: subject.trim(), message: message.trim() })
      onSaved()
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Raise a Query" subtitle="This will be sent to your mapped supplier automatically" onClose={onClose} width={520}>
      {submitError && (
        <div className="form-error mb-20">
          <AlertCircle size={15} style={{ flexShrink: 0 }} /> {submitError}
        </div>
      )}

      <form onSubmit={submit}>
        <div className="form-grid">
          <div className="form-field full">
            <label htmlFor="rq-subject">Subject <span className="req">*</span></label>
            <input
              id="rq-subject"
              type="text"
              className="form-control"
              placeholder="e.g. Stock issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="form-field full">
            <label htmlFor="rq-message">Message <span className="req">*</span></label>
            <textarea
              id="rq-message"
              className="form-control"
              rows={4}
              placeholder="Describe your query in detail…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Sending…' : <><Send size={16} /> Send Query</>}
          </button>
        </div>
      </form>
    </Modal>
  )
}
