import { STATUS_COLORS } from '../../data/mockData'

export default function Badge({ value }) {
  const color = STATUS_COLORS[value] || 'gray'
  return <span className={`badge ${color}`}>{value}</span>
}
