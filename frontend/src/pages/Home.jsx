

import { useMemo } from "react"
import { Link } from "react-router-dom"
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  XCircle,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

function StatCard({ title, value, icon: Icon, highlight = false }) {
  return (
    <Card
      className={
        highlight
          ? "border-0 bg-slate-900 text-white shadow-md"
          : "border-slate-200 bg-white shadow-sm"
      }
    >
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p
            className={`text-sm ${
              highlight ? "text-white/75" : "text-slate-500"
            }`}
          >
            {title}
          </p>
          <h2 className="mt-3 text-4xl font-bold">{value}</h2>
        </div>

        <div
          className={`rounded-2xl p-3 ${
            highlight
              ? "bg-white/10 text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          <Icon size={20} />
        </div>
      </CardContent>
    </Card>
  )
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
      .slice(0, 4)
  }, [entries])

  const budgetSnapshot = useMemo(() => {
    const totalBudget = entries.reduce(
      (sum, entry) => sum + (Number(entry.grandTotal) || 0),
      0
    )

    const latestYear =
      [...new Set(entries.map((entry) => entry.planningYear).filter(Boolean))]
        .sort((a, b) => String(b).localeCompare(String(a)))[0] || "N/A"

    const unitTotalsMap = entries.reduce((acc, entry) => {
      const unit = entry.unit || "N/A"
      acc[unit] = (acc[unit] || 0) + (Number(entry.grandTotal) || 0)
      return acc
    }, {})

    const unitTotals = Object.entries(unitTotalsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    return {
      totalBudget,
      latestYear,
      unitTotals,
    }
  }, [entries])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Home</h1>
          <p className="mt-1 text-sm text-slate-500">
            View your submission statuses and recent AWPB entries.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/submit">Add New Entry</Link>
          </Button>

          <Button asChild variant="outline">
            <Link to="/entries">Go to My Entries</Link>
          </Button>
        </div>
      </div>

      <Card
        className={`shadow-sm ${
          windowOpen
            ? "border-emerald-200 bg-emerald-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p
              className={`text-base font-semibold ${
                windowOpen ? "text-emerald-900" : "text-red-900"
              }`}
            >
              Encoding Period {windowOpen ? "Open" : "Closed"}
            </p>
            <p
              className={`text-sm ${
                windowOpen ? "text-emerald-800" : "text-red-800"
              }`}
            >
              {formatDateOnly(submissionWindow?.startDate)} to{" "}
              {formatDateOnly(submissionWindow?.endDate)}
            </p>
          </div>

          <Badge variant={windowOpen ? "default" : "destructive"}>
            {windowOpen ? "Open" : "Closed"}
          </Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Approved"
          value={stats.approved}
          icon={CheckCircle2}
          highlight
        />
        <StatCard title="Pending" value={stats.pending} icon={Clock3} />
        <StatCard title="Rejected" value={stats.rejected} icon={XCircle} />
        <StatCard title="Revision" value={stats.returned} icon={AlertCircle} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="border-slate-200 shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Needs Attention</CardTitle>
            <p className="text-sm text-slate-500">
              Returned entries that may need revision.
            </p>
          </CardHeader>

          <CardContent>
            {returnedEntries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                No returned entries right now.
              </div>
            ) : (
              <div className="space-y-3">
                {returnedEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">
                          {entry.titleOfActivities}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {entry.unit} • {entry.planningYear || "N/A"}
                        </p>
                      </div>

                      <Badge variant={getStatusBadgeVariant(entry.status)}>
                        {entry.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-slate-600">
                      {entry.adminComment || "No admin comment provided."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Budget Snapshot</CardTitle>
              <p className="text-sm text-slate-500">
                Quick view of your current submitted totals.
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Total Budget Submitted</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {formatCurrency(budgetSnapshot.totalBudget)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Latest Planning Year</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {budgetSnapshot.latestYear}
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm text-slate-500">Top Units</p>

                {budgetSnapshot.unitTotals.length === 0 ? (
                  <p className="text-sm text-slate-500">No data yet.</p>
                ) : (
                  <div className="space-y-2">
                    {budgetSnapshot.unitTotals.map(([unit, total]) => (
                      <div
                        key={unit}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                      >
                        <span className="text-sm font-medium text-slate-700">
                          {unit}
                        </span>
                        <span className="text-sm text-slate-600">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent Submissions</CardTitle>
              <p className="text-sm text-slate-500">
                Your latest submitted entries.
              </p>
            </CardHeader>

            <CardContent>
              {recentEntries.length === 0 ? (
                <p className="text-sm text-slate-500">No entries submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">
                          {entry.titleOfActivities}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Submitted {formatDateTime(entry.submittedAt)}
                        </p>
                      </div>

                      <Badge variant={getStatusBadgeVariant(entry.status)}>
                        {entry.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}