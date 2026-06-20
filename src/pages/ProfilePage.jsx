import { useState, useEffect, useCallback } from 'react'
import { Save, RotateCcw, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { useAuth } from '../context/AuthContext'
import { fetchDealer, updateDealer } from '../api/dealers'

const EDITABLE_INITIAL = { phone: '', fullAddress: '', city: '', state: '', pincode: '', password: '', confirmPassword: '' }

function ReadOnlyField({ label, value }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <input className="form-control" value={value || '—'} readOnly style={{ background: 'var(--gray-50)', color: 'var(--text-muted)' }} />
    </div>
  )
}

export default function ProfilePage({ crumbs, title }) {
  const { user } = useAuth()

  const [dealer, setDealer]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadErr, setLoadErr] = useState('')

  const [form, setForm]               = useState(EDITABLE_INITIAL)
  const [submitting, setSubmitting]   = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess]         = useState(false)

  const load = useCallback(() => {
    if (!user?.dealerId) return
    setLoading(true)
    setLoadErr('')
    fetchDealer(user.dealerId)
      .then((d) => {
        setDealer(d)
        setForm({
          phone:           d.phone || '',
          fullAddress:     d.fullAddress || '',
          city:            d.city || '',
          state:           d.state || '',
          pincode:         d.pincode || '',
          password:        '',
          confirmPassword: '',
        })
      })
      .catch((err) => setLoadErr(err.message))
      .finally(() => setLoading(false))
  }, [user?.dealerId])

  useEffect(() => { load() }, [load])

  const set = (name, val) => { setForm((f) => ({ ...f, [name]: val })); setSuccess(false) }

  const submit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setSuccess(false)

    if ((form.password || form.confirmPassword) && form.password !== form.confirmPassword) {
      setSubmitError('Passwords do not match.')
      return
    }

    const payload = {
      phone:       form.phone,
      fullAddress: form.fullAddress,
      city:        form.city,
      state:       form.state,
      pincode:     form.pincode,
    }
    if (form.password) {
      payload.password = form.password
      payload.confirmPassword = form.confirmPassword
    }

    setSubmitting(true)
    try {
      await updateDealer(user.dealerId, payload)
      setSuccess(true)
      setForm((f) => ({ ...f, password: '', confirmPassword: '' }))
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader crumbs={crumbs} title={title || 'My Profile'} subtitle="View and update your account details" />
        <div className="card">
          <div className="card-body flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            Loading…
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader crumbs={crumbs} title={title || 'My Profile'} subtitle="View and update your account details" />

      {loadErr && (
        <div className="form-error mb-20">
          <AlertCircle size={15} style={{ flexShrink: 0 }} /> {loadErr}
          <button type="button" className="btn btn-ghost btn-sm" onClick={load} style={{ marginLeft: 'auto' }}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {success && (
        <div className="card mb-20" style={{ borderColor: '#4ade80', background: '#f0fdf4' }}>
          <div className="card-body flex items-center gap-3" style={{ color: '#166534' }}>
            <CheckCircle2 size={22} />
            <b>Profile updated successfully.</b>
          </div>
        </div>
      )}

      {submitError && (
        <div className="form-error mb-20">
          <AlertCircle size={15} style={{ flexShrink: 0 }} /> {submitError}
        </div>
      )}

      {!loadErr && (
        <form onSubmit={submit} style={{ maxWidth: 900 }}>

          {/* ── Account Information (read-only) ── */}
          <div className="card mb-20">
            <div className="card-head"><h3>Account Information</h3></div>
            <div className="card-body">
              <div className="form-grid">
                <ReadOnlyField label="Company / Firm Name" value={dealer?.companyName} />
                <ReadOnlyField label="Owner Name" value={dealer?.ownerName} />
                <ReadOnlyField label="Email" value={dealer?.email} />
                <ReadOnlyField label="Dealer Type" value={dealer?.dealerRole?.role_name || user?.label} />
                <ReadOnlyField label="GST Number" value={dealer?.gstNumber} />
                <ReadOnlyField label="PAN Number" value={dealer?.panNumber} />
              </div>
            </div>
          </div>

          {/* ── Contact & Address (editable) ── */}
          <div className="card mb-20">
            <div className="card-head"><h3>Contact & Address</h3></div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="pf-phone">Phone</label>
                  <input
                    id="pf-phone" type="tel" className="form-control"
                    value={form.phone} onChange={(e) => set('phone', e.target.value)}
                    placeholder="10-digit mobile"
                  />
                </div>
                <div className="form-field full">
                  <label htmlFor="pf-address">Full Address</label>
                  <textarea
                    id="pf-address" className="form-control" rows={3}
                    value={form.fullAddress} onChange={(e) => set('fullAddress', e.target.value)}
                    placeholder="Street, landmark, area…"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="pf-city">City</label>
                  <input id="pf-city" className="form-control" value={form.city} onChange={(e) => set('city', e.target.value)} />
                </div>
                <div className="form-field">
                  <label htmlFor="pf-state">State</label>
                  <input id="pf-state" className="form-control" value={form.state} onChange={(e) => set('state', e.target.value)} />
                </div>
                <div className="form-field">
                  <label htmlFor="pf-pincode">Pincode</label>
                  <input
                    id="pf-pincode" className="form-control"
                    value={form.pincode} onChange={(e) => set('pincode', e.target.value)}
                    placeholder="6-digit pincode"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Change Password (optional) ── */}
          <div className="card mb-20">
            <div className="card-head"><h3>Change Password</h3></div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="pf-password">New Password</label>
                  <input
                    id="pf-password" type="password" className="form-control"
                    value={form.password} onChange={(e) => set('password', e.target.value)}
                    placeholder="Leave blank to keep current password"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="pf-confirm">Confirm New Password</label>
                  <input
                    id="pf-confirm" type="password" className="form-control"
                    value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)}
                    placeholder="Leave blank to keep current password"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <button type="button" className="btn btn-ghost" onClick={load} disabled={submitting}>
              <RotateCcw size={16} /> Discard Changes
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : <><Save size={16} /> Save Changes</>}
            </button>
          </div>

        </form>
      )}
    </>
  )
}
