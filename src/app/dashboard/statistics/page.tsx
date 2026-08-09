import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/features/auth/guards";
import { getBookingsByDay } from "@/features/bookings/stats";
import { bangkokToday, addDaysToDateString } from "@/lib/timezone";
import { StatsChart } from "@/app/dashboard/statistics/StatsChart";
import { BackLink } from "@/components/BackLink";
import { pageShell, card, input as inputClass, buttonPrimary, buttonSecondary } from "@/lib/ui";

function isValidDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

const PRESETS = [
  { key: "7", label: "Last 7 days", days: 7 },
  { key: "30", label: "Last 30 days", days: 30 },
  { key: "90", label: "Last 90 days", days: 90 },
];

export default async function StatisticsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; preset?: string }>;
}) {
  const session = await requireSession();
  if (!session.agencyId) redirect("/dashboard");

  const { from: rawFrom, to: rawTo, preset: rawPreset } = await searchParams;
  const today = bangkokToday();

  const activePreset = PRESETS.find((p) => p.key === rawPreset) ?? PRESETS[1];
  const hasCustomRange = rawFrom && rawTo && isValidDateString(rawFrom) && isValidDateString(rawTo);

  const to = hasCustomRange ? rawTo! : today;
  const from = hasCustomRange ? rawFrom! : addDaysToDateString(today, -(activePreset.days - 1));

  const points = await getBookingsByDay(session.agencyId, from, to);
  const totalBookings = points.reduce((sum, p) => sum + p.count, 0);
  const totalAmount = points.reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <main className={`${pageShell} max-w-3xl`}>
      <BackLink href="/dashboard">Dashboard</BackLink>
      <h1 className="text-2xl font-semibold text-gray-900">Statistics</h1>

      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => (
          <Link
            key={p.key}
            href={`/dashboard/statistics?preset=${p.key}`}
            className={!hasCustomRange && p.key === activePreset.key ? buttonPrimary : buttonSecondary}
          >
            {p.label}
          </Link>
        ))}
        <form method="get" className="flex items-center gap-2">
          <input type="date" name="from" defaultValue={from} className={inputClass} />
          <span className="text-sm text-gray-400">to</span>
          <input type="date" name="to" defaultValue={to} className={inputClass} />
          <button type="submit" className={buttonSecondary}>
            Apply
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:w-80">
        <div className={`${card} text-center`}>
          <p className="text-3xl font-semibold tracking-tight text-gray-900">{totalBookings}</p>
          <p className="mt-1 text-xs font-medium text-gray-500">Bookings in period</p>
        </div>
        <div className={`${card} text-center`}>
          <p className="text-3xl font-semibold tracking-tight text-gray-900">
            {totalAmount.toFixed(0)}
          </p>
          <p className="mt-1 text-xs font-medium text-gray-500">THB in period</p>
        </div>
      </div>

      <div className={card}>
        <p className="mb-2 text-sm font-medium text-gray-700">Bookings created per day</p>
        <StatsChart points={points} />
      </div>
    </main>
  );
}
