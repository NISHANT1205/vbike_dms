export default function Card({ title, subtitle, action, children, bodyClass = '' }) {
  return (
    <div className="card">
      {(title || action) && (
        <div className="card-head">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={`card-body ${bodyClass}`}>{children}</div>
    </div>
  )
}
