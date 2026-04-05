import { useMemo } from "react"
import { Link } from "react-router-dom"

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

function formatDateOnly(value) {
  if (!value) return "N/A"

  return new Date(value).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
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

function isSubmissionWindowOpen(submissionWindow) {
  const { startDate, endDate } = submissionWindow || {}

  if (!startDate || !endDate) return false

  const today = new Date()
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T23:59:59`)

  return today >= start && today <= end
}

export default function AdminDashboard({
  entries = [],
  submissionWindow,
  onUpdateSubmissionWindow,
}) {
  const windowOpen = isSubmissionWindowOpen(submissionWindow)

  const stats = useMemo(() => {
    return {
      total: entries.length,
      pending: entries.filter((entry) => entry.status === "Pending Review").length,
      returned: entries.filter((entry) => entry.status === "Returned").length,
      rejected: entries.filter((entry) => entry.status === "Rejected").length,
      approved: entries.filter((entry) => entry.status === "Approved").length,
    }
  }, [entries])

  const recentSubmissions = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 5)
  }, [entries])

  const recentReviewActions = useMemo(() => {
    return [...entries]
      .filter((entry) => entry.reviewedAt)
      .sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt))
      .slice(0, 5)
  }, [entries])

  const pendingEntries = useMemo(() => {
    return entries
      .filter((entry) => entry.status === "Pending Review")
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 5)
  }, [entries])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">
          Monitor submission activity, review statuses, and control the encoding period.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Encoding Period</h2>
            <p className="text-sm text-gray-500">
              Set the allowed date range for entry submission and returned-entry editing.
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ${
              windowOpen
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {windowOpen ? "Open" : "Closed"}
          </span>
        </div>

        <div className="rounded-lg border bg-gray-50 p-3 text-sm">
          <span className="font-medium">Current Range:</span>{" "}
          {formatDateOnly(submissionWindow?.startDate)} to{" "}
          {formatDateOnly(submissionWindow?.endDate)}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Start Date</label>
            <input
              type="date"
              value={submissionWindow?.startDate || ""}
              onChange={(e) =>
                onUpdateSubmissionWindow((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">End Date</label>
            <input
              type="date"
              value={submissionWindow?.endDate || ""}
              onChange={(e) =>
                onUpdateSubmissionWindow((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
        </div>
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

      <div className="flex flex-wrap gap-3">
        <Link
          to="/admin/review"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Go to Admin Review
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm xl:col-span-1">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Pending Queue</h2>
            <p className="text-sm text-gray-500">
              Entries currently waiting for review.
            </p>
          </div>

          {pendingEntries.length === 0 ? (
            <p className="text-sm text-gray-500">No pending entries right now.</p>
          ) : (
            <div className="space-y-3">
              {pendingEntries.map((entry) => (
                <div key={entry.id} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="font-medium">{entry.titleOfActivities}</p>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusClasses(
                        entry.status
                      )}`}
                    >
                      {entry.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500">{entry.unit}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Submitted {formatDate(entry.submittedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm xl:col-span-1">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Recent Submissions</h2>
            <p className="text-sm text-gray-500">
              Latest entries received by the system.
            </p>
          </div>

          {recentSubmissions.length === 0 ? (
            <p className="text-sm text-gray-500">No submissions yet.</p>
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((entry) => (
                <div key={entry.id} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="font-medium">{entry.titleOfActivities}</p>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusClasses(
                        entry.status
                      )}`}
                    >
                      {entry.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500">{entry.unit}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Submitted {formatDate(entry.submittedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm xl:col-span-1">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Recent Review Actions</h2>
            <p className="text-sm text-gray-500">
              Latest approved, returned, or rejected actions.
            </p>
          </div>

          {recentReviewActions.length === 0 ? (
            <p className="text-sm text-gray-500">No review actions yet.</p>
          ) : (
            <div className="space-y-3">
              {recentReviewActions.map((entry) => (
                <div key={entry.id} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="font-medium">{entry.titleOfActivities}</p>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusClasses(
                        entry.status
                      )}`}
                    >
                      {entry.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500">
                    Reviewed {formatDate(entry.reviewedAt)}
                  </p>

                  {entry.adminComment && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {entry.adminComment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}