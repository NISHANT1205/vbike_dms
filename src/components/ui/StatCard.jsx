import * as Icons from 'lucide-react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function StatCard({ stat }) {
  const Icon = Icons[stat.icon] || Icons.Box
  return (
    <div className="stat-card" style={{ '--accent': stat.accent }}>
      <div className="stat-top">
        <div>
          <div className="stat-label">{stat.label}</div>
          <div className="stat-value">{stat.value}</div>
        </div>
        <div className="stat-icon" style={{ background: stat.color }}>
          <Icon size={22} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`stat-trend ${stat.up ? 'up' : 'down'}`}>
          {stat.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {stat.trend}
        </span>
        <span className="muted" style={{ fontSize: 12 }}>{stat.sub}</span>
      </div>
    </div>
  )
}
