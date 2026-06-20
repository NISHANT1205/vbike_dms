import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown, Store, ShieldCheck, Circle, ArrowRight, AlertCircle } from 'lucide-react'
import { fetchRoles } from '../api/roles'

const ROLE_ICON_MAP = {
  'Super Stockist':   Crown,
  'Exclusive Dealer': Store,
  'Sub Dealer':       ShieldCheck,
}

function getRoleIcon(roleName) {
  return ROLE_ICON_MAP[roleName] || Circle
}

export default function RoleSelect() {
  const navigate = useNavigate()
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRoles()
      .then(setRoles)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const selectRole = (role) => {
    localStorage.setItem('vbike_selected_role', JSON.stringify(role))
    navigate('/login')
  }

  return (
    <div className="login-page">
      {/* Left dark panel — brand GIF */}
      <div className="login-hero">
        <div className="lh-brand">
          <img src="/assets/PNG%20LOGO.png" alt="Vbike" />
          <b>Vbike</b>
        </div>

        <div className="lh-mid hero-gif-wrap">
          <img
            src="/assets/Comp%202mov.gif"
            alt="Vbike"
            className="hero-gif"
          />
          <h2 style={{ marginTop: 28 }}>Dealer Management<br />Made Simple.</h2>
          <p>
            One platform to manage inventory, orders, dispatch
            and your entire dealer network.
          </p>
        </div>

        <div className="lh-foot">© 2026 Vbike · All rights reserved</div>
      </div>

      {/* Right panel — role selection */}
      <div className="login-form-side">
        <div className="login-card">
          <h1>Welcome back</h1>
          <p className="sub" style={{ marginBottom: 32 }}>
            Select your role to continue.
          </p>

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="spinner" />
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 14 }}>
                Loading roles…
              </p>
            </div>
          )}

          {error && (
            <div className="form-error">
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {!loading && !error && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {roles.map((r) => {
                const Icon = getRoleIcon(r.role_name)
                return (
                  <button
                    key={r._id}
                    className="role-card"
                    onClick={() => selectRole(r)}
                  >
                    <div className="role-card-icon">
                      <Icon size={20} />
                    </div>
                    <div className="role-card-info">
                      <b>{r.role_name}</b>
                      <span>{r.description}</span>
                    </div>
                    <ArrowRight size={18} style={{ color: '#a8a8a8', flexShrink: 0 }} />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
