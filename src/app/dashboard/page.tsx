import Link from "next/link";
import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";
import { getBookingStats } from "@/features/bookings/stats";
import { pageShell, card } from "@/lib/ui";

export default async function DashboardPage() {
  const session = await requireSession();

  const user = await db.user.findUniqueOrThrow({
    where: { id: session.userId },
    include: { agency: true },
  });

  const stats = user.agency ? await getBookingStats(user.agency.id) : null;

  return (
    <main className={pageShell}>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {user.agency ? `Welcome, ${user.agency.name}` : "Admin overview"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Signed in as {user.email} · {user.role}
        </p>
      </div>

      {stats && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard/bookings"
            className={`${card} flex items-center justify-between transition-shadow hover:shadow-md`}
          >
            <div>
              <p className="font-medium text-gray-900">Bookings</p>
              <p className="mt-1 text-sm text-gray-500">{stats.today} today</p>
            </div>
            <span className="text-2xl font-semibold text-gray-900">{stats.last30Days}</span>
          </Link>
          <Link
            href="/dashboard/statistics"
            className={`${card} flex items-center justify-between transition-shadow hover:shadow-md`}
          >
            <div>
              <p className="font-medium text-gray-900">Statistics</p>
              <p className="mt-1 text-sm text-gray-500">Trends over any period</p>
            </div>
            <span aria-hidden className="text-xl text-blue-600">→</span>
          </Link>
        </div>
      )}

      {user.role === "ADMIN" && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/admin/agencies" className={`${card} transition-shadow hover:shadow-md`}>
            <p className="font-medium text-gray-900">Agencies</p>
            <p className="mt-1 text-sm text-gray-500">Create and manage travel agencies</p>
          </Link>
          <Link href="/admin/bookings" className={`${card} transition-shadow hover:shadow-md`}>
            <p className="font-medium text-gray-900">Pending payments</p>
            <p className="mt-1 text-sm text-gray-500">Review bank transfer slips</p>
          </Link>
          <Link
            href="/admin/daily-booking"
            className={`${card} transition-shadow hover:shadow-md`}
          >
            <p className="font-medium text-gray-900">Daily Booking</p>
            <p className="mt-1 text-sm text-gray-500">See who&apos;s arriving on a given day</p>
          </Link>
        </div>
      )}
    </main>
  );
}
