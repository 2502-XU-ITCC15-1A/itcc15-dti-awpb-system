import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword({ accounts = [] }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedUsername = formData.username.trim().toLowerCase();
    const normalizedEmail = formData.email.trim().toLowerCase();

    if (!normalizedUsername || !normalizedEmail) {
      setSuccessMessage("");
      setError("Please enter your username and registered email.");
      return;
    }

    const matchedAccount = accounts.find(
      (account) =>
        account.username === normalizedUsername &&
        account.email.toLowerCase() === normalizedEmail,
    );

    if (!matchedAccount) {
      setSuccessMessage("");
      setError("We could not find an account matching that username and email.");
      return;
    }

    setError("");
    setSuccessMessage(
      `A frontend demo reset request was prepared for ${matchedAccount.username}. Actual password reset delivery will be handled by the backend.`,
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-[#014b4c] via-[#0a5d60] to-[#4f9597] px-6 py-8">
      <div className="w-full max-w-[550px] rounded-[2rem] bg-white px-8 py-10 shadow-xl md:px-12 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold leading-tight text-[#062f35]">
            Forgot Password
          </h1>
          <p className="mt-2 text-sm text-slate-500 md:text-[15px]">
            Enter the username and email for the account to reset.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="enc_user or adm_admin"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Registered Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="encoder@dti.gov.ph"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-slate-300"
            />
            <p className="mt-2 text-xs text-slate-500">
              This prototype uses username plus email so accounts with the same
              email can still be identified correctly.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-[#233f8f] px-4 py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90"
          >
            REQUEST RESET
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-[#2a6b71] transition hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}


