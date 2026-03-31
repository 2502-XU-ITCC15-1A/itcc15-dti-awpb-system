import { useState } from "react"
import { Routes, Route } from "react-router-dom"
import AppLayout from "./components/layout/AppLayout"

import Dashboard from "./pages/Dashboard"
import MyEntries from "./pages/MyEntries"
import SubmitEntry from "./pages/SubmitEntry"

function App() {
  const [entries, setEntries] = useState([])

  const handleAddEntry = (newEntry) => {
    setEntries((prev) => [newEntry, ...prev])
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/entries" element={<MyEntries entries={entries} />} />
        <Route
          path="/submit"
          element={<SubmitEntry onAddEntry={handleAddEntry} />}
        />
      </Routes>
    </AppLayout>
  )
}

export default App