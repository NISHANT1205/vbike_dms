import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Boxes, Truck, BarChart3, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { loginRequest } from '../api/auth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [selectedRole, setSelectedRole] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('vbike_selected_role')
    if (!stored) {
      navigate('/select-role', { replace: true })
      return
    }
    setSelectedRole(JSON.parse(stored))
  }, [navigate])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loginRequest({ email, password, role: selectedRole.role_name.toLowerCase() })

      const dealer = data.data || data
      if ((dealer.dealerRole || '').toLowerCase() !== selectedRole.role_name.toLowerCase()) {
        throw new Error(`These credentials don't belong to a ${selectedRole.role_name}. Please select the correct role.`)
      }

      login(data)
      navigate('/app')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
 
  if (!selectedRole) return null

  return (
    <div className="login-page">
      {/* Left dark panel */}
      <div className="login-hero">
        <div className="lh-brand">
          <img src="/assets/PNG%20LOGO.png" alt="Vbike" />
          <b>Vbike</b>
        </div>

        <div className="lh-mid">
          <h2>Run your entire dealer network from one platform.</h2>
          <p>
            Inventory, purchase &amp; sales orders, dispatch and dealer
            onboarding — unified in a single enterprise dashboard.
          </p>
          <div className="login-features">
            <div className="lf"><span className="lf-ic"><Boxes size={18} /></span> Real-time inventory across warehouses</div>
            <div className="lf"><span className="lf-ic"><Truck size={18} /></span> End-to-end dispatch &amp; tracking</div>
            <div className="lf"><span className="lf-ic"><BarChart3 size={18} /></span> Live analytics &amp; exportable reports</div>
          </div>
        </div>

        <div className="lh-foot">© 2026 Vbike · All rights reserved</div>
      </div>

      {/* Right form panel */}
      <div className="login-form-side">
        <form className="login-card" onSubmit={submit}>

          {/* Selected role chip */}
          <div className="role-selected-chip">
            <span className="role-selected-label">{selectedRole.role_name}</span>
            <Link to="/select-role" className="role-change-link">
              <ArrowLeft size={12} /> Change role
            </Link>
          </div>

          <h1 style={{ marginTop: 20 }}>Sign In</h1>
          <p className="sub">Enter your credentials to access Vbike.</p>

          {error && (
            <div className="form-error">
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <div className="login-field">
            <label>Email</label>
            <div className="input-wrap">
              <Mail size={17} className="muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="login-field">
            <label>Password</label>
            <div className="input-wrap">
              <Lock size={17} className="muted" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <span className="eye" onClick={() => setShowPw((v) => !v)}>
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </span>
            </div>
          </div>

          <div className="login-row">
            <label className="checkbox">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            <a href="#" className="link" onClick={(e) => e.preventDefault()}>Forgot password?</a>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{ marginTop: 8, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in…' : <>Sign In <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  )
}
