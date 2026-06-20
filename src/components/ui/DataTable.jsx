import { useState, useMemo } from 'react'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, Inbox, ChevronLeft, ChevronRight, SlidersHorizontal, Eye } from 'lucide-react'
import Badge from './Badge'

function renderCell(col, value) {
  if (col.type === 'badge') return <Badge value={value} />
  if (col.type === 'id') return <span className="row-id">{value}</span>
  if (col.strong) return <span className="cell-strong">{value}</span>
  return value
}

export default function DataTable({
  columns,
  rows,
  filters = [],
  searchable = true,
  pageSize = 8,
  toolbar = true,
  toolbarExtra = null,
  onView = null,
  rowActions = null, // (row) => [{ key, label, icon, onClick, disabled }]
}) {
  const hasActions = !!(onView || rowActions)
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  const [sort, setSort] = useState({ key: null, dir: 'asc' })
  const [page, setPage] = useState(1)

  const processed = useMemo(() => {
    let data = [...rows]

    if (query.trim()) {
      const q = query.toLowerCase()
      data = data.filter((r) => columns.some((c) => String(r[c.key] ?? '').toLowerCase().includes(q)))
    }
    for (const [key, val] of Object.entries(activeFilters)) {
      if (val) data = data.filter((r) => String(r[key]) === val)
    }
    if (sort.key) {
      data.sort((a, b) => {
        const av = a[sort.key], bv = b[sort.key]
        const na = parseFloat(String(av).replace(/[^0-9.-]/g, ''))
        const nb = parseFloat(String(bv).replace(/[^0-9.-]/g, ''))
        let cmp
        if (!isNaN(na) && !isNaN(nb)) cmp = na - nb
        else cmp = String(av).localeCompare(String(bv))
        return sort.dir === 'asc' ? cmp : -cmp
      })
    }
    return data
  }, [rows, columns, query, activeFilters, sort])

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize))
  const current = Math.min(page, totalPages)
  const pageRows = processed.slice((current - 1) * pageSize, current * pageSize)

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))

  const setFilter = (key, val) => { setActiveFilters((f) => ({ ...f, [key]: val })); setPage(1) }

  return (
    <div className="card">
      {toolbar && (
        <div className="table-toolbar">
          {searchable ? (
            <div className="table-search">
              <Search size={16} className="muted" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1) }}
                placeholder="Search records…"
              />
            </div>
          ) : <div />}
          <div className="table-filters">
            {filters.map((f) => (
              <select key={f.key} className="select-input" value={activeFilters[f.key] || ''} onChange={(e) => setFilter(f.key, e.target.value)}>
                <option value="">All {f.label}</option>
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
            {filters.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setActiveFilters({}); setQuery('') }}>
                <SlidersHorizontal size={14} /> Reset
              </button>
            )}
            {toolbarExtra}
          </div>
        </div>
      )}

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} onClick={() => toggleSort(c.key)}>
                  <span className="flex items-center gap-2">
                    {c.label}
                    {sort.key === c.key
                      ? (sort.dir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)
                      : <ChevronsUpDown size={13} style={{ opacity: 0.35 }} />}
                  </span>
                </th>
              ))}
              {hasActions && <th></th>}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (hasActions ? 1 : 0)}>
                  <div className="empty-state">
                    <div className="empty-icon"><Inbox size={26} /></div>
                    <b>No records found</b>
                    <p>Try adjusting your search or filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              pageRows.map((row, i) => (
                <tr key={row.id || i}>
                  {columns.map((c) => <td key={c.key}>{renderCell(c, row[c.key])}</td>)}
                  {hasActions && (
                    <td>
                      <div className="row-actions">
                        {onView && (
                          <button className="btn btn-ghost row-action-btn" onClick={() => onView(row)}>
                            <Eye size={13} /> View
                          </button>
                        )}
                        {rowActions && rowActions(row).map((a) => {
                          const Icon = a.icon
                          return (
                            <button
                              key={a.key}
                              className="btn btn-ghost row-action-btn"
                              onClick={a.onClick}
                              disabled={a.disabled}
                              title={a.label}
                            >
                              {Icon && <Icon size={13} />} {a.label}
                            </button>
                          )
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {processed.length > 0 && (
        <div className="table-foot">
          <span className="muted">
            Showing {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, processed.length)} of {processed.length}
          </span>
          <div className="pagination">
            <button className="page-btn" disabled={current === 1} onClick={() => setPage(current - 1)}><ChevronLeft size={15} /></button>
            {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
              const p = i + 1
              return <button key={p} className={`page-btn ${p === current ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            })}
            {totalPages > 5 && <span className="page-btn" style={{ border: 'none' }}>… {totalPages}</span>}
            <button className="page-btn" disabled={current === totalPages} onClick={() => setPage(current + 1)}><ChevronRight size={15} /></button>
          </div>
        </div>
      )}
    </div>
  )
}
