import { Filter, Download } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import { TIMELINE_DATA } from '../data/mockData'

export default function TimelinePage({ cfg, crumbs, title }) {
  const events = TIMELINE_DATA[cfg] || []

  return (
    <>
      <PageHeader
        crumbs={crumbs}
        title={title || 'Stock Movement Timeline'}
        subtitle="Chronological log of all stock movements"
        actions={
          <>
            <button className="btn btn-ghost"><Filter size={16} /> Filter</button>
            <button className="btn btn-ghost"><Download size={16} /> Export</button>
          </>
        }
      />
      <div style={{ maxWidth: 760 }}>
        <Card title="Activity Log" subtitle="Most recent movements first">
          <div className="timeline">
            {events.map((e, i) => (
              <div key={i} className={`timeline-item ${e.color}`}>
                <div className="tl-time">{e.time}</div>
                <div className="tl-title">{e.title}</div>
                <div className="tl-desc">{e.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
