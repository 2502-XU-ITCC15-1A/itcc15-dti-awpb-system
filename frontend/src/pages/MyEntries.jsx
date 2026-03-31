function formatCurrency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0)
}

function formatDate(value) {
  if (!value) return "N/A"

  return new Date(value).toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function getStatusClasses(status) {
  switch (status) {
    case "Pending Review":
      return "bg-yellow-100 text-yellow-700"
    case "Returned":
      return "bg-red-100 text-red-700"
    case "Approved":
      return "bg-green-100 text-green-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function MyEntries({ entries = [] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Entries</h1>
        <p className="text-sm text-gray-500">
          View your submitted AWPB entries and their current status.
        </p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {entries.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            No entries submitted yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Submitted</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-t">
                  <td className="p-3">
                    <p className="font-medium">{entry.titleOfActivities}</p>
                    <p className="text-xs text-gray-500">
                      No. {entry.no} | {entry.performanceIndicator}
                    </p>
                  </td>
                  <td className="p-3">{entry.unit}</td>
                  <td className="p-3">{formatDate(entry.submittedAt)}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusClasses(
                        entry.status
                      )}`}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-medium">
                    {formatCurrency(entry.grandTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}