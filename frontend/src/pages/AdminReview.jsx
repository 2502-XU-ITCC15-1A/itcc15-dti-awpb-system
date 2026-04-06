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

export default function AdminReview({
  entries = [],
  onUpdateEntry,
  submissionWindow,
}) {
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [unitFilter, setUnitFilter] = useState("All")
  const [yearFilter, setYearFilter] = useState("All")

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

  const availableUnits = useMemo(() => {
    return [...new Set(entries.map((entry) => entry.unit).filter(Boolean))].sort()
  }, [entries])

  const availableYears = useMemo(() => {
    return [...new Set(entries.map((entry) => entry.planningYear).filter(Boolean))]
      .sort((a, b) => String(b).localeCompare(String(a)))
  }, [entries])

  const filteredEntries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return entries.filter((entry) => {
      const matchesSearch =
        normalizedSearch === "" ||
        entry.titleOfActivities?.toLowerCase().includes(normalizedSearch) ||
        entry.performanceIndicator?.toLowerCase().includes(normalizedSearch) ||
        entry.subActivity?.toLowerCase().includes(normalizedSearch) ||
        entry.unit?.toLowerCase().includes(normalizedSearch)

      const matchesStatus =
        statusFilter === "All" || entry.status === statusFilter

      const matchesUnit =
        unitFilter === "All" || entry.unit === unitFilter

      const matchesYear =
        yearFilter === "All" || String(entry.planningYear) === yearFilter

      return matchesSearch && matchesStatus && matchesUnit && matchesYear
    })
  }, [entries, searchTerm, statusFilter, unitFilter, yearFilter])

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

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("All")
    setUnitFilter("All")
    setYearFilter("All")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Review</h1>
        <p className="text-sm text-gray-500">
          Review submitted AWPB entries and update their status.
        </p>
      </div>

      <div
        className={`rounded-xl border p-4 ${windowOpen
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
          }`}
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2
              className={`font-semibold ${windowOpen ? "text-green-900" : "text-red-900"
                }`}
            >
              Encoding Period {windowOpen ? "Open" : "Closed"}
            </h2>
            <p
              className={`text-sm ${windowOpen ? "text-green-800" : "text-red-800"
                }`}
            >
              {formatDateOnly(submissionWindow?.startDate)} to{" "}
              {formatDateOnly(submissionWindow?.endDate)}
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ${windowOpen
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
              }`}
          >
            {windowOpen ? "Open" : "Closed"}
          </span>
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

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="border-b p-4 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">All Submitted Entries</h2>
              <p className="text-sm text-gray-500">
                Search and filter submissions for review.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search title, sub activity, or unit"
                className="min-w-[300px] rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="All">All Status</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Returned">Returned</option>
                <option value="Rejected">Rejected</option>
                <option value="Approved">Approved</option>
              </select>

              <select
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="All">All Units</option>
                {availableUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>

              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="All">All Years</option>
                {availableYears.map((year) => (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Showing {filteredEntries.length} of {entries.length} entries
          </p>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            No entries match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-[34%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[6%]" />
              </colgroup>

              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">Year</th>
                  <th className="p-3">Submitted</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="border-t">
                    <td className="p-3">
                      <p
                        className="truncate font-medium"
                        title={entry.titleOfActivities}
                      >
                        {entry.titleOfActivities}
                      </p>
                    </td>

                    <td className="p-3">{entry.unit}</td>
                    <td className="p-3">{entry.planningYear || "N/A"}</td>
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
          </div>
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