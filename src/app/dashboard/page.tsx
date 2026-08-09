import Link from "next/link";
import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";
import { logoutAction } from "@/features/auth/actions";
import { getBookingStats } from "@/features/bookings/stats";
import { StatsGrid } from "@/app/dashboard/StatsGrid";

export default async function DashboardPage() {
  const session = await requireSession();

  const user = await db.user.findUniqueOrThrow({
    where: { id: session.userId },
    include: { agency: true },
  });

  const stats = user.agency ? await getBookingStats(user.agency.id) : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {user.agency ? user.agency.name : "RAMAYANA CRM Admin"}
        </h1>
        <form action={logoutAction}>
          <button type="submit" className="text-sm underline">
            Sign out
          </button>
        </form>
      </div>

      <p className="text-black/60">
        Signed in as {user.email} ({user.role}).
      </p>

      {stats && (
        <>
          <StatsGrid stats={stats} />
          <Link href="/dashboard/bookings" className="text-sm underline">
            Bookings →
          </Link>
        </>
      )}

      {user.role === "ADMIN" && (
        <>
          <Link href="/admin/agencies" className="text-sm underline">
            Manage agencies →
          </Link>
          <Link href="/admin/bookings" className="text-sm underline">
            Payments pending review →
          </Link>
        </>
      )}
    </main>
  );
}
