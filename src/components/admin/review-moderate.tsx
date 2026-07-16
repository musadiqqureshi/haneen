"use client";

import { Check, X, Trash2 } from "lucide-react";
import { moderateReviewAction } from "@/lib/admin/actions";

function Act({
  id,
  action,
  title,
  children,
  confirm: needConfirm,
}: {
  id: string;
  action: string;
  title: string;
  children: React.ReactNode;
  confirm?: boolean;
}) {
  return (
    <form
      action={moderateReviewAction}
      onSubmit={(e) => {
        if (needConfirm && !confirm("Delete this review permanently?"))
          e.preventDefault();
      }}
    >
      <input type="hidden" name="reviewId" value={id} />
      <input type="hidden" name="action" value={action} />
      <button
        title={title}
        className="rounded-md border border-line p-2 text-ink-soft hover:bg-beige hover:text-ink"
      >
        {children}
      </button>
    </form>
  );
}

export function ReviewModerate({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {status !== "published" && (
        <Act id={id} action="publish" title="Publish">
          <Check className="h-4 w-4 text-green-600" />
        </Act>
      )}
      {status !== "rejected" && (
        <Act id={id} action="reject" title="Reject">
          <X className="h-4 w-4 text-gold-700" />
        </Act>
      )}
      <Act id={id} action="delete" title="Delete" confirm>
        <Trash2 className="h-4 w-4 text-red-500" />
      </Act>
    </div>
  );
}
