import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Download, AlertCircle, RefreshCw, Truck, CheckCircle2, Eye, FilePlus, MessageSquareReply, Trash2 } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import POOrderDetailsModal from '../components/ui/POOrderDetailsModal'
import InvoicePrintView from '../components/ui/InvoicePrintView'
import LedgerEntryDetailsModal from '../components/ui/LedgerEntryDetailsModal'
import LedgerDealerEntriesModal from '../components/ui/LedgerDealerEntriesModal'
import LedgerEntryFormModal from '../components/ui/LedgerEntryFormModal'
import RaiseQueryModal from '../components/ui/RaiseQueryModal'
import QueryDetailsModal from '../components/ui/QueryDetailsModal'
import QueryRespondModal from '../components/ui/QueryRespondModal'
import { TABLE_CONFIGS } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { fetchPurchaseOrderHistory, fetchIncomingPurchaseOrders } from '../api/purchaseOrders'
import { fetchERPInventory, fetchInventoryTransactionSummary } from '../api/inventory'
import { createDispatch } from '../api/dispatches'
import { fetchInvoices } from '../api/invoices'
import { fetchSalesOrders, fetchManualSalesOrders, deleteSalesOrder } from '../api/salesOrders'
import { fetchLedger, fetchDownstreamDealers } from '../api/ledger'
import { fetchQueries, deleteQuery } from '../api/queries'

// cfgs whose rows carry a `rawItems` array (from purchaseOrders.js / invoices.js) that the
// "View" action can expand into a details modal
const PARTY_LABEL = {
  purchaseOrders: 'Supplier',
  incomingPO:     'Dealer',
  invoices:       'Billed To',
  salesOrders:    'Customer',
  manualSales:    'Customer / Dealer',
}

// cfgs that pull live data (keyed by the logged-in dealer's id) instead of mock rows.
// A fetcher may resolve to either a plain rows array, or { rows, summary }.
const LIVE_FETCHERS = {
  purchaseOrders: fetchPurchaseOrderHistory,
  incomingPO:     fetchIncomingPurchaseOrders,
  currentStock:   fetchERPInventory,
  inventoryHistory: fetchInventoryTransactionSummary,
  invoices:       fetchInvoices,
  salesOrders:    fetchSalesOrders,
  manualSales:    fetchManualSalesOrders,
  ledger:         fetchLedger,
  queries:        fetchQueries,
}

// cfgs that need the "dealers mapped below me" list — for the ledger entry form's dealer picker.
const NEEDS_DOWNSTREAM_DEALERS = ['ledger']

// Ledger rows are grouped by dealer in the table — one row per dealer, expandable via
// "View" into every individual entry (see LedgerDealerEntriesModal).
const LEDGER_GROUPED_COLUMNS = [
  { key: 'dealer', label: 'Dealer', strong: true },
  { key: 'count', label: 'Records' },
  { key: 'totalDebit', label: 'Total Debit' },
  { key: 'totalCredit', label: 'Total Credit' },
  { key: 'balance', label: 'Balance' },
]

function groupLedgerByDealer(rows) {
  const map = new Map()
  for (const r of rows) {
    const key = r.dealerId || r.dealer
    if (!map.has(key)) {
      map.set(key, { id: key, dealer: r.dealer, dealerId: r.dealerId, entries: [], totalDebitNum: 0, totalCreditNum: 0, lastDate: null, lastBalance: null })
    }
    const g = map.get(key)
    g.entries.push(r)
    if (r.entryType === 'debit') g.totalDebitNum += Number(r.amount) || 0
    if (r.entryType === 'credit') g.totalCreditNum += Number(r.amount) || 0
    if (g.lastDate == null || new Date(r.rawDate) >= new Date(g.lastDate)) {
      g.lastDate = r.rawDate
      g.lastBalance = r.balanceAfter
    }
  }
  return Array.from(map.values()).map((g) => ({
    id:          g.id,
    dealer:      g.dealer,
    dealerId:    g.dealerId,
    count:       g.entries.length,
    totalDebit:  '₹' + g.totalDebitNum.toLocaleString('en-IN'),
    totalCredit: '₹' + g.totalCreditNum.toLocaleString('en-IN'),
    balance:     g.lastBalance != null ? '₹' + Number(g.lastBalance).toLocaleString('en-IN') : '—',
    entries:     g.entries.slice().sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate)),
  }))
}

