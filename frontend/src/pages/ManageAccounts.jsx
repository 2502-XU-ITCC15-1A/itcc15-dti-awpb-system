import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, RotateCcw, Search, UserPlus, UserX } from "lucide-react";

import AdminDeactivateUserModal from "@/components/admin/AdminDeactivateUserModal";
import AdminEditUserModal from "@/components/admin/AdminEditUserModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const INITIAL_ACCOUNTS = [
  {
    id: "acc-001",
    username: "enc_kalmonte",
    fullName: "Kate Cassandra G. Almonte",
    email: "kate.almonte@dti.gov.ph",
    role: "encoder",
    status: "active",
  },
  {
    id: "acc-002",
    username: "adm_kbaygan",
    fullName: "Kristine Jean P. Baygan",
    email: "kristine.baygan@dti.gov.ph",
    role: "admin",
    status: "active",
  },
  {
    id: "acc-003",
    username: "adm_glayo",
    fullName: "Glavine Grace C. Layo",
    email: "glavine.layo@dti.gov.ph",
    role: "admin",
    status: "active",
  },
  {
    id: "acc-004",
    username: "enc_ftan",
    fullName: "Frances Ryle R. Tan",
    email: "frances.tan@dti.gov.ph",
    role: "encoder",
    status: "active",
  },
  {
    id: "acc-005",
    username: "enc_ftamano",
    fullName: "Bae Fatma Razzia D. Tamano",
    email: "fatma.tamano@dti.gov.ph",
    role: "encoder",
    status: "deactivated",
  },
  {
    id: "acc-006",
    username: "adm_kchavez",
    fullName: "Keisha Kate S. Chavez",
    email: "keisha.chavez@dti.gov.ph",
    role: "admin",
    status: "active",
  },
];

const EMPTY_EDIT_FORM = {
  username: "",
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "encoder",
};

function getRoleBadgeVariant(role) {
  return role === "admin" ? "default" : "outline";
}

function getStatusBadgeVariant(status) {
  return status === "active" ? "statusApproved" : "statusRejected";
}

