import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/features/auth/guards";
import { bangkokToday, addDaysToDateString, formatBangkokDate } from "@/lib/timezone";

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
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-12">
      <h1 className="text-xl font-semibold">Daily Booking</h1>

      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/admin/daily-booking?date=${prevDate}&tab=${activeTab.key}`}
          className="text-sm underline"
        >
          ← Previous day
        </Link>
        <form method="get" className="flex items-center gap-2">
          <input type="hidden" name="tab" value={activeTab.key} />
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-black"
          />
          <button type="submit" className="rounded-md bg-black px-3 py-2 text-sm text-white">
            Go
          </button>
        </form>
        <Link
          href={`/admin/daily-booking?date=${nextDate}&tab=${activeTab.key}`}
          className="text-sm underline"
        >
          Next day →
        </Link>
      </div>

      <div className="flex gap-2 border-b border-black/10">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/daily-booking?date=${date}&tab=${tab.key}`}
            className={`px-3 py-2 text-sm ${
              tab.key === activeTab.key
                ? "border-b-2 border-black font-medium"
                : "text-black/60"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <p className="text-sm text-black/60">
        {formatBangkokDate(new Date(date))} · {bookings.length} booking
        {bookings.length === 1 ? "" : "s"} · THB {totalAmount.toFixed(2)}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-black/60">
              <th className="py-2 pr-3">Company</th>
              <th className="py-2 pr-3">Customer</th>
              <th className="py-2 pr-3">Guests</th>
              <th className="py-2 pr-3">POS Code</th>
              <th className="py-2 pr-3">Payment</th>
              <th className="py-2 pr-3 text-right">Total (THB)</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => {
              const guestCount = booking.lines
                .filter((line) => line.priceItem.unit === "PER_PERSON")
                .reduce((sum, line) => sum + line.quantity, 0);

              return (
                <tr key={booking.id} className="border-b border-black/10">
                  <td className="py-2 pr-3">{booking.agency.name}</td>
                  <td className="py-2 pr-3">{booking.customerName ?? "—"}</td>
                  <td className="py-2 pr-3">{guestCount}</td>
                  <td className="py-2 pr-3">{booking.agency.tariffPlan.name}</td>
                  <td className="py-2 pr-3">{booking.paymentMethod}</td>
                  <td className="py-2 pr-3 text-right">
                    {Number(booking.totalAmount).toFixed(2)}
                  </td>
                  <td className="py-2 text-right">
                    {booking.invoices[0] && (
                      <a
                        href={`/invoices/${booking.invoices[0].id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
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
                <td colSpan={7} className="py-4 text-center text-black/60">
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
