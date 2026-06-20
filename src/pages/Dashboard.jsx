import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Download, Plus, TrendingUp, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Card from '../components/ui/Card'
import DataTable from '../components/ui/DataTable'
import { SalesTrendChart, CategoryPieChart, OrderVolumeChart } from '../components/ui/Charts'
import { DASHBOARD_DATA, TABLE_CONFIGS } from '../data/mockData'
import { fetchPurchaseOrderHistory, fetchIncomingPurchaseOrders } from '../api/purchaseOrders'
import { fetchERPInventory } from '../api/inventory'
import { fetchSalesOrders, fetchManualSalesOrders } from '../api/salesOrders'

const recentCols = {
  po: TABLE_CONFIGS.purchaseOrders.columns.slice(0, 5),
  so: TABLE_CONFIGS.salesOrders.columns.slice(0, 5),
}

// Per-role destinations so "View all" links always resolve to a real route.
const LINKS = {
  super_stockist: { po: 'po/list', so: 'so/incoming' },
  exclusive_dealer: { po: 'po/history', so: 'so/reports' },
  sub_dealer: { po: 'po/history', so: 'so/manage' },
}

const PENDING     = ['pending']
const IN_PROGRESS = ['confirmed', 'processing']
const DONE        = ['delivered']

const countByStatus = (rows, statuses) =>
  rows.filter((r) => statuses.includes(String(r.status).toLowerCase())).length

const TYPE_COLORS = { Bike: '#2563eb', Battery: '#10b981', Accessory: '#f59e0b' }

function buildCategorySplit(invRows) {
  const totals = {}
  for (const r of invRows) {
    totals[r.type] = (totals[r.type] || 0) + (Number(r.quantity) || 0)
  }
  const grand = Object.values(totals).reduce((a, b) => a + b, 0)
  if (!grand) return []
  return Object.entries(totals).map(([name, qty]) => ({
    name, value: Math.round((qty / grand) * 100), color: TYPE_COLORS[name] || '#94a3b8',
  }))
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function buildSalesTrend(purchaseRows, salesRows) {
  const now = new Date()
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: MONTH_LABELS[d.getMonth()], sales: 0, purchases: 0 })
  }
  const byKey = Object.fromEntries(months.map((m) => [m.key, m]))
  const add = (rows, field) => {
    for (const r of rows) {
      if (!r.rawDate) continue
      const d = new Date(r.rawDate)
      const bucket = byKey[`${d.getFullYear()}-${d.getMonth()}`]
      if (bucket) bucket[field] += Number(r.grandTotal) || 0
    }
  }
  add(purchaseRows, 'purchases')
  add(salesRows, 'sales')
  return months
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function buildOrderVolume(rows) {
  const now = new Date()
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    days.push({ key: d.toDateString(), day: DAY_LABELS[d.getDay()], orders: 0 })
  }
  const byKey = Object.fromEntries(days.map((d) => [d.key, d]))
  for (const r of rows) {
    if (!r.rawDate) continue
    const bucket = byKey[new Date(r.rawDate).toDateString()]
    if (bucket) bucket.orders += 1
  }
  return days
}

