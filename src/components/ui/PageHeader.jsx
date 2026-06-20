import Breadcrumb from '../layout/Breadcrumb'

export default function PageHeader({ crumbs = [], title, subtitle, actions }) {
  return (
    <>
      <Breadcrumb items={crumbs} />
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {actions && <div className="page-head-actions">{actions}</div>}
      </div>
    </>
  )
}
