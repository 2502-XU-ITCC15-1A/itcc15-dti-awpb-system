import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  ClipboardCheck,
  LogOut,
  User,
  Users,
} from "lucide-react"

const iconMap = {
  dashboard: LayoutDashboard,
  entries: FileText,
  submit: PlusCircle,
  review: ClipboardCheck,
  accounts: Users,
}

export default function AppLayout({
  children,
  navItems = [],
  currentRole = "encoder",
  currentUser,
  onLogout,
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#0b4f52] to-[#08393b] text-white">
      <aside className="flex w-[290px] flex-col px-7 py-8">
        <div>
          <div className="mb-10">
            <div className="px-1">
              <p className="text-2xl font-bold tracking-wide">DTI RAPID</p>
              <p className="text-sm uppercase tracking-[0.22em] text-white/70">
                Growth Project
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-3xl font-bold uppercase tracking-wide">
              {currentRole === "admin" ? "Admin" : "Encoder"}
            </p>
            <div className="mt-4 h-px bg-white/20" />
          </div>

          <nav className="space-y-3">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon]

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-white/85 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  {Icon ? <Icon size={18} /> : null}
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto space-y-4">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
                <User size={18} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {currentUser?.username || "User"}
                </p>
                <p className="text-xs text-white/70 capitalize">
                  {currentUser?.role || "encoder"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-5">
        <div className="h-[calc(100vh-2rem)] overflow-y-auto rounded-[2rem] bg-[#edf4f3] px-6 py-6 text-slate-900 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}