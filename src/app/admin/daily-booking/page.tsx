import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/features/auth/guards";
import { bangkokToday, addDaysToDateString, formatBangkokDate } from "@/lib/timezone";

function isValidDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export default async function DailyBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  await requireAdmin();

  const { date: rawDate } = await searchParams;
  const date = rawDate && isValidDateString(rawDate) ? rawDate : bangkokToday();
  const prevDate = addDaysToDateString(date, -1);
  const nextDate = addDaysToDateString(date, 1);

  const bookings = await db.booking.findMany({
    where: { visitDate: new Date(date), status: "CONFIRMED" },
    include: {
      agency: true,
      lines: { include: { priceItem: true } },
      invoices: true,
    },
    orderBy: { agency: { name: "asc" } },
  });

  const totalAmount = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-12">
      <h1 className="text-xl font-semibold">Daily Booking</h1>

      <div className="flex items-center justify-between gap-3">
        <Link href={`/admin/daily-booking?date=${prevDate}`} className="text-sm underline">
          ← Previous day
        </Link>
        <form method="get" className="flex items-center gap-2">
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
        <Link href={`/admin/daily-booking?date=${nextDate}`} className="text-sm underline">
          Next day →
        </Link>
      </div>

      <p className="text-sm text-black/60">
        {formatBangkokDate(new Date(date))} · {bookings.length} booking
        {bookings.length === 1 ? "" : "s"} · THB {totalAmount.toFixed(2)}
      </p>

      <ul className="flex flex-col gap-3">
        {bookings.map((booking) => (
          <li key={booking.id} className="rounded-md border border-black/10 p-3">
            <div className="flex items-center justify-between">
              <p className="font-medium">{booking.agency.name}</p>
              <p className="text-sm text-black/60">{booking.paymentMethod}</p>
            </div>
            {booking.customerName && (
              <p className="text-sm text-black/60">{booking.customerName}</p>
            )}
            <ul className="mt-1 text-sm">
              {booking.lines.map((line) => (
                <li key={line.id}>
                  {line.priceItem.nameEn} × {line.quantity}
                </li>
              ))}
            </ul>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-sm font-medium">THB {Number(booking.totalAmount).toFixed(2)}</p>
              {booking.invoices[0] && (
                <a
                  href={`/invoices/${booking.invoices[0].id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline"
                >
                  Voucher
                </a>
              )}
            </div>
          </li>
        ))}
        {bookings.length === 0 && (
          <p className="text-sm text-black/60">No confirmed bookings for this date.</p>
        )}
      </ul>
    </main>
  );
}
