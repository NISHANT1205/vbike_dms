import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'
import {
  Menu, PanelLeftClose, PanelLeftOpen, Search, Bell, Settings, User,
  LogOut, ChevronDown, CheckCheck, HelpCircle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { NOTIFICATIONS } from '../../data/mockData'

function useOutside(ref, cb) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) cb() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, cb])
}

export default function Header({ collapsed, onToggleCollapse, onToggleMobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [openNotif, setOpenNotif] = useState(false)
  const [openProfile, setOpenProfile] = useState(false)
  const notifRef = useRef(null)
  const profileRef = useRef(null)
  useOutside(notifRef, () => setOpenNotif(false))
  useOutside(profileRef, () => setOpenProfile(false))

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <header className="header">
      <button className="icon-btn mobile-only" onClick={onToggleMobile} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <button className="icon-btn" onClick={onToggleCollapse} aria-label="Collapse sidebar">
        {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
      </button>

      <div className="header-search">
        <Search size={17} className="muted" />
        <input placeholder="Search orders, products, dealers…" />
        <span className="kbd">Ctrl K</span>
      </div>

      <div style={{ flex: 1 }} />

      <button className="icon-btn" aria-label="Help"><HelpCircle size={19} /></button>

      <div ref={notifRef} style={{ position: 'relative' }}>
        <button className="icon-btn" onClick={() => setOpenNotif((v) => !v)} aria-label="Notifications">
          <Bell size={19} />
          <span className="badge-dot" />
        </button>
        {openNotif && (
          <div className="dropdown" style={{ minWidth: 320 }}>
            <div className="dropdown-head flex items-center justify-between">
              <b>Notifications</b>
              <button className="link" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCheck size={14} /> Mark all read
              </button>
            </div>
            {NOTIFICATIONS.map((n, i) => {
              const Icon = Icons[n.icon] || Icons.Bell
              return (
                <div className="notif-item" key={i}>
                  <div className="notif-icon" style={{ background: n.bg, color: n.color }}><Icon size={16} /></div>
                  <div>
                    <p>{n.text}</p>
                    <small>{n.time}</small>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <button className="icon-btn" aria-label="Settings"><Settings size={19} /></button>

      <div ref={profileRef} style={{ position: 'relative' }}>
        <button className="profile-chip" onClick={() => setOpenProfile((v) => !v)}>
          <div className="avatar">{user?.initials}</div>
          <div className="pf-meta">
            <b>{user?.name}</b>
            <span>{user?.label}</span>
          </div>
          <ChevronDown size={16} className="muted" />
        </button>
        {openProfile && (
          <div className="dropdown">
            <div className="dropdown-head">
              <b>{user?.name}</b>
              <div className="muted" style={{ fontSize: 12.5 }}>{user?.email}</div>
            </div>
            <button className="dropdown-item" onClick={() => { setOpenProfile(false); navigate('/app/profile') }}>
              <User size={16} /> My Profile
            </button>
            {/* <button className="dropdown-item"><Settings size={16} /> Account Settings</button> */}
            {/* <button className="dropdown-item"><HelpCircle size={16} /> Help & Support</button> */}
            <div className="dropdown-divider" />
            <button className="dropdown-item danger" onClick={handleLogout}><LogOut size={16} /> Sign Out</button>
          </div>
        )}
      </div>
    </header>
  )
}