export default function ManageAccounts() {
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [editErrors, setEditErrors] = useState({});
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  const filteredAccounts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return accounts.filter((account) => {
      const matchesSearch =
        normalizedSearch === "" ||
        account.username.toLowerCase().includes(normalizedSearch) ||
        account.fullName.toLowerCase().includes(normalizedSearch) ||
        account.email.toLowerCase().includes(normalizedSearch) ||
        account.role.toLowerCase().includes(normalizedSearch) ||
        account.status.toLowerCase().includes(normalizedSearch);

      const matchesRole = roleFilter === "all" || account.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || account.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [accounts, roleFilter, searchTerm, statusFilter]);

  const openEditModal = (account) => {
    setEditTarget(account);
    setEditForm({
      username: account.username,
      fullName: account.fullName,
      email: account.email,
      password: "",
      confirmPassword: "",
      role: account.role,
    });
    setEditErrors({});
  };

  const closeEditModal = () => {
    setEditTarget(null);
    setEditForm(EMPTY_EDIT_FORM);
    setEditErrors({});
  };

  const handleEditFieldChange = (event) => {
    const { name, value } = event.target;

    if (name === "role") {
      setEditForm((prev) => ({
        ...prev,
        role: value,
        username: updateUsernamePrefix(prev.username, value),
      }));
      return;
    }

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = () => {
    const nextErrors = {};

    if (!editForm.username.trim()) {
      nextErrors.username = "Username is required.";
    } else if (!/^(enc|adm)_[a-z0-9_]+$/.test(editForm.username.trim())) {
      nextErrors.username =
        "Use a username like enc_jdelacruz or adm_jdelacruz.";
    } else if (
      (editForm.role === "encoder" && !editForm.username.trim().startsWith("enc_")) ||
      (editForm.role === "admin" && !editForm.username.trim().startsWith("adm_"))
    ) {
      nextErrors.username =
        editForm.role === "encoder"
          ? "Encoder accounts must use the enc_ prefix."
          : "Admin accounts must use the adm_ prefix.";
    }

    if (!editForm.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!editForm.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (editForm.password || editForm.confirmPassword) {
      if (editForm.password.length < 8) {
        nextErrors.password = "Password must be at least 8 characters.";
      }

      if (editForm.password !== editForm.confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setEditErrors(nextErrors);
      return;
    }

    setAccounts((prev) =>
      prev.map((account) =>
        account.id === editTarget.id
          ? {
              ...account,
              username: editForm.username.trim().toLowerCase(),
              fullName: editForm.fullName.trim(),
              email: editForm.email.trim(),
              role: editForm.role,
            }
          : account,
      ),
    );

    closeEditModal();
  };

  const handleDeactivate = () => {
    if (!deactivateTarget) return;

    setAccounts((prev) =>
      prev.map((account) =>
        account.id === deactivateTarget.id
          ? { ...account, status: "deactivated" }
          : account,
      ),
    );

    setDeactivateTarget(null);
  };

  const handleActivate = (accountId) => {
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === accountId ? { ...account, status: "active" } : account,
      ),
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Manage Accounts
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review, edit, and deactivate user accounts for the AWPB system.
        </p>
      </div>

      <Card className="overflow-hidden border-0 shadow-[0_10px_24px_rgba(15,23,42,0.08)] gap-0 py-0">
        <CardHeader className="border-b bg-white px-6 pt-5 pb-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <CardTitle className="text-2xl">List of All Created Users</CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Manage account access, roles, and active status.
              </p>
              <p className="mt-6 text-sm text-slate-500">
                Showing {filteredAccounts.length} of {accounts.length} accounts
              </p>
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              <div className="relative min-w-[300px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search username, user, email, role, or status"
                  className="pl-9"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="encoder">Encoder</option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="deactivated">Deactivated</option>
              </select>

              <Button variant="outline" onClick={resetFilters}>
                Reset
              </Button>

              <Button
                asChild
                className="border-0 bg-gradient-to-r from-[#1f2f74] to-[#2a4694] text-white shadow-[0_6px_16px_rgba(31,47,116,0.28)] transition-all duration-200 hover:from-[#19265f] hover:to-[#213a80] hover:shadow-[0_10px_24px_rgba(31,47,116,0.38)]"
              >
                <Link to="/admin/manage-accounts/new">
                  <UserPlus size={16} />
                  Add User
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredAccounts.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">
              No accounts match the current search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1120px] w-full table-fixed border-collapse text-sm">
                <colgroup>
                  <col className="w-[17%]" />
                  <col className="w-[22%]" />
                  <col className="w-[23%]" />
                  <col className="w-[11%]" />
                  <col className="w-[10%]" />
                  <col className="w-[17%]" />
                </colgroup>

                <thead className="bg-slate-50 text-left">
                  <tr className="border-b">
                    <th className="px-4 py-2.5 font-semibold text-slate-700">
                      Username
                    </th>
                    <th className="px-4 py-2.5 font-semibold text-slate-700">
                      Full Name
                    </th>
                    <th className="px-4 py-2.5 font-semibold text-slate-700">
                      Email
                    </th>
                    <th className="px-4 py-2.5 font-semibold text-slate-700">
                      Role
                    </th>
                    <th className="px-4 py-2.5 font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-center font-semibold text-slate-700">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAccounts.map((account) => (
                    <tr key={account.id} className="border-b last:border-b-0">
                      <td className="px-4 py-4 text-slate-700">
                        {account.username}
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-900">
                          {account.fullName}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-slate-700">{account.email}</td>

                      <td className="px-4 py-4">
                        <Badge variant={getRoleBadgeVariant(account.role)}>
                          {account.role === "admin" ? "Admin" : "Encoder"}
                        </Badge>
                      </td>

                      <td className="px-4 py-4">
                        <Badge variant={getStatusBadgeVariant(account.status)}>
                          {account.status === "active" ? "Active" : "Deactivated"}
                        </Badge>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => openEditModal(account)}
                            className="shrink-0 border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                          >
                            <Pencil size={15} />
                            Edit
                          </Button>

                          {account.status === "active" ? (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setDeactivateTarget(account)}
                              className="shrink-0 border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                            >
                              <UserX size={15} />
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleActivate(account.id)}
                              className="shrink-0 border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                            >
                              <RotateCcw size={15} />
                              Activate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AdminEditUserModal
        open={Boolean(editTarget)}
        onOpenChange={(open) => !open && closeEditModal()}
        form={editForm}
        errors={editErrors}
        onFieldChange={handleEditFieldChange}
        onSave={handleSaveChanges}
      />

      <AdminDeactivateUserModal
        open={Boolean(deactivateTarget)}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
        user={deactivateTarget}
        onConfirm={handleDeactivate}
      />
    </div>
  );
}

function updateUsernamePrefix(username, role) {
  const normalized = String(username || "").trim().toLowerCase();
  const nextPrefix = role === "admin" ? "adm_" : "enc_";

  if (!normalized) {
    return nextPrefix;
  }

  if (normalized.startsWith("enc_") || normalized.startsWith("adm_")) {
    return `${nextPrefix}${normalized.split("_").slice(1).join("_")}`;
  }

  return `${nextPrefix}${normalized.replace(/[^a-z0-9_]/g, "")}`;
}
