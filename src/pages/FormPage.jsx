import { useState } from 'react'
import { Save, RotateCcw, CheckCircle2 } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { FORM_CONFIGS } from '../data/mockData'

function Field({ f, value, onChange }) {
  const common = { id: f.name, name: f.name, value: value ?? '', onChange: (e) => onChange(f.name, e.target.value), required: f.req, placeholder: f.placeholder, className: 'form-control' }
  return (
    <div className={`form-field ${f.full ? 'full' : ''}`}>
      <label htmlFor={f.name}>{f.label} {f.req && <span className="req">*</span>}</label>
      {f.type === 'select' ? (
        <select {...common}>
          <option value="">Select {f.label.toLowerCase()}…</option>
          {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : f.type === 'textarea' ? (
        <textarea {...common} rows={4} />
      ) : (
        <input type={f.type || 'text'} {...common} />
      )}
    </div>
  )
}

export default function FormPage({ cfg, crumbs, title }) {
  const config = FORM_CONFIGS[cfg]
  const [values, setValues] = useState({})
  const [submitted, setSubmitted] = useState(false)

  if (!config) return <div className="card"><div className="card-body">Unknown form: {cfg}</div></div>

  const onChange = (name, val) => setValues((v) => ({ ...v, [name]: val }))
  const submit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3500)
  }
  const reset = () => setValues({})

  return (
    <>
      <PageHeader crumbs={crumbs} title={title || config.title} subtitle={config.subtitle} />

      {submitted && (
        <div className="card mb-20" style={{ borderColor: 'var(--green-500)', background: 'var(--green-50)' }}>
          <div className="card-body flex items-center gap-3" style={{ color: 'var(--green-700)' }}>
            <CheckCircle2 size={22} />
            <div><b>{title || config.title} submitted successfully.</b><div style={{ fontSize: 13 }}>Your record has been saved and is being processed.</div></div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 880 }}>
        <form className="card" onSubmit={submit}>
          <div className="card-body">
            <div className="form-grid">
              {config.fields.map((f) => (
                <Field key={f.name} f={f} value={values[f.name]} onChange={onChange} />
              ))}
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={reset}><RotateCcw size={16} /> Reset</button>
              <button type="submit" className={`btn ${config.tone === 'success' ? 'btn-success' : 'btn-primary'}`}>
                <Save size={16} /> {config.submit}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
