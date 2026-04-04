import { useMemo, useState } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import AppLayout from "./components/layout/AppLayout"

import Dashboard from "./pages/Dashboard"
import MyEntries from "./pages/MyEntries"
import SubmitEntry from "./pages/SubmitEntry"
import AdminReview from "./pages/AdminReview"

function App() {
  const [entries, setEntries] = useState([])
  const [currentRole, setCurrentRole] = useState("encoder")
  const [entryBeingEdited, setEntryBeingEdited] = useState(null)

  const handleAddEntry = (newEntry) => {
    setEntries((prev) => [newEntry, ...prev])
  }

  const handleUpdateEntry = (entryId, updates) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId ? { ...entry, ...updates } : entry
      )
    )
  }

  const handleStartEdit = (entry) => {
    setEntryBeingEdited(entry)
  }

  const handleSaveEditedEntry = (entryId, updatedEntry) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === entryId ? updatedEntry : entry))
    )
    setEntryBeingEdited(null)
  }

  const clearEditingEntry = () => {
    setEntryBeingEdited(null)
  }

  const navItems = useMemo(() => {
    if (currentRole === "admin") {
      return [
        { to: "/", label: "Dashboard", icon: "dashboard" },
        { to: "/admin/review", label: "Admin Review", icon: "review" },
      ]
    }

    return [
      { to: "/", label: "Dashboard", icon: "dashboard" },
      { to: "/entries", label: "My Entries", icon: "entries" },
      { to: "/submit", label: "Submit Entry", icon: "submit" },
    ]
  }, [currentRole])

  return (
    <AppLayout
      navItems={navItems}
      currentRole={currentRole}
      onRoleChange={(role) => {
        setCurrentRole(role)
        if (role === "admin") {
          setEntryBeingEdited(null)
        }
      }}
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route
          path="/entries"
          element={
            currentRole === "encoder" ? (
              <MyEntries
                entries={entries}
                onEditEntry={handleStartEdit}
              />
            ) : (
              <Navigate to="/admin/review" replace />
            )
          }
        />

        <Route
          path="/submit"
          element={
            currentRole === "encoder" ? (
              <SubmitEntry
                onAddEntry={handleAddEntry}
                entryToEdit={entryBeingEdited}
                onSaveEditedEntry={handleSaveEditedEntry}
                clearEditingEntry={clearEditingEntry}
              />
            ) : (
              <Navigate to="/admin/review" replace />
            )
          }
        />

        <Route
          path="/admin/review"
          element={
            currentRole === "admin" ? (
              <AdminReview
                entries={entries}
                onUpdateEntry={handleUpdateEntry}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </AppLayout>
  )
}

export default App