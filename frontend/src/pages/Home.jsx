import { useMemo } from "react"
import { Link } from "react-router-dom"

function formatDateTime(value) {
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

export default function Home({ entries = [], submissionWindow }) {
  const windowOpen = isSubmissionWindowOpen(submissionWindow)

  const stats = useMemo(() => {
    return {
      pending: entries.filter((entry) => entry.status === "Pending Review").length,
      returned: entries.filter((entry) => entry.status === "Returned").length,
      rejected: entries.filter((entry) => entry.status === "Rejected").length,
      approved: entries.filter((entry) => entry.status === "Approved").length,
    }
  }, [entries])

  const returnedEntries = useMemo(() => {
    return entries.filter((entry) => entry.status === "Returned").slice(0, 3)
  }, [entries])

  const recentEntries = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 5)
  }, [entries])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Home</h1>
        <p className="text-sm text-gray-500">
          View your submission statuses and recent AWPB entries.
        </p>
      </div>

      <div
        className={`rounded-xl border p-4 ${
          windowOpen
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2
              className={`font-semibold ${
                windowOpen ? "text-green-900" : "text-red-900"
              }`}
            >
              Encoding Period {windowOpen ? "Open" : "Closed"}
            </h2>
            <p
              className={`text-sm ${
                windowOpen ? "text-green-800" : "text-red-800"
              }`}
            >
              {formatDateOnly(submissionWindow?.startDate)} to{" "}
              {formatDateOnly(submissionWindow?.endDate)}
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
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
          to="/submit"
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            windowOpen
              ? "bg-black text-white hover:opacity-90"
              : "cursor-not-allowed bg-gray-300 text-gray-600 pointer-events-none"
          }`}
        >
          Submit New Entry
        </Link>

        <Link
          to="/entries"
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Go to My Entries
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Needs Attention</h2>
            <p className="text-sm text-gray-500">
              Returned entries that may need revision.
            </p>
          </div>

          {returnedEntries.length === 0 ? (
            <p className="text-sm text-gray-500">No returned entries right now.</p>
          ) : (
            <div className="space-y-3">
              {returnedEntries.map((entry) => (
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

                  <p className="text-sm text-gray-600">
                    {entry.adminComment || "No admin comment provided."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Recent Entries</h2>
            <p className="text-sm text-gray-500">
              Your most recent submissions.
            </p>
          </div>

          {recentEntries.length === 0 ? (
            <p className="text-sm text-gray-500">No entries submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{entry.titleOfActivities}</p>
                    <p className="text-xs text-gray-500">
                      Submitted {formatDateTime(entry.submittedAt)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusClasses(
                      entry.status
                    )}`}
                  >
                    {entry.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}