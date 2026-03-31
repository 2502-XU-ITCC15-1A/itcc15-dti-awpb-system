
export default function MyEntries() {
  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold">My Entries</h1>
        <p className="text-sm text-gray-500">
          View and manage your submitted entries.
        </p>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">

        <table className="w-full text-sm">
          
          {/* Header */}
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Unit</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            
            <tr className="border-t">
              <td className="p-3 font-medium">RCU Budget Entry 2027</td>
              <td className="p-3">LDN</td>
              <td className="p-3">Mar 30, 2026</td>
              <td className="p-3">
                <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                  Pending
                </span>
              </td>
              <td className="p-3 text-right">
                <button className="text-blue-600 hover:underline text-sm">
                  View
                </button>
              </td>
            </tr>

            <tr className="border-t">
              <td className="p-3 font-medium">Training Proposal</td>
              <td className="p-3">MIS</td>
              <td className="p-3">Mar 28, 2026</td>
              <td className="p-3">
                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                  Returned
                </span>
              </td>
              <td className="p-3 text-right">
                <button className="text-blue-600 hover:underline text-sm">
                  Edit
                </button>
              </td>
            </tr>

            <tr className="border-t">
              <td className="p-3 font-medium">Quarter 1 Plan</td>
              <td className="p-3">ORD</td>
              <td className="p-3">Mar 25, 2026</td>
              <td className="p-3">
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  Approved
                </span>
              </td>
              <td className="p-3 text-right">
                <button className="text-gray-400 text-sm cursor-not-allowed">
                  Locked
                </button>
              </td>
            </tr>

          </tbody>
        </table>

      </div>
    </div>
  )
}