// Per-cfg summary-strip field definitions — { rows, summary } fetchers populate `summary`
// with different shapes, so each cfg declares which fields to surface and how to format them.
const SUMMARY_FIELDS = {
  currentStock: [
    { key: 'total_products', label: 'Total Products' },
    { key: 'total_quantity', label: 'Total Quantity' },
    { key: 'total_value', label: 'Total Value', currency: true },
  ],
  ledger: [
    { key: 'totalDebit', label: 'Total Debit', currency: true },
    { key: 'totalCredit', label: 'Total Credit', currency: true },
    { key: 'balance', label: 'Balance', currency: true },
  ],
}

export default function TablePage({ cfg, crumbs, title }) {
  const { user } = useAuth()
  const config = TABLE_CONFIGS[cfg]

  const liveFetcher = LIVE_FETCHERS[cfg]
  const isLive = !!liveFetcher
  const hasViewModal = cfg in PARTY_LABEL

  const [rows, setRows]       = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(isLive)
  const [error, setError]     = useState('')
  const [viewRow, setViewRow] = useState(null)

  const [dispatchingId, setDispatchingId] = useState(null)
  const [dispatchMsg, setDispatchMsg]     = useState('')
  const [dispatchErr, setDispatchErr]     = useState('')

  const [printRow, setPrintRow] = useState(null)

  const [viewLedgerEntry, setViewLedgerEntry] = useState(null)
  const [viewLedgerDealer, setViewLedgerDealer] = useState(null)
  const [ledgerFormState, setLedgerFormState] = useState(null) // null | { prefill: row|null }
  const [downstreamDealers, setDownstreamDealers] = useState([])
  const [downstreamDealersLoading, setDownstreamDealersLoading] = useState(true)

  const [raisingQuery, setRaisingQuery] = useState(false)
  const [viewQuery, setViewQuery]       = useState(null)
  const [respondQuery, setRespondQuery] = useState(null)
  const [deletingQueryId, setDeletingQueryId] = useState(null)
  const [queryErr, setQueryErr]         = useState('')

  const [deletingSaleId, setDeletingSaleId] = useState(null)
  const [saleErr, setSaleErr] = useState('')

  const loadLive = useCallback(() => {
    if (!liveFetcher || !user?.dealerId) return
    setLoading(true)
    setError('')
    liveFetcher(user.dealerId)
      .then((result) => {
        if (Array.isArray(result)) {
          setRows(result)
          setSummary(null)
        } else {
          setRows(result.rows || [])
          setSummary(result.summary || null)
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [liveFetcher, user?.dealerId])

  useEffect(() => {
    if (isLive) loadLive()
  }, [isLive, loadLive])

  const handleDispatch = useCallback((row) => {
    setDispatchingId(row.poId)
    setDispatchMsg('')
    setDispatchErr('')
    createDispatch({ purchaseOrder: row.poId })
      .then(() => {
        setDispatchMsg(`Dispatch created for ${row.id}.`)
        loadLive()
      })
      .catch((err) => setDispatchErr(err.message))
      .finally(() => setDispatchingId(null))
  }, [loadLive])

  useEffect(() => {
    if (!printRow) return
    const t = setTimeout(() => window.print(), 50)
    return () => clearTimeout(t)
  }, [printRow])

  useEffect(() => {
    const onAfterPrint = () => setPrintRow(null)
    window.addEventListener('afterprint', onAfterPrint)
    return () => window.removeEventListener('afterprint', onAfterPrint)
  }, [])

  useEffect(() => {
    if (!NEEDS_DOWNSTREAM_DEALERS.includes(cfg) || !user?.dealerId) return
    setDownstreamDealersLoading(true)
    fetchDownstreamDealers(user.dealerId)
      .then(setDownstreamDealers)
      .finally(() => setDownstreamDealersLoading(false))
  }, [cfg, user?.dealerId])

  // A dealer with nobody mapped below them (e.g. Sub Dealer) has no one to create ledger
  // entries for — they can't book entries against their own account, only their mapped
  // (upstream) dealer can. So entry creation is hidden entirely in that case.
  const ledgerTargetingSelf = !downstreamDealersLoading && downstreamDealers.length === 0

  const ledgerGroupedRows = useMemo(
    () => (cfg === 'ledger' ? groupLedgerByDealer(rows) : []),
    [cfg, rows]
  )

  const handleDeleteQuery = useCallback((row) => {
    if (!window.confirm(`Delete query "${row.subject}"? This cannot be undone.`)) return
    setDeletingQueryId(row.id)
    setQueryErr('')
    deleteQuery(row.id)
      .then(loadLive)
      .catch((err) => setQueryErr(err.message))
      .finally(() => setDeletingQueryId(null))
  }, [loadLive])

  const handleDeleteSale = useCallback((row) => {
    if (!window.confirm(`Delete sale "${row.id}"? Any deducted stock will be restored.`)) return
    setDeletingSaleId(row.soId)
    setSaleErr('')
    deleteSalesOrder(row.soId)
      .then(loadLive)
      .catch((err) => setSaleErr(err.message))
      .finally(() => setDeletingSaleId(null))
  }, [loadLive])

  const rowActions =
    cfg === 'incomingPO'
      ? (row) => (row.status === 'Pending' ? [{
          key:      'dispatch',
          label:    dispatchingId === row.poId ? 'Dispatching…' : 'Dispatch',
          icon:     Truck,
          disabled: dispatchingId === row.poId,
          onClick:  () => handleDispatch(row),
        }] : [])
      : cfg === 'invoices'
      ? (row) => [{ key: 'download', label: 'Download', icon: Download, onClick: () => setPrintRow(row) }]
      : cfg === 'ledger'
      ? (row) => [
          { key: 'view', label: 'View', icon: Eye, onClick: () => setViewLedgerDealer(row) },
          ...(!ledgerTargetingSelf
            ? [{
                key: 'entry', label: 'Entry', icon: FilePlus,
                onClick: () => setLedgerFormState({ prefill: { dealerId: row.dealerId, dealer: row.dealer } }),
              }]
            : []),
        ]
      : cfg === 'queries'
      ? (row) => [
          { key: 'view', label: 'View', icon: Eye, onClick: () => setViewQuery(row) },
          ...(row.canRespond && row.status !== 'Closed'
            ? [{ key: 'respond', label: 'Respond', icon: MessageSquareReply, onClick: () => setRespondQuery(row) }]
            : []),
          ...(row.dealerId === user?.dealerId
            ? [{
                key: 'delete', label: deletingQueryId === row.id ? 'Deleting…' : 'Delete', icon: Trash2,
                disabled: deletingQueryId === row.id, onClick: () => handleDeleteQuery(row),
              }]
            : []),
        ]
      : cfg === 'manualSales'
      ? (row) => [{
          key: 'delete', label: deletingSaleId === row.soId ? 'Deleting…' : 'Delete', icon: Trash2,
          disabled: deletingSaleId === row.soId, onClick: () => handleDeleteSale(row),
        }]
      : null

  if (!config) return <div className="card"><div className="card-body">Unknown table: {cfg}</div></div>

  return (
    <>
      <PageHeader
        crumbs={crumbs}
        title={title || config.title}
        subtitle={config.subtitle}
        actions={
          isLive ? (
            <>
              {cfg === 'ledger' && !ledgerTargetingSelf && (
                <button className="btn btn-primary" onClick={() => setLedgerFormState({ prefill: null })}>
                  <Plus size={16} /> Add Entry
                </button>
              )}
              {cfg === 'queries' && (
                <button className="btn btn-primary" onClick={() => setRaisingQuery(true)}>
                  <Plus size={16} /> Raise Query
                </button>
              )}
              {cfg === 'manualSales' && (
                <Link to="/app/so/create" className="btn btn-primary">
                  <Plus size={16} /> New Sale
                </Link>
              )}
              <button className="btn btn-ghost" onClick={loadLive}>
                <RefreshCw size={16} /> Refresh
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost"><Download size={16} /> Export</button>
              <button className="btn btn-primary"><Plus size={16} /> Add New</button>
            </>
          )
        }
      />

      {isLive && loading && (
        <div className="card mb-20">
          <div className="card-body flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            Loading…
          </div>
        </div>
      )}

      {isLive && error && (
        <div className="form-error mb-20">
          <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      {dispatchMsg && (
        <div className="form-success mb-20">
          <CheckCircle2 size={15} style={{ flexShrink: 0 }} /> {dispatchMsg}
        </div>
      )}

      {dispatchErr && (
        <div className="form-error mb-20">
          <AlertCircle size={15} style={{ flexShrink: 0 }} /> {dispatchErr}
        </div>
      )}

      {queryErr && (
        <div className="form-error mb-20">
          <AlertCircle size={15} style={{ flexShrink: 0 }} /> {queryErr}
        </div>
      )}

      {saleErr && (
        <div className="form-error mb-20">
          <AlertCircle size={15} style={{ flexShrink: 0 }} /> {saleErr}
        </div>
      )}

      {isLive && summary && !loading && !error && SUMMARY_FIELDS[cfg] && (
        <div className="summary-strip mb-20">
          {SUMMARY_FIELDS[cfg].map((f) => (
            <div key={f.key}>
              <span className="muted">{f.label}</span>
              <b>{f.currency ? '₹' + Number(summary[f.key] || 0).toLocaleString('en-IN') : (summary[f.key] ?? 0)}</b>
            </div>
          ))}
        </div>
      )}

      {(!isLive || (!loading && !error)) && (
        <DataTable
          columns={cfg === 'ledger' ? LEDGER_GROUPED_COLUMNS : config.columns}
          rows={isLive ? (cfg === 'ledger' ? ledgerGroupedRows : rows) : config.rows}
          filters={config.filters}
          pageSize={10}
          onView={hasViewModal ? setViewRow : null}
          rowActions={rowActions}
        />
      )}

      {viewRow && (
        <POOrderDetailsModal
          order={viewRow}
          partyLabel={PARTY_LABEL[cfg] || 'Party'}
          onClose={() => setViewRow(null)}
        />
      )}

      {printRow && (
        <div className="invoice-print-wrap active">
          <InvoicePrintView invoice={printRow} from={{ company: 'Vbike' }} />
        </div>
      )}

      {viewLedgerDealer && (
        <LedgerDealerEntriesModal
          dealer={viewLedgerDealer}
          onView={setViewLedgerEntry}
          onClose={() => setViewLedgerDealer(null)}
        />
      )}

      {viewLedgerEntry && (
        <LedgerEntryDetailsModal entry={viewLedgerEntry} onClose={() => setViewLedgerEntry(null)} />
      )}

      {ledgerFormState && (
        <LedgerEntryFormModal
          prefill={ledgerFormState.prefill}
          dealers={downstreamDealers}
          dealersLoading={downstreamDealersLoading}
          onClose={() => setLedgerFormState(null)}
          onSaved={() => { setLedgerFormState(null); loadLive() }}
        />
      )}

      {raisingQuery && (
        <RaiseQueryModal
          dealerId={user?.dealerId}
          onClose={() => setRaisingQuery(false)}
          onSaved={() => { setRaisingQuery(false); loadLive() }}
        />
      )}

      {viewQuery && (
        <QueryDetailsModal query={viewQuery} onClose={() => setViewQuery(null)} />
      )}

      {respondQuery && (
        <QueryRespondModal
          query={respondQuery}
          onClose={() => setRespondQuery(null)}
          onSaved={() => { setRespondQuery(null); loadLive() }}
        />
      )}
    </>
  )
}
