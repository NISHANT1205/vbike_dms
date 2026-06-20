import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, AlertCircle, Phone, Mail } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { useAuth } from '../context/AuthContext'
import { fetchDealer } from '../api/dealers'

function toList(x) {
  if (Array.isArray(x)) return x
  return x ? [x] : []
}

function DealerCard({ dealer }) {
  return (
    <div className="card">
      <div className="card-body">
        <div style={{ fontWeight: 600, fontSize: 15 }}>{dealer.companyName || '—'}</div>
        <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{dealer.ownerName || '—'}</div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13.5 }}>
          <span className="flex items-center gap-2"><Phone size={14} className="muted" /> {dealer.phone || '—'}</span>
          <span className="flex items-center gap-2"><Mail size={14} className="muted" /> {dealer.email || '—'}</span>
        </div>
      </div>
    </div>
  )
}

export default function MappedDealersPage({ crumbs, title }) {
  const { user } = useAuth()

  const [dealer, setDealer]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const load = useCallback(() => {
    if (!user?.dealerId) return
    setLoading(true)
    setError('')
    fetchDealer(user.dealerId)
      .then(setDealer)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user?.dealerId])

  useEffect(() => { load() }, [load])

  const exclusiveDealers = toList(dealer?.mappedExclusiveDealer)
  const subDealers       = toList(dealer?.mappedSubDealer)

  return (
    <>
      <PageHeader
        crumbs={crumbs}
        title={title || 'Mapped Dealers'}
        subtitle="Dealers you have onboarded and mapped below you"
        actions={
          <button className="btn btn-ghost" onClick={load}>
            <RefreshCw size={16} /> Refresh
          </button>
        }
      />

      {loading && (
        <div className="card mb-20">
          <div className="card-body flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            Loading…
          </div>
        </div>
      )}

      {error && (
        <div className="form-error mb-20">
          <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {exclusiveDealers.length > 0 && (
            <div className="mb-24">
              <h3 style={{ marginBottom: 12 }}>Mapped Exclusive Dealers</h3>
              <div className="grid grid-2">
                {exclusiveDealers.map((d) => <DealerCard key={d._id} dealer={d} />)}
              </div>
            </div>
          )}

          {subDealers.length > 0 && (
            <div className="mb-24">
              <h3 style={{ marginBottom: 12 }}>Mapped Sub Dealers</h3>
              <div className="grid grid-2">
                {subDealers.map((d) => <DealerCard key={d._id} dealer={d} />)}
              </div>
            </div>
          )}

          {exclusiveDealers.length === 0 && subDealers.length === 0 && (
            <div className="card">
              <div className="empty-state">
                <p>No dealers mapped to you yet. Onboard a dealer to see them here.</p>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
