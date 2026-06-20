import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

/* Converts API role_name to the navigation key used in navigation.js
   "Super Stockist"   → "super_stockist"
   "Exclusive Dealer" → "exclusive_dealer"
   "Sub Dealer"       → "sub_dealer"                                  */
function roleNameToNavId(roleName = '') {
  return roleName.toLowerCase().replace(/\s+/g, '_') || 'super_stockist'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vbike_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  /* Called after a successful /dealers/login API response.
     apiData shape: { status, message, data: { id, companyName, ownerName,
                      phone, email, dealerRole, token } }               */
  const login = useCallback((apiData) => {
    const d = apiData.data || apiData

    // Read the role the user selected on the RoleSelect page
    const storedRole = (() => {
      try { return JSON.parse(localStorage.getItem('vbike_selected_role') || '{}') }
      catch { return {} }
    })()

    const roleName = storedRole.role_name || ''
    const navId    = roleNameToNavId(roleName)

    // Build initials from owner name
    const name     = d.ownerName || ''
    const initials = name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'VB'

    const u = {
      id:           navId,              // used by navigation.js + App.jsx for routing
      dealerId:     d.id || '',         // dealer's DB _id — used in PO and other API calls
      label:        roleName,
      short:        roleName,
      name,
      company:      d.companyName || '',
      email:        d.email || '',
      phone:        d.phone || '',
      dealerRoleId: d.dealerRole || '', // role name string from API (e.g. "Super Stockist")
      initials,
      token:        d.token || '',
    }

    setUser(u)
    localStorage.setItem('vbike_user',  JSON.stringify(u))
    localStorage.setItem('vbike_token', d.token || '')   // stored separately for getAuthHeaders()
    return u
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('vbike_user')
    localStorage.removeItem('vbike_token')
    localStorage.removeItem('vbike_selected_role')
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
