import { NavLink } from "react-router-dom"
import { LayoutDashboard, FileText, PlusCircle } from "lucide-react"

export default function AppLayout({ children }) {
    return (
        <div className="flex h-screen">

            <div className="w-64 bg-white border-r p-4">
                <h1 className="text-xl font-bold mb-6">
                    AWPB System
                </h1>

                <nav className="space-y-2">

                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center gap-2 p-2 rounded ${isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"
                            }`
                        }
                    >
                        <LayoutDashboard size={18} />
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/entries"
                        className={({ isActive }) =>
                            `flex items-center gap-2 p-2 rounded ${isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"
                            }`
                        }
                    >
                        <FileText size={18} />
                        My Entries
                    </NavLink>

                    <NavLink
                        to="/submit"
                        className={({ isActive }) =>
                            `flex items-center gap-2 p-2 rounded ${isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"
                            }`
                        }
                    >
                        <PlusCircle size={18} />
                        Submit Entry
                    </NavLink>

                </nav>
            </div>

            <div className="flex-1 bg-gray-50 p-6">
                {children}
            </div>

        </div>
    )
}