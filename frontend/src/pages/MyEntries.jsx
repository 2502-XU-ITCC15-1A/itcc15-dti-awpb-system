import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"

import EntryDetailsModal from "../components/entries/EntryDetailsModal"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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

function getStatusBadgeVariant(status) {
  switch (status) {
    case "Pending Review":
      return "secondary"
    case "Returned":
      return "destructive"
    case "Approved":
      return "default"
    case "Rejected":
      return "outline"
    default:
      return "outline"
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

export default function MyEntries({
  entries = [],
  onEditEntry,
  submissionWindow,
}) {
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const navigate = useNavigate()

  const windowOpen = isSubmissionWindowOpen(submissionWindow)

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
        statusFilter === "all" || entry.status === statusFilter

      const matchesYear =
        yearFilter === "all" || String(entry.planningYear) === yearFilter

      return matchesSearch && matchesStatus && matchesYear
    })
  }, [entries, searchTerm, statusFilter, yearFilter])

  const handleEdit = (entry) => {
    if (!windowOpen) return

    onEditEntry(entry)
    setSelectedEntry(null)
    navigate("/submit")
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setYearFilter("all")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          My Entries
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View your submitted AWPB entries and their current status.
        </p>
      </div>

      {!windowOpen && (
        <Card className="border-red-200 bg-red-50 shadow-sm">
          <CardContent className="p-5">
            <p className="font-medium text-red-900">Encoding period is closed</p>
            <p className="mt-1 text-sm text-red-800">
              Returned entries cannot be edited until the submission window opens again.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-white">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <CardTitle className="text-2xl">All Submitted Entries</CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Search and filter your submitted AWPB entries.
              </p>
              <p className="mt-3 text-sm text-slate-500">
                Showing {filteredEntries.length} of {entries.length} entries
              </p>
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              <div className="relative min-w-[300px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search title, sub activity, or unit"
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending Review">Pending Review</SelectItem>
                  <SelectItem value="Returned">Returned</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredEntries.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">
              No entries match the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col className="w-[30%]" />
                  <col className="w-[11%]" />
                  <col className="w-[10%]" />
                  <col className="w-[18%]" />
                  <col className="w-[13%]" />
                  <col className="w-[11%]" />
                  <col className="w-[7%]" />
                </colgroup>

                <thead className="bg-slate-50 text-left">
                  <tr className="border-b">
                    <th className="px-4 py-3 font-semibold text-slate-700">Title</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Unit</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Year</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Submitted</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">
                      Total
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="border-b last:border-b-0">
                      <td className="px-4 py-4">
                        <p
                          className="truncate font-medium text-slate-900"
                          title={entry.titleOfActivities}
                        >
                          {entry.titleOfActivities}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-slate-700">{entry.unit}</td>
                      <td className="px-4 py-4 text-slate-700">
                        {entry.planningYear || "N/A"}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {formatDate(entry.submittedAt)}
                      </td>

                      <td className="px-4 py-4">
                        <Badge variant={getStatusBadgeVariant(entry.status)}>
                          {entry.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-4 text-right font-medium text-slate-900">
                        {formatCurrency(entry.grandTotal)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedEntry(entry)}
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            View
                          </button>

                          {entry.status === "Returned" && (
                            <button
                              type="button"
                              onClick={() => handleEdit(entry)}
                              disabled={!windowOpen}
                              className={`text-sm font-medium ${
                                windowOpen
                                  ? "text-amber-700 hover:underline"
                                  : "cursor-not-allowed text-slate-400"
                              }`}
                            >
                              {windowOpen ? "Edit" : "Locked"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <EntryDetailsModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </div>
  )
}