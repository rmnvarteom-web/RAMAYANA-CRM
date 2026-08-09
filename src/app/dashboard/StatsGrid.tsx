import type { BookingStats } from "@/features/bookings/stats";
import { card } from "@/lib/ui";

export function StatsGrid({ stats }: { stats: BookingStats }) {
  const cards: { label: string; value: number }[] = [
    { label: "Today", value: stats.today },
    { label: "Yesterday", value: stats.yesterday },
    { label: "Last 7 days", value: stats.last7Days },
    { label: "Last 30 days", value: stats.last30Days },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className={`${card} text-center`}>
          <p className="text-3xl font-semibold tracking-tight text-gray-900">{c.value}</p>
          <p className="mt-1 text-xs font-medium text-gray-500">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
