import { FileText, FileSpreadsheet, Printer, Calendar } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import { REPORT_CONFIGS } from '../data/mockData'

export default function ReportPage({ cfg, crumbs, title }) {
  const config = REPORT_CONFIGS[cfg]
  if (!config) return <div className="card"><div className="card-body">Unknown report: {cfg}</div></div>

  return (
    <>
      <PageHeader
        crumbs={crumbs}
        title={title || config.title}
        subtitle={config.subtitle}
        actions={
          <>
            <button className="btn btn-ghost"><FileText size={16} /> Export PDF</button>
            <button className="btn btn-success"><FileSpreadsheet size={16} /> Export Excel</button>
            <button className="btn btn-ghost"><Printer size={16} /></button>
          </>
        }
      />

      <div className="card mb-20">
        <div className="table-toolbar" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
            <span className="flex items-center gap-2 muted"><Calendar size={15} /> Report Period</span>
            <select className="select-input"><option>This Month</option><option>Last Month</option><option>This Quarter</option><option>This Year</option><option>Custom Range</option></select>
            <input type="date" className="select-input" defaultValue="2026-06-01" />
            <span className="muted">to</span>
            <input type="date" className="select-input" defaultValue="2026-06-16" />
          </div>
          <button className="btn btn-primary btn-sm">Generate Report</button>
        </div>
      </div>

      <DataTable
        columns={config.columns}
        rows={config.rows}
        filters={config.filters || []}
        pageSize={10}
      />
    </>
  )
}
