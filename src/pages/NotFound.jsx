import { Link } from 'react-router-dom'
import { Compass, ArrowLeft } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'

export default function NotFound() {
  return (
    <>
      <PageHeader crumbs={['Not Found']} title="Page not found" />
      <div className="card">
        <div className="empty-state" style={{ padding: '70px 20px' }}>
          <div className="empty-icon" style={{ width: 72, height: 72 }}><Compass size={34} /></div>
          <b style={{ fontSize: 18 }}>This module isn’t available for your role</b>
          <p style={{ maxWidth: 380, margin: '8px auto 20px' }}>
            The page you’re looking for doesn’t exist or isn’t accessible with your current permissions.
          </p>
          <Link to="/app" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </div>
    </>
  )
}
