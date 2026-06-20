import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { getRoutes } from './data/navigation'
import DashboardLayout from './components/layout/DashboardLayout'
import RoleSelect from './pages/RoleSelect'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProfilePage from './pages/ProfilePage'
import TablePage from './pages/TablePage'
import FormPage from './pages/FormPage'
import ReportPage from './pages/ReportPage'
import TimelinePage from './pages/TimelinePage'
import DealerOnboardingPage from './pages/DealerOnboardingPage'
import CreatePOPage from './pages/CreatePOPage'
import CreateManualSalePage from './pages/CreateManualSalePage'
import MappedDealersPage from './pages/MappedDealersPage'
import NotFound from './pages/NotFound'

function renderPage(route) {
  const crumbs = route.group ? [route.group, route.label] : [route.label]
  const common = { cfg: route.cfg, crumbs, title: route.label }
  switch (route.page) {
    case 'table':              return <TablePage {...common} />
    case 'form':                return <FormPage {...common} />
    case 'report':              return <ReportPage {...common} />
    case 'timeline':            return <TimelinePage {...common} />
    case 'dealer-onboard':      return <DealerOnboardingPage {...common} />
    case 'create-po':           return <CreatePOPage {...common} />
    case 'create-manual-sale':  return <CreateManualSalePage {...common} />
    case 'mapped-dealers':      return <MappedDealersPage {...common} />
    default:                    return <Dashboard />
  }
}

export default function App() {
  const { user } = useAuth()
  const routes = user ? getRoutes(user.id) : []

  return (
    <Routes>
      {/* Pre-login flow: role selection → login */}
      <Route path="/select-role" element={user ? <Navigate to="/app" replace /> : <RoleSelect />} />
      <Route path="/login"       element={user ? <Navigate to="/app" replace /> : <Login />} />

      {/* Protected app shell */}
      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<ProfilePage crumbs={['My Profile']} title="My Profile" />} />
        {routes
          .filter((r) => r.slug)
          .map((r) => (
            <Route key={r.slug} path={r.slug} element={renderPage(r)} />
          ))}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Root + catch-all */}
      <Route path="/"  element={<Navigate to={user ? '/app' : '/select-role'} replace />} />
      <Route path="*"  element={<Navigate to={user ? '/app' : '/select-role'} replace />} />
    </Routes>
  )
}
