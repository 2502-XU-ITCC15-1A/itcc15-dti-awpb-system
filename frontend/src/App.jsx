import { Routes, Route } from "react-router-dom"
import AppLayout from "./components/layout/AppLayout"

import Dashboard from "./pages/Dashboard"
import MyEntries from "./pages/MyEntries"
import SubmitEntry from "./pages/SubmitEntry"

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/entries" element={<MyEntries />} />
        <Route path="/submit" element={<SubmitEntry />} />
      </Routes>
    </AppLayout>
  )
}

export default App

