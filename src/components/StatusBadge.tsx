const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  AWAITING_PAYMENT: {
    label: "Awaiting payment slip",
    className: "bg-gray-100 text-gray-700",
  },
  PENDING_PAYMENT_REVIEW: {
    label: "Pending review",
    className: "bg-amber-100 text-amber-800",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-emerald-100 text-emerald-800",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-700",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-500",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? { label: status, className: "bg-gray-100 text-gray-700" };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style.className}`}
    >
      {style.label}
    </span>
  );
}
