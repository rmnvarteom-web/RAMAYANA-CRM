import type { BookingStats } from "@/features/bookings/stats";

export function StatsGrid({ stats }: { stats: BookingStats }) {
  const cards: { label: string; value: number }[] = [
    { label: "Today", value: stats.today },
    { label: "Yesterday", value: stats.yesterday },
    { label: "Last 7 days", value: stats.last7Days },
    { label: "Last 30 days", value: stats.last30Days },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-md border border-black/10 p-4 text-center">
          <p className="text-2xl font-semibold">{card.value}</p>
          <p className="text-xs text-black/60">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
