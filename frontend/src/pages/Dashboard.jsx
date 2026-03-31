

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Overview of your AWPB submissions and statuses.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Submitted Entries</p>
          <h2 className="mt-2 text-3xl font-bold">12</h2>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Pending Review</p>
          <h2 className="mt-2 text-3xl font-bold">5</h2>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Approved Entries</p>
          <h2 className="mt-2 text-3xl font-bold">20</h2>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <p className="text-sm text-gray-500">
            Latest updates from your submissions.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">RCU Budget Entry 2027</p>
              <p className="text-sm text-gray-500">Submitted on March 30, 2026</p>
            </div>
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
              Pending
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Training Program Proposal</p>
              <p className="text-sm text-gray-500">Returned on March 28, 2026</p>
            </div>
            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
              Returned
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Quarter 1 Activity Plan</p>
              <p className="text-sm text-gray-500">Approved on March 25, 2026</p>
            </div>
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              Approved
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}