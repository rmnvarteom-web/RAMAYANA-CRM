import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/features/auth/guards";
import { bangkokToday, addDaysToDateString, formatBangkokDate } from "@/lib/timezone";
import { BackLink } from "@/components/BackLink";
import { pageShell, card, input as inputClass, buttonSecondary } from "@/lib/ui";

function isValidDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

const TABS = [
  { key: "confirmed", label: "Confirmed", status: "CONFIRMED" as const },
  { key: "cancelled", label: "Cancelled", status: "CANCELLED" as const },
];

export default async function DailyBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; tab?: string }>;
}) {
  await requireAdmin();

  const { date: rawDate, tab: rawTab } = await searchParams;
  const date = rawDate && isValidDateString(rawDate) ? rawDate : bangkokToday();
  const prevDate = addDaysToDateString(date, -1);
  const nextDate = addDaysToDateString(date, 1);
  const activeTab = TABS.find((t) => t.key === rawTab) ?? TABS[0];

  const bookings = await db.booking.findMany({
    where: { visitDate: new Date(date), status: activeTab.status },
    include: {
      agency: { include: { tariffPlan: true } },
      lines: { include: { priceItem: true } },
      invoices: true,
    },
    orderBy: { agency: { name: "asc" } },
  });

  const totalAmount = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);

  return (
    <main className={`${pageShell} max-w-5xl`}>
      <BackLink href="/dashboard">Dashboard</BackLink>
      <h1 className="text-2xl font-semibold text-gray-900">Daily Booking</h1>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/admin/daily-booking?date=${prevDate}&tab=${activeTab.key}`}
          className={buttonSecondary}
        >
          ← Previous day
        </Link>
        <form method="get" className="flex items-center gap-2">
          <input type="hidden" name="tab" value={activeTab.key} />
          <input type="date" name="date" defaultValue={date} className={inputClass} />
          <button type="submit" className={buttonSecondary}>
            Go
          </button>
        </form>
        <Link
          href={`/admin/daily-booking?date=${nextDate}&tab=${activeTab.key}`}
          className={buttonSecondary}
        >
          Next day →
        </Link>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/daily-booking?date=${date}&tab=${tab.key}`}
            className={`-mb-px border-b-2 px-3 py-2 text-sm transition-colors ${
              tab.key === activeTab.key
                ? "border-blue-600 font-medium text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <p className="text-sm text-gray-500">
        {formatBangkokDate(new Date(date))} · {bookings.length} booking
        {bookings.length === 1 ? "" : "s"} · THB {totalAmount.toFixed(2)}
      </p>

      <div className={`${card} overflow-x-auto p-0`}>
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Guests</th>
              <th className="px-4 py-3 font-medium">POS Code</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 text-right font-medium">Total (THB)</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map((booking) => {
              const guestCount = booking.lines
                .filter((line) => line.priceItem.unit === "PER_PERSON")
                .reduce((sum, line) => sum + line.quantity, 0);

              return (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/bookings/${booking.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {booking.agency.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{booking.customerName ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{guestCount}</td>
                  <td className="px-4 py-3 text-gray-700">{booking.agency.tariffPlan.name}</td>
                  <td className="px-4 py-3 text-gray-700">{booking.paymentMethod}</td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {Number(booking.totalAmount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {booking.invoices[0] && (
                      <a
                        href={`/invoices/${booking.invoices[0].id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-700"
                      >
                        Voucher
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No {activeTab.label.toLowerCase()} bookings for this date.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
