import { cn } from "@/lib/utils";

type Status = "selected" | "rejected" | "review" | "pending" | "completed";

const statusConfig: Record<Status, { label: string; className: string }> = {
  selected: { label: "Selected", className: "bg-success/10 text-success border-success/20" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive border-destructive/20" },
  review: { label: "Under Review", className: "bg-warning/10 text-warning border-warning/20" },
  pending: { label: "Pending", className: "bg-info/10 text-info border-info/20" },
  completed: { label: "Completed", className: "bg-success/10 text-success border-success/20" },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", config.className)}>
      {config.label}
    </span>
  );
}