export default function Dashboard() {
  const { user } = useAuth()
  const data = DASHBOARD_DATA[user?.id] || DASHBOARD_DATA.super_stockist
  const links = LINKS[user?.id] || LINKS.super_stockist

  const [loading, setLoading]     = useState(true)
  const [inventory, setInventory] = useState({ rows: [], summary: null })
  const [poHistory, setPoHistory] = useState([])
  const [incomingPO, setIncomingPO] = useState([])
  const [salesOrders, setSalesOrders] = useState([])
  const [manualSales, setManualSales] = useState([])

  useEffect(() => {
    if (!user?.dealerId) return
    setLoading(true)
    Promise.all([
      fetchERPInventory(user.dealerId).catch(() => ({ rows: [], summary: null })),
      fetchPurchaseOrderHistory(user.dealerId).catch(() => []),
      fetchIncomingPurchaseOrders(user.dealerId).catch(() => []),
      fetchSalesOrders(user.dealerId).catch(() => []),
      fetchManualSalesOrders(user.dealerId).catch(() => []),
    ]).then(([inv, po, incoming, sales, manual]) => {
      setInventory(inv)
      setPoHistory(po)
      setIncomingPO(incoming)
      setSalesOrders(sales)
      setManualSales(manual)
      setLoading(false)
    })
  }, [user?.dealerId])

  const allSales = useMemo(() => [...salesOrders, ...manualSales], [salesOrders, manualSales])

  const salesThisMonth = useMemo(() => {
    const now = new Date()
    return allSales.filter((r) => {
      if (!r.rawDate) return false
      const d = new Date(r.rawDate)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
  }, [allSales])

  const metrics = useMemo(() => ({
    totalInventory:  inventory.summary?.total_quantity ?? 0,
    availableStock:  inventory.rows.filter((r) => r.status === 'In Stock').length,
    pendingPO:       countByStatus(poHistory, PENDING),
    inTransitPO:     countByStatus(poHistory, IN_PROGRESS),
    pendingDispatch: countByStatus(incomingPO, PENDING),
    dispatched:      countByStatus(incomingPO, [...IN_PROGRESS, ...DONE]),
    salesThisMonth,
  }), [inventory, poHistory, incomingPO, salesThisMonth])

  // Maps each role's stat label (from DASHBOARD_DATA) to a computed metric.
  const STAT_VALUE = {
    'Total Inventory':     metrics.totalInventory,
    'Available Stock':     metrics.availableStock,
    'Purchase Orders':     user?.id === 'sub_dealer' ? metrics.inTransitPO : metrics.pendingPO,
    'Sales Orders':        metrics.salesThisMonth,
    'Pending Dispatch':    metrics.pendingDispatch,
    'Available Inventory': metrics.totalInventory,
    'Pending Orders':      metrics.pendingDispatch,
    'Dispatch Status':     metrics.dispatched,
    'Inventory Available': metrics.totalInventory,
    'Pending Deliveries':  metrics.pendingPO,
  }

  const stats = data.stats.map((s) => ({
    ...s,
    value: s.label in STAT_VALUE ? STAT_VALUE[s.label] : s.value,
  }))

  const categorySplit = useMemo(() => buildCategorySplit(inventory.rows), [inventory.rows])
  const salesTrend     = useMemo(() => buildSalesTrend(poHistory, allSales), [poHistory, allSales])
  const orderVolume    = useMemo(() => buildOrderVolume(poHistory), [poHistory])

  const recentPO = poHistory.slice(0, 5)
  const recentSales = useMemo(
    () => allSales.slice().sort((a, b) => new Date(b.rawDate || 0) - new Date(a.rawDate || 0)).slice(0, 5),
    [allSales]
  )

  return (
    <>
      <PageHeader
        crumbs={['Dashboard']}
        title={data.title}
        subtitle={data.subtitle}
        actions={
          <>
            <button className="btn btn-ghost"><Download size={16} /> Export</button>
            <Link to="/app/po/create" className="btn btn-primary"><Plus size={16} /> New Order</Link>
          </>
        }
      />

      {loading ? (
        <div className="card mb-20">
          <div className="card-body flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            Loading…
          </div>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="stat-grid">
            {stats.map((s) => <StatCard key={s.label} stat={s} />)}
          </div>

          {/* Charts row */}
          <div className="grid grid-2 mb-24">
            <Card
              title="Sales vs Purchases"
              subtitle="Last 6 months performance (₹)"
              action={<span className="badge green"><TrendingUp size={13} /> Live</span>}
            >
              <SalesTrendChart data={salesTrend} />
            </Card>
            <Card title="Inventory by Category" subtitle="Stock distribution">
              {categorySplit.length > 0 ? (
                <CategoryPieChart data={categorySplit} />
              ) : (
                <div className="empty-state">
                  <p>No inventory data yet.</p>
                </div>
              )}
            </Card>
          </div>

          <div className="grid grid-2 mb-24">
            <Card title="Recent Purchase Orders" subtitle="Latest procurement activity"
              action={<Link to={`/app/${links.po}`} className="link flex items-center gap-2">View all <ArrowRight size={14} /></Link>}>
              <div style={{ margin: -20 }}>
                <DataTable columns={recentCols.po} rows={recentPO} toolbar={false} pageSize={5} />
              </div>
            </Card>
            <Card title="Weekly Order Volume" subtitle="Orders placed this week">
              <OrderVolumeChart data={orderVolume} />
            </Card>
          </div>

          <div className="mb-24">
            <Card title="Recent Sales Orders" subtitle="Latest customer orders"
              action={<Link to={`/app/${links.so}`} className="link flex items-center gap-2">View all <ArrowRight size={14} /></Link>}>
              <div style={{ margin: -20 }}>
                <DataTable columns={recentCols.so} rows={recentSales} toolbar={false} pageSize={5} />
              </div>
            </Card>
          </div>
        </>
      )}
    </>
  )
}
