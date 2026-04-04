import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  ClipboardCheck,
} from "lucide-react"

const iconMap = {
  dashboard: LayoutDashboard,
  entries: FileText,
  submit: PlusCircle,
  review: ClipboardCheck,
}

export default function AppLayout({
  children,
  navItems = [],
  currentRole = "encoder",
  onRoleChange,
}) {
  return (
    <div className="flex h-screen">
      <div className="w-72 bg-white border-r p-4">
        <h1 className="text-xl font-bold mb-2">AWPB System</h1>
        <p className="mb-6 text-sm text-gray-500">
          Role: {currentRole === "admin" ? "Admin" : "Encoder"}
        </p>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon]

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded p-2 ${
                    isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"
                  }`
                }
              >
                {Icon ? <Icon size={18} /> : null}
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-8 rounded-xl border bg-gray-50 p-4">
          <p className="mb-3 text-sm font-medium">Temporary Role Switch</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onRoleChange?.("encoder")}
              className={`rounded-lg border px-3 py-2 text-sm ${
                currentRole === "encoder"
                  ? "bg-black text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              Encoder
            </button>

            <button
              type="button"
              onClick={() => onRoleChange?.("admin")}
              className={`rounded-lg border px-3 py-2 text-sm ${
                currentRole === "admin"
                  ? "bg-black text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">{children}</div>
    </div>
  )
}