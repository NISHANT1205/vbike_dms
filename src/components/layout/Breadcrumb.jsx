import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="breadcrumb">
      <Link to="/app" className="flex items-center gap-2"><Home size={13} /> Home</Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <ChevronRight size={13} />
          {i === items.length - 1
            ? <span className="crumb-current">{item}</span>
            : <span>{item}</span>}
        </span>
      ))}
    </nav>
  )
}
