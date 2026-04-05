import { useMemo, useState } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import AppLayout from "./components/layout/AppLayout"

import Home from "./pages/Home"
import MyEntries from "./pages/MyEntries"
import SubmitEntry from "./pages/SubmitEntry"
import AdminReview from "./pages/AdminReview"
import AdminDashboard from "./pages/AdminDashboard"

function App() {
  const [entries, setEntries] = useState([])
  const [currentRole, setCurrentRole] = useState("encoder")
  const [entryBeingEdited, setEntryBeingEdited] = useState(null)

  const [submissionWindow, setSubmissionWindow] = useState({
    startDate: "2026-04-01",
    endDate: "2026-04-30",
  })

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
        { to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
        { to: "/admin/review", label: "Admin Review", icon: "review" },
      ]
    }

    return [
      { to: "/", label: "Home", icon: "dashboard" },
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
        <Route
          path="/"
          element={
            currentRole === "encoder" ? (
              <Home
                entries={entries}
                submissionWindow={submissionWindow}
              />
            ) : (
              <Navigate to="/admin/dashboard" replace />
            )
          }
        />

        <Route
          path="/entries"
          element={
            currentRole === "encoder" ? (
              <MyEntries
                entries={entries}
                onEditEntry={handleStartEdit}
                submissionWindow={submissionWindow}
              />
            ) : (
              <Navigate to="/admin/dashboard" replace />
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
                submissionWindow={submissionWindow}
              />
            ) : (
              <Navigate to="/admin/dashboard" replace />
            )
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            currentRole === "admin" ? (
              <AdminDashboard
                entries={entries}
                submissionWindow={submissionWindow}
                onUpdateSubmissionWindow={setSubmissionWindow}
              />
            ) : (
              <Navigate to="/" replace />
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
                submissionWindow={submissionWindow}
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