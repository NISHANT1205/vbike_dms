import { useState } from 'react'
import { Save, AlertCircle } from 'lucide-react'
import Modal from './Modal'
import { createLedgerEntry } from '../../api/ledger'

function fmt(n) {
  if (n == null || isNaN(n)) return '—'
  return '₹' + Number(n).toLocaleString('en-IN')
}

export default function LedgerEntryFormModal({ prefill, dealers, dealersLoading, onClose, onSaved }) {
  const [form, setForm] = useState({
    dealer:      prefill?.dealerId || '',
    entryType:   prefill?.entryType || 'credit',
    baseAmount:  prefill?.baseAmount != null ? String(prefill.baseAmount) : '',
    gstPercent:  prefill?.gstPercent != null ? String(prefill.gstPercent) : '0',
    gstNumber:   prefill?.gstNumber || '',
    description: prefill?.rawDescription || '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const onChange = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const baseAmount = Number(form.baseAmount) || 0
  const gstPercent = Number(form.gstPercent) || 0
  const gstAmount  = baseAmount * (gstPercent / 100)
  const total      = baseAmount + gstAmount

  const submit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    const targetDealer = form.dealer
    if (!targetDealer) {
      setSubmitError('Select a dealer.')
      return
    }
    if (!baseAmount || baseAmount <= 0) {
      setSubmitError('Enter a valid amount.')
      return
    }
    if (!form.description.trim()) {
      setSubmitError('Description is required.')
      return
    }

    setSubmitting(true)
    try {
      await createLedgerEntry({
        dealer:      targetDealer,
        entryType:   form.entryType,
        baseAmount,
        gstPercent,
        gstNumber:   form.gstNumber.trim(),
        description: form.description.trim(),
      })
      onSaved()
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={prefill ? `New Entry — ${prefill.dealer}` : 'Add Ledger Entry'}
      subtitle="Record a credit (payment received) or debit (charge) entry"
      onClose={onClose}
      width={520}
    >
      {submitError && (
        <div className="form-error mb-20">
          <AlertCircle size={15} style={{ flexShrink: 0 }} /> {submitError}
        </div>
      )}

      <form onSubmit={submit}>
        <div className="form-grid">
          <div className="form-field full">
            <label htmlFor="lem-dealer">Dealer <span className="req">*</span></label>
            <select
              id="lem-dealer"
              className="form-control"
              value={form.dealer}
              onChange={(e) => onChange('dealer', e.target.value)}
              disabled={dealersLoading}
            >
              <option value="">{dealersLoading ? 'Loading dealers…' : 'Select dealer…'}</option>
              {dealers.map((d) => (
                <option key={d._id} value={d._id}>{d.companyName}{d.ownerName ? ` (${d.ownerName})` : ''}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="lem-type">Entry Type <span className="req">*</span></label>
            <select
              id="lem-type"
              className="form-control"
              value={form.entryType}
              onChange={(e) => onChange('entryType', e.target.value)}
            >
              <option value="credit">Credit — Payment Received</option>
              <option value="debit">Debit — Charge</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="lem-amount">Base Amount <span className="req">*</span></label>
            <input
              id="lem-amount"
              type="number"
              min={0}
              step="0.01"
              className="form-control"
              placeholder="e.g. 100000"
              value={form.baseAmount}
              onChange={(e) => onChange('baseAmount', e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="lem-gst">GST %</label>
            <input
              id="lem-gst"
              type="number"
              min={0}
              max={100}
              step="0.01"
              className="form-control"
              placeholder="e.g. 18"
              value={form.gstPercent}
              onChange={(e) => onChange('gstPercent', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="lem-gstnum">GST Number</label>
            <input
              id="lem-gstnum"
              type="text"
              className="form-control"
              placeholder="Optional — e.g. 07ABCDE1234F1Z5"
              value={form.gstNumber}
              onChange={(e) => onChange('gstNumber', e.target.value)}
            />
          </div>

          <div className="form-field full">
            <label htmlFor="lem-desc">Description <span className="req">*</span></label>
            <textarea
              id="lem-desc"
              className="form-control"
              rows={3}
              placeholder="e.g. Cash received / Service charge"
              value={form.description}
              onChange={(e) => onChange('description', e.target.value)}
            />
          </div>
        </div>

        {baseAmount > 0 && (
          <div style={{
            marginTop: 8, padding: '12px 16px', borderRadius: 9,
            background: 'var(--gray-50)', border: '1px solid var(--border)',
            display: 'flex', gap: 24, fontSize: 13,
          }}>
            <span className="muted">Base: <b style={{ color: 'var(--text-primary)' }}>{fmt(baseAmount)}</b></span>
            <span className="muted">GST: <b style={{ color: 'var(--text-primary)' }}>{fmt(gstAmount)}</b></span>
            <span className="muted">Total: <b style={{ color: 'var(--text-primary)' }}>{fmt(total)}</b></span>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : <><Save size={16} /> Save Entry</>}
          </button>
        </div>
      </form>
    </Modal>
  )
}
