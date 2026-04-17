import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// USER MANAGEMENT: Initial form state for creating new users
// Default role is 'encoder' with proper username prefix
const EMPTY_FORM = { 
  username: "enc_",          // Username prefix for encoder role
  fullName: "",              // User's full name for display
  email: "",                 // Email address for login
  password: "",              // Plain text password (will be hashed)
  confirmPassword: "",       // Password confirmation field
  role: "encoder",           // Default user role (encoder/admin)
};

// USER MANAGEMENT: Component for creating new user accounts
// Handles form validation, user creation, and navigation
export default function AddNewAccount({
  accounts = [],           // Existing accounts for validation
  onAddAccount,           // Callback to add new account
  onShowToast,            // Callback for success/error messages
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);     // Form state
  const [errors, setErrors] = useState({});         // Validation errors

  // USER MANAGEMENT: Handle form field changes
// Special logic for role field to update username prefix
const handleFieldChange = (event) => {
    const { name, value } = event.target;

    // ROLE CHANGE: Update username prefix when role changes
    if (name === "role") { 
      setForm((prev) => ({
        ...prev,
        role: value,
        username: updateUsernamePrefix(prev.username, value), // Auto-update prefix
      }));
      return;
    }

    // STANDARD FIELD UPDATE: Update form state for other fields
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // USER MANAGEMENT: Save new user account
// Performs validation, creates user, and handles success/error flow
const handleSave = () => {
    const nextErrors = {};
    const normalizedUsername = form.username.trim().toLowerCase();

    // USER MANAGEMENT: Username validation
    if (!normalizedUsername) {
      nextErrors.username = "Username is required.";
    } else if (!/^(enc|adm)_[a-z0-9_]+$/.test(normalizedUsername)) {
      nextErrors.username =
        "Use a username like enc_jdelacruz or adm_jdelacruz.";
    } else if (
      (form.role === "encoder" && !normalizedUsername.startsWith("enc_")) ||
      (form.role === "admin" && !normalizedUsername.startsWith("adm_"))
    ) {
      nextErrors.username =
        form.role === "encoder"
          ? "Encoder accounts must use the enc_ prefix."
          : "Admin accounts must use the adm_ prefix.";
    } else if (accounts.some((account) => account.username === normalizedUsername)) {
      nextErrors.username = "This username is already assigned to another account.";
    }

    // USER MANAGEMENT: Full name validation
    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    // USER MANAGEMENT: Email validation
    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    // USER MANAGEMENT: Password validation
    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    // USER MANAGEMENT: Password confirmation validation
    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm the password.";
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);

    // USER MANAGEMENT: If validation passes, create the user
    if (Object.keys(nextErrors).length === 0) {
      const createdName = form.fullName.trim();

      // CREATE USER: Call parent callback with new user data
      onAddAccount?.({
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : String(Date.now()),  // Fallback ID generation
        username: normalizedUsername,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        role: form.role,
        status: "active",          // New users are active by default
      });
      
      // SUCCESS: Show success message and navigate back
      onShowToast?.({
        title: "Account created",
        description: `${createdName} was added to All Accounts.`,
        type: "success",
      });
      navigate("/admin/manage-accounts");  // Return to user management
    }
  };

  // USER MANAGEMENT: Cancel user creation and return to management
const handleCancel = () => {
    navigate("/admin/manage-accounts");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Add New Users
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Create a new encoder or admin account for the AWPB system.
        </p>
      </div>

      <Card className="overflow-hidden border-0 shadow-[0_10px_24px_rgba(15,23,42,0.08)] gap-0 py-0">
        <CardHeader className="border-b bg-white px-6 pt-5 pb-4 md:px-8">
          <CardTitle className="text-2xl">Create New User Account</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Fill in the account details and assign the proper role-specific
            username.
          </p>
        </CardHeader>

        <CardContent className="px-6 py-6 md:px-8 md:py-7">
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.2fr_0.8fr] xl:gap-10">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Username
                </label>
                <Input
                  name="username"
                  value={form.username}
                  onChange={handleFieldChange}
                  placeholder="enc_jdelacruz"
                  className="h-11 rounded-xl border-slate-200 bg-white px-4"
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-red-600">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <Input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleFieldChange}
                  placeholder="Enter full name"
                  className="h-11 rounded-xl border-slate-200 bg-white px-4"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFieldChange}
                  placeholder="Enter email"
                  className="h-11 rounded-xl border-slate-200 bg-white px-4"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <Input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleFieldChange}
                  placeholder="New password"
                  className="h-11 rounded-xl border-slate-200 bg-white px-4"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm Password
                </label>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleFieldChange}
                  placeholder="Confirm password"
                  className="h-11 rounded-xl border-slate-200 bg-white px-4"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Role
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleFieldChange}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="admin">Admin</option>
                  <option value="encoder">Encoder</option>
                </select>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 xl:min-h-[230px]">
                <p className="text-sm font-semibold text-slate-800">
                  Account Notes
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Use `enc_` for encoder accounts and `adm_` for admin
                  accounts. Usernames should stay unique and role-specific to
                  preserve separate access for submission and review work.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={handleCancel} className="rounded-lg">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="rounded-lg border-0 bg-gradient-to-r from-[#1f2f74] to-[#2a4694] px-5 text-white hover:from-[#19265f] hover:to-[#213a80]"
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// USER MANAGEMENT: Helper function to update username prefix based on role
// Ensures usernames follow the proper format (enc_ for encoder, adm_ for admin)
function updateUsernamePrefix(username, role) {
  const normalized = String(username || "").trim().toLowerCase();
  const nextPrefix = role === "admin" ? "adm_" : "enc_";

  // EMPTY USERNAME: Return just the prefix
  if (!normalized) {
    return nextPrefix;
  }

  // EXISTING PREFIX: Replace existing prefix with new one
  if (normalized.startsWith("enc_") || normalized.startsWith("adm_")) {
    return `${nextPrefix}${normalized.split("_").slice(1).join("_")}`;
  }

  // NO PREFIX: Add the appropriate prefix
  return `${nextPrefix}${normalized.replace(/[^a-z0-9_]/g, "")}`;
}
