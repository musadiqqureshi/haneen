import { statusColor } from "@/components/admin/charts/tokens";

export interface TimelineEvent {
  id: string;
  status: string | null;
  note: string | null;
  created_at: string;
}

const LABEL: Record<string, string> = {
  pending: "Order placed",
  confirmed: "Order confirmed",
  processing: "Processing",
  packed: "Packed & ready",
  shipped: "Shipped",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

/** Vertical order timeline, newest first. */
export function OrderTimeline({ events }: { events: TimelineEvent[] }) {
  if (!events.length) {
    return (
      <p className="text-sm text-ink-muted">No timeline events yet.</p>
    );
  }

  return (
    <ol className="relative space-y-5 pl-1">
      {events.map((e, i) => {
        const color = statusColor(e.status ?? "pending");
        const last = i === events.length - 1;
        return (
          <li key={e.id} className="relative flex gap-3.5">
            {!last && (
              <span className="absolute left-[5px] top-4 h-full w-px bg-line" />
            )}
            <span
              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-white"
              style={{ backgroundColor: color }}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">
                {e.note ?? LABEL[e.status ?? ""] ?? e.status}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {new Date(e.created_at).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
