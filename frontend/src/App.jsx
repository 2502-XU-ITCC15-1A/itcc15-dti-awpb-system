import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import initialTemplateData from "./data/awpb_dropdown_tree.json";
import { supabase } from "./lib/supabase";
import { authService, awbpEntriesService, submissionService } from "./services/supabaseService";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import MyEntries from "./pages/MyEntries";
import SubmitEntry from "./pages/SubmitEntry";
import AdminReview from "./pages/AdminReview";
import AdminDashboard from "./pages/AdminDashboard";
import ManageAccounts from "./pages/ManageAccounts";
import AddNewAccount from "./pages/AddNewAccount";
import ManageTemplate from "./pages/ManageTemplate";

const INITIAL_ACCOUNTS = [
  {
    id: "acc-001",
    username: "enc_user",
    fullName: "Default Encoder",
    email: "encoder@dti.gov.ph",
    role: "encoder",
    status: "active",
  },
  {
    id: "acc-002",
    username: "adm_admin",
    fullName: "Default Admin",
    email: "admin@dti.gov.ph",
    role: "admin",
    status: "active",
  },
];

function createInitialTemplateState() {
  return JSON.parse(JSON.stringify(initialTemplateData));
}

function App() {
  const [entries, setEntries] = useState([]);
  const [entryBeingEdited, setEntryBeingEdited] = useState(null);
  const [submitEntryDraft, setSubmitEntryDraft] = useState(null);
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [templateData, setTemplateData] = useState(createInitialTemplateState);
  const [authLoading, setAuthLoading] = useState(true);

  const [submissionWindow, setSubmissionWindow] = useState({
    startDate: "2026-04-01",
    endDate: "2026-04-30",
  });

  const [authUser, setAuthUser] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);
  const toastDismissRef = useRef(null);

  const isAuthenticated = Boolean(authUser);
  const currentRole = authUser?.role || null;
  const encoderEntries = useMemo(() => {
    if (!authUser?.id) return [];
    return entries.filter((entry) => entry.ownerId === authUser.id);
  }, [authUser?.id, entries]);

  // Restore session on page load and listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        authService.getProfile(session.user.id)
          .then((profile) => {
            setAuthUser({
              id: profile.id,
              username: profile.username,
              role: profile.role,
              fullName: profile.full_name,
              status: profile.status,
            });
          })
          .catch(() => {})
          .finally(() => setAuthLoading(false));
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setAuthUser(null);
        setEntries([]);
        setEntryBeingEdited(null);
        setSubmitEntryDraft(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load entries from Supabase whenever user logs in
  useEffect(() => {
    if (!authUser?.id) {
      setEntries([]);
      return;
    }
    awbpEntriesService.getAll()
      .then(setEntries)
      .catch(console.error);
  }, [authUser?.id]);

  // Load submission window from Supabase
  useEffect(() => {
    submissionService.getActiveWindow()
      .then((window) => {
        if (window) {
          setSubmissionWindow({
            startDate: window.start_date,
            endDate: window.end_date,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Cleanup toast timers
  useEffect(() => {
    return () => {
      window.clearTimeout(toastTimeoutRef.current);
      window.clearTimeout(toastDismissRef.current);
    };
  }, []);

  const handleLogin = (user) => {
    setAuthUser({
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName || user.username,
      status: user.status,
    });
  };

  const handleLogout = async () => {
    try { await authService.signOut(); } catch (_) {}
    setAuthUser(null);
    setEntries([]);
    setEntryBeingEdited(null);
    setSubmitEntryDraft(null);
  };

  const showToast = ({ title, description = "", type = "info" }) => {
    const id = Date.now();
    setToast({ id, title, description, type, exiting: false });

    window.clearTimeout(toastTimeoutRef.current);
    window.clearTimeout(toastDismissRef.current);
    toastTimeoutRef.current = window.setTimeout(() => {
      dismissToast(id);
    }, 2600);
  };

  const dismissToast = (toastId) => {
    setToast((current) => {
      if (!current || current.id !== toastId || current.exiting) return current;
      return { ...current, exiting: true };
    });

    window.clearTimeout(toastDismissRef.current);
    toastDismissRef.current = window.setTimeout(() => {
      setToast((current) => (current?.id === toastId ? null : current));
    }, 220);
  };

  const handleAddEntry = async (newEntry) => {
    // Optimistic update
    setEntries((prev) => [newEntry, ...prev]);
    try {
      await awbpEntriesService.create(newEntry);
      const fresh = await awbpEntriesService.getAll();
      setEntries(fresh);
    } catch (error) {
      console.error("Failed to save entry:", error);
      setEntries((prev) => prev.filter((e) => e.id !== newEntry.id));
      showToast({ title: "Failed to save entry. Please try again.", type: "error" });
    }
  };

  const handleUpdateEntry = async (entryId, updates) => {
    setEntries((prev) =>
      prev.map((entry) => entry.id === entryId ? { ...entry, ...updates } : entry)
    );
    try {
      await awbpEntriesService.update(entryId, updates);
    } catch (error) {
      console.error("Failed to update entry:", error);
      const fresh = await awbpEntriesService.getAll().catch(() => null);
      if (fresh) setEntries(fresh);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    try {
      await awbpEntriesService.delete(entryId);
    } catch (error) {
      console.error("Failed to delete entry:", error);
      const fresh = await awbpEntriesService.getAll().catch(() => null);
      if (fresh) setEntries(fresh);
    }
  };

  const handleStartEdit = (entry) => {
    setEntryBeingEdited(entry);
  };

  const handleSaveEditedEntry = async (entryId, updatedEntry) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === entryId ? updatedEntry : entry))
    );
    setEntryBeingEdited(null);
    try {
      await awbpEntriesService.update(entryId, updatedEntry);
      const fresh = await awbpEntriesService.getAll();
      setEntries(fresh);
    } catch (error) {
      console.error("Failed to update entry:", error);
    }
  };

  const clearEditingEntry = () => setEntryBeingEdited(null);
  const clearSubmitEntryDraft = () => setSubmitEntryDraft(null);

  const handleAddAccount = (newAccount) => {
    setAccounts((prev) => [newAccount, ...prev]);
  };

  const handleUpdateAccount = (accountId, updates) => {
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === accountId ? { ...account, ...updates } : account
      )
    );
  };

  const navItems = useMemo(() => {
    if (currentRole === "admin") {
      return [
        { to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
        { to: "/admin/review", label: "Admin Review", icon: "review" },
        { to: "/admin/manage-template", label: "Manage Template", icon: "template" },
        {
          label: "Manage Accounts",
          icon: "accounts",
          subItems: [
            { to: "/admin/manage-accounts", label: "All Accounts" },
            { to: "/admin/manage-accounts/new", label: "Add New Account" },
          ],
        },
      ];
    }
    return [
      { to: "/", label: "Home", icon: "dashboard" },
      { to: "/entries", label: "My Entries", icon: "entries" },
      { to: "/submit", label: "Submit Entry", icon: "submit" },
    ];
  }, [currentRole]);

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/forgot-password" element={<ForgotPassword accounts={accounts} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <AppLayout
      navItems={navItems}
      currentRole={currentRole}
      currentUser={authUser}
      onLogout={handleLogout}
      toast={toast}
      onDismissToast={() => { if (toast?.id) dismissToast(toast.id); }}
    >
      <Routes>
        <Route path="/login" element={<Navigate to={currentRole === "admin" ? "/admin/dashboard" : "/"} replace />} />
        <Route path="/forgot-password" element={<Navigate to={currentRole === "admin" ? "/admin/dashboard" : "/"} replace />} />

        <Route
          path="/"
          element={
            currentRole === "encoder"
              ? <Home entries={encoderEntries} submissionWindow={submissionWindow} />
              : <Navigate to="/admin/dashboard" replace />
          }
        />

        <Route
          path="/entries"
          element={
            currentRole === "encoder"
              ? <MyEntries entries={encoderEntries} onEditEntry={handleStartEdit} onDeleteEntry={handleDeleteEntry} onShowToast={showToast} submissionWindow={submissionWindow} />
              : <Navigate to="/admin/dashboard" replace />
          }
        />

        <Route
          path="/submit"
          element={
            currentRole === "encoder"
              ? <SubmitEntry onAddEntry={handleAddEntry} entryToEdit={entryBeingEdited} onSaveEditedEntry={handleSaveEditedEntry} clearEditingEntry={clearEditingEntry} submissionWindow={submissionWindow} draftState={submitEntryDraft} onDraftChange={setSubmitEntryDraft} onClearDraft={clearSubmitEntryDraft} currentUser={authUser} templateData={templateData} />
              : <Navigate to="/admin/dashboard" replace />
          }
        />

        <Route
          path="/admin/manage-template"
          element={
            currentRole === "admin"
              ? <ManageTemplate templateData={templateData} onUpdateTemplateData={setTemplateData} onResetTemplate={() => setTemplateData(createInitialTemplateState())} onShowToast={showToast} />
              : <Navigate to="/" replace />
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            currentRole === "admin"
              ? <AdminDashboard entries={entries} submissionWindow={submissionWindow} onUpdateSubmissionWindow={setSubmissionWindow} />
              : <Navigate to="/" replace />
          }
        />

        <Route
          path="/admin/review"
          element={
            currentRole === "admin"
              ? <AdminReview entries={entries} onUpdateEntry={handleUpdateEntry} onDeleteEntry={handleDeleteEntry} submissionWindow={submissionWindow} onShowToast={showToast} />
              : <Navigate to="/" replace />
          }
        />

        <Route
          path="/admin/manage-accounts"
          element={
            currentRole === "admin"
              ? <ManageAccounts accounts={accounts} onUpdateAccount={handleUpdateAccount} onShowToast={showToast} />
              : <Navigate to="/" replace />
          }
        />

        <Route
          path="/admin/manage-accounts/new"
          element={
            currentRole === "admin"
              ? <AddNewAccount accounts={accounts} onAddAccount={handleAddAccount} onShowToast={showToast} />
              : <Navigate to="/" replace />
          }
        />
      </Routes>
    </AppLayout>
  );
}

export default App;
