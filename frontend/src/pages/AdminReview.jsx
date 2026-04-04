import { useMemo, useState } from "react"
import AdminEntryReviewModal from "../components/admin/AdminEntryReviewModal"

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
    case "Rejected":
      return "bg-gray-200 text-gray-700"
    case "Approved":
      return "bg-green-100 text-green-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function AdminReview({ entries = [], onUpdateEntry }) {
  const [selectedEntry, setSelectedEntry] = useState(null)

  const stats = useMemo(() => {
    return {
      total: entries.length,
      pending: entries.filter((entry) => entry.status === "Pending Review").length,
      returned: entries.filter((entry) => entry.status === "Returned").length,
      rejected: entries.filter((entry) => entry.status === "Rejected").length,
      approved: entries.filter((entry) => entry.status === "Approved").length,
    }
  }, [entries])

  const handleApprove = (note) => {
    if (!selectedEntry) return

    onUpdateEntry(selectedEntry.id, {
      status: "Approved",
      adminComment: note || "",
      reviewedAt: new Date().toISOString(),
    })

    setSelectedEntry(null)
  }

  const handleReturn = (note) => {
    if (!selectedEntry) return

    onUpdateEntry(selectedEntry.id, {
      status: "Returned",
      adminComment: note,
      reviewedAt: new Date().toISOString(),
    })

    setSelectedEntry(null)
  }

  const handleReject = (note) => {
    if (!selectedEntry) return

    onUpdateEntry(selectedEntry.id, {
      status: "Rejected",
      adminComment: note,
      reviewedAt: new Date().toISOString(),
    })

    setSelectedEntry(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Review</h1>
        <p className="text-sm text-gray-500">
          Review submitted AWPB entries and update their status.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Entries</p>
          <h2 className="mt-2 text-3xl font-bold">{stats.total}</h2>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Pending Review</p>
          <h2 className="mt-2 text-3xl font-bold">{stats.pending}</h2>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Returned</p>
          <h2 className="mt-2 text-3xl font-bold">{stats.returned}</h2>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Rejected</p>
          <h2 className="mt-2 text-3xl font-bold">{stats.rejected}</h2>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Approved</p>
          <h2 className="mt-2 text-3xl font-bold">{stats.approved}</h2>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {entries.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            No submitted entries yet.
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
                <th className="p-3 text-right">Action</th>
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
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedEntry(entry)}
                      className="text-blue-600 hover:underline"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AdminEntryReviewModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onApprove={handleApprove}
        onReturn={handleReturn}
        onReject={handleReject}
      />
    </div>
  )
}