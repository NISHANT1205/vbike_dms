import { Eye } from 'lucide-react'
import Modal from './Modal'

export default function LedgerDealerEntriesModal({ dealer, onView, onClose }) {
  if (!dealer) return null

  return (
    <Modal
      title={dealer.dealer}
      subtitle={`${dealer.entries.length} record${dealer.entries.length === 1 ? '' : 's'}`}
      onClose={onClose}
      width={760}
    >
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Reference</th>
              <th>Description</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {dealer.entries.map((e) => (
              <tr key={e.id}>
                <td>{e.date}</td>
                <td><span className="row-id">{e.reference}</span></td>
                <td>{e.description}</td>
                <td>{e.debit}</td>
                <td>{e.credit}</td>
                <td>{e.balance}</td>
                <td>
                  <button className="btn btn-ghost row-action-btn" onClick={() => onView(e)}>
                    <Eye size={13} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  )
}
