import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { ChevronRight, ShieldCheck } from 'lucide-react'
import { NAVIGATION } from '../../data/navigation'
import { useAuth } from '../../context/AuthContext'

function NavIcon({ name, size = 18 }) {
  const Icon = Icons[name] || Icons.Circle
  return <span className="nav-icon"><Icon size={size} /></span>
}

export default function Sidebar({ collapsed, mobileOpen, onCloseMobile }) {
  const { user } = useAuth()
  const location = useLocation()
  const tree = NAVIGATION[user?.id] || NAVIGATION.super_stockist

  // open groups containing the active route by default
  const initialOpen = {}
  tree.forEach((node) => {
    if (node.children?.some((c) => location.pathname === `/app/${c.slug}`)) initialOpen[node.label] = true
  })
  const [open, setOpen] = useState(initialOpen)
  const toggle = (label) => setOpen((o) => ({ ...o, [label]: !o[label] }))

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand">
        <img src="/assets/PNG%20LOGO.png" alt="Vbike" />
        <div className="brand-text">
          <b>Vbike</b>
          <span>Dealer Management</span>
        </div>
      </div>

      <div className="sidebar-role">
        <div className="role-dot"><ShieldCheck size={17} /></div>
        <div className="role-meta">
          <b>{user?.label}</b>
          <span>{user?.company}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {tree.map((node) => {
          if (!node.children) {
            return (
              <NavLink
                key={node.label}
                to={`/app/${node.slug}`}
                end
                onClick={onCloseMobile}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <NavIcon name={node.icon} />
                <span className="nav-label">{node.label}</span>
              </NavLink>
            )
          }
          const isOpen = open[node.label]
          return (
            <div key={node.label}>
              <div className={`nav-item ${isOpen ? '' : ''}`} onClick={() => toggle(node.label)}>
                <NavIcon name={node.icon} />
                <span className="nav-label">{node.label}</span>
                <ChevronRight size={15} className={`nav-chevron ${isOpen ? 'open' : ''}`} />
              </div>
              {isOpen && (
                <div className="nav-sub">
                  {node.children.map((child) => (
                    <NavLink
                      key={child.slug}
                      to={`/app/${child.slug}`}
                      onClick={onCloseMobile}
                      className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
