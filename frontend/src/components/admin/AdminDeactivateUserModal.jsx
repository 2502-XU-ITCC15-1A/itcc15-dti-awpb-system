import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AdminDeactivateUserModal({
  open,
  onOpenChange,
  user,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-[1.75rem] bg-white shadow-[0_22px_70px_rgba(15,23,42,0.32)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between rounded-t-[1.75rem] border-b bg-white px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Removing
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Are you sure you want to remove this user?
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6">
          {user && (
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="font-medium text-slate-900">{user.fullName}</p>
              <p className="mt-1 text-slate-600">{user.username}</p>
              <p className="mt-1 text-slate-500">{user.email}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 rounded-b-[1.75rem] border-t bg-slate-50/80 px-6 py-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
