import { useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";

import Login from "./pages/Login";
import Home from "./pages/Home";
import MyEntries from "./pages/MyEntries";
import SubmitEntry from "./pages/SubmitEntry";
import AdminReview from "./pages/AdminReview";
import AdminDashboard from "./pages/AdminDashboard";
import ManageAccounts from "./pages/ManageAccounts";
import AddNewAccount from "./pages/AddNewAccount";

function App() {
  const [entries, setEntries] = useState([]);
  const [entryBeingEdited, setEntryBeingEdited] = useState(null);
  const [submitEntryDraft, setSubmitEntryDraft] = useState(null);

  const [submissionWindow, setSubmissionWindow] = useState({
    startDate: "2026-04-01",
    endDate: "2026-04-30",
  });

  const [authUser, setAuthUser] = useState(null);

  const isAuthenticated = Boolean(authUser);
  const currentRole = authUser?.role || null;

  const handleLogin = (user) => {
    setAuthUser(user);
  };

  const handleLogout = () => {
    setAuthUser(null);
    setEntryBeingEdited(null);
    setSubmitEntryDraft(null);
  };

  const handleAddEntry = (newEntry) => {
    setEntries((prev) => [newEntry, ...prev]);
  };

  const handleUpdateEntry = (entryId, updates) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId ? { ...entry, ...updates } : entry,
      ),
    );
  };

  const handleStartEdit = (entry) => {
    setEntryBeingEdited(entry);
  };

  const handleSaveEditedEntry = (entryId, updatedEntry) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === entryId ? updatedEntry : entry)),
    );
    setEntryBeingEdited(null);
  };

  const clearEditingEntry = () => {
    setEntryBeingEdited(null);
  };

  const clearSubmitEntryDraft = () => {
    setSubmitEntryDraft(null);
  };

  const navItems = useMemo(() => {
    if (currentRole === "admin") {
      return [
        { to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
        { to: "/admin/review", label: "Admin Review", icon: "review" },
        {
          label: "Manage Accounts",
          icon: "accounts",
          subItems: [
            { to: "/admin/manage-accounts", label: "All Accounts" },
            { to: "/admin/manage-accounts/new", label: "Add New Account" },
          ],
        },
      ]
    }

    return [
      { to: "/", label: "Home", icon: "dashboard" },
      { to: "/entries", label: "My Entries", icon: "entries" },
      { to: "/submit", label: "Submit Entry", icon: "submit" },
    ]
  }, [currentRole])

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <AppLayout
      navItems={navItems}
      currentRole={currentRole}
      currentUser={authUser}
      onLogout={handleLogout}
    >
      <Routes>
        <Route
          path="/"
          element={
            currentRole === "encoder" ? (
              <Home entries={entries} submissionWindow={submissionWindow} />
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
                draftState={submitEntryDraft}
                onDraftChange={setSubmitEntryDraft}
                onClearDraft={clearSubmitEntryDraft}
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

        <Route
          path="/admin/manage-accounts"
          element={
            currentRole === "admin" ? (
              <ManageAccounts />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/admin/manage-accounts/new"
          element={
            currentRole === "admin" ? (
              <AddNewAccount />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />


      </Routes>
    </AppLayout>
  );
}

export default App;
