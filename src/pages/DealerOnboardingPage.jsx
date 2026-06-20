import { useState, useEffect } from 'react'
import { Save, RotateCcw, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { useAuth } from '../context/AuthContext'
import { fetchRoles } from '../api/roles'
import { createDealer } from '../api/dealers'

/* Which role_names each cfg is allowed to create */
const ALLOWED_TYPES = {
  super:     ['Exclusive Dealer', 'Sub Dealer'],
  exclusive: ['Sub Dealer'],
}

const INITIAL = {
  companyName: '', ownerName: '', phone: '', email: '',
  password: '', confirmPassword: '',
  fullAddress: '', city: '', state: '', pincode: '', coverageArea: '',
  gstNumber: '', creditLimit: '', setPrice: '',
  remarks: '',
}

function Field({ label, name, type = 'text', value, onChange, required, placeholder, full, children }) {
  return (
    <div className={`form-field${full ? ' full' : ''}`}>
      <label htmlFor={name}>{label}{required && <span className="req"> *</span>}</label>
      {children ?? (
        <input
          id={name} name={name} type={type}
          className="form-control"
          value={value} onChange={(e) => onChange(name, e.target.value)}
          required={required} placeholder={placeholder}
        />
      )}
    </div>
  )
}

export default function DealerOnboardingPage({ cfg = 'super', crumbs, title }) {
  const { user } = useAuth()
  const allowedTypes = ALLOWED_TYPES[cfg] || ['Sub Dealer']

  const [form, setForm]             = useState(INITIAL)
  const [dealerTypeName, setType]   = useState(allowedTypes.length === 1 ? allowedTypes[0] : '')
  const [roles, setRoles]           = useState([])
  const [rolesErr, setRolesErr]     = useState('')
  const [rolesLoading, setRolesLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess]       = useState(false)

  const loadRoles = () => {
    setRolesLoading(true)
    setRolesErr('')
    fetchRoles()
      .then((r) => setRoles(r.filter((x) => allowedTypes.includes(x.role_name))))
      .catch((err) => setRolesErr(err.message))
      .finally(() => setRolesLoading(false))
  }

  useEffect(loadRoles, []) // eslint-disable-line

  const set = (name, val) => setForm((f) => ({ ...f, [name]: val }))

  const reset = () => {
    setForm(INITIAL)
    setType(allowedTypes.length === 1 ? allowedTypes[0] : '')
    setSuccess(false)
    setSubmitError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (!dealerTypeName) { setSubmitError('Please select a dealer type.'); return }
    if (form.password !== form.confirmPassword) { setSubmitError('Passwords do not match.'); return }
    if (!user?.dealerId) { setSubmitError('Your dealer ID was not found. Please log out and log in again.'); return }

    const matchedRole = roles.find((r) => r.role_name === dealerTypeName)
    if (!matchedRole) { setSubmitError('Dealer type not found — please click Retry next to Dealer Type.'); return }

    setSubmitting(true)
    try {
      await createDealer({
        companyName:       form.companyName,
        ownerName:         form.ownerName,
        phone:             form.phone,
        email:             form.email,
        password:          form.password,
        confirmPassword:   form.confirmPassword,
        dealerRole:        matchedRole._id,
        createdByDealer:   user.dealerId,
        fullAddress:       form.fullAddress,
        city:              form.city,
        state:             form.state,
        pincode:           form.pincode,
        coverageArea:      form.coverageArea,
        gstNumber:         form.gstNumber,
        creditLimit:       Number(form.creditLimit) || 0,
        setPrice:          Number(form.setPrice) || 0,
        remarks:           form.remarks,
      })
      setSuccess(true)
      setForm(INITIAL)
      setType(allowedTypes.length === 1 ? allowedTypes[0] : '')
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader crumbs={crumbs} title={title} subtitle="Complete the form to onboard a new dealer" />

      {success && (
        <div className="card mb-20" style={{ borderColor: '#4ade80', background: '#f0fdf4' }}>
          <div className="card-body flex items-center gap-3" style={{ color: '#166534' }}>
            <CheckCircle2 size={22} />
            <div>
              <b>{dealerTypeName} onboarded successfully.</b>
              <div style={{ fontSize: 13 }}>The dealer account has been created.</div>
            </div>
          </div>
        </div>
      )}

      {submitError && (
        <div className="form-error mb-20">
          <AlertCircle size={15} style={{ flexShrink: 0 }} /> {submitError}
        </div>
      )}

      <form onSubmit={submit} style={{ maxWidth: 900 }}>

        {/* ── Dealer Type ── */}
        <div className="card mb-20">
          <div className="card-head"><h3>Dealer Type</h3></div>
          <div className="card-body">
            <div className="form-grid">
              {allowedTypes.length === 1 ? (
                /* Exclusive dealer can only add Sub Dealers — show fixed label */
                <div className="form-field">
                  <label>Dealer Type</label>
                  <input className="form-control" value="Sub Dealer" readOnly style={{ background: 'var(--gray-50)', color: 'var(--text-muted)' }} />
                </div>
              ) : rolesLoading ? (
                <div className="form-field">
                  <label>Dealer Type <span className="req">*</span></label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 42 }}>
                    <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading…</span>
                  </div>
                </div>
              ) : rolesErr ? (
                <div className="form-field">
                  <label>Dealer Type <span className="req">*</span></label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: 'var(--red-600)' }}>{rolesErr}</span>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={loadRoles}>
                      <RefreshCw size={14} /> Retry
                    </button>
                  </div>
                </div>
              ) : (
                <div className="form-field">
                  <label htmlFor="dealerType">Dealer Type <span className="req">*</span></label>
                  <select
                    id="dealerType" className="form-control"
                    value={dealerTypeName} onChange={(e) => setType(e.target.value)} required
                  >
                    <option value="">Select dealer type…</option>
                    {roles.map((r) => (
                      <option key={r._id} value={r.role_name}>{r.role_name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Basic Information ── */}
        <div className="card mb-20">
          <div className="card-head"><h3>Basic Information</h3></div>
          <div className="card-body">
            <div className="form-grid">
              <Field label="Company / Firm Name" name="companyName" value={form.companyName} onChange={set} required />
              <Field label="Owner Name"           name="ownerName"   value={form.ownerName}   onChange={set} required />
              <Field label="Phone" name="phone" type="tel"   value={form.phone} onChange={set} required placeholder="10-digit mobile" />
              <Field label="Email" name="email" type="email" value={form.email} onChange={set} required placeholder="dealer@company.com" />
              <Field label="Password"         name="password"        type="password" value={form.password}        onChange={set} required />
              <Field label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={set} required />
            </div>
          </div>
        </div>

        {/* ── Address ── */}
        <div className="card mb-20">
          <div className="card-head"><h3>Address</h3></div>
          <div className="card-body">
            <div className="form-grid">
              <Field label="Full Address" name="fullAddress" value={form.fullAddress} onChange={set} required full>
                <textarea id="fullAddress" className="form-control" rows={3}
                  value={form.fullAddress} onChange={(e) => set('fullAddress', e.target.value)}
                  required placeholder="Street, landmark, area…" />
              </Field>
              <Field label="City"          name="city"         value={form.city}         onChange={set} required />
              <Field label="State"         name="state"        value={form.state}        onChange={set} required />
              <Field label="Pincode"       name="pincode"      value={form.pincode}      onChange={set} required placeholder="6-digit pincode" />
              <Field label="Coverage Area" name="coverageArea" value={form.coverageArea} onChange={set} placeholder="e.g. North Jaipur" />
            </div>
          </div>
        </div>

        {/* ── Business Details ── */}
        <div className="card mb-20">
          <div className="card-head"><h3>Business Details</h3></div>
          <div className="card-body">
            <div className="form-grid">
              <Field label="GST Number"        name="gstNumber"    value={form.gstNumber}    onChange={set} required placeholder="e.g. 08ABCDE1234F1Z5" />
              <Field label="Credit Limit (₹)"  name="creditLimit"  type="number" value={form.creditLimit} onChange={set} required placeholder="e.g. 50000" />
              <Field label="Set Price (₹)"     name="setPrice"     type="number" value={form.setPrice}    onChange={set} placeholder="e.g. 1000" />
            </div>
          </div>
        </div>

        {/* ── Additional ── */}
        <div className="card mb-20">
          <div className="card-head"><h3>Additional</h3></div>
          <div className="card-body">
            <div className="form-grid">
              <Field label="Remarks" name="remarks" value={form.remarks} onChange={set} full>
                <textarea id="remarks" className="form-control" rows={3}
                  value={form.remarks} onChange={(e) => set('remarks', e.target.value)}
                  placeholder="Optional notes about this dealer…" />
              </Field>
            </div>
          </div>
        </div>

        <div className="form-actions" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <button type="button" className="btn btn-ghost" onClick={reset} disabled={submitting}>
            <RotateCcw size={16} /> Reset
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting…' : <><Save size={16} /> Onboard Dealer</>}
          </button>
        </div>

      </form>
    </>
  )
}
