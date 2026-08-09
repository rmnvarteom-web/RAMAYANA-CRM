import Link from "next/link";
import { getSession } from "@/features/auth/session";
import { db } from "@/lib/db";
import { logoutAction } from "@/features/auth/actions";

const linkClass =
  "text-sm text-gray-600 transition-colors hover:text-gray-900 [&.active]:text-blue-600 [&.active]:font-medium";

export async function AppHeader() {
  const session = await getSession();
  if (!session.userId) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: { agency: true },
  });
  if (!user) return null;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-6">
          <Link href="/dashboard" className="text-base font-semibold text-gray-900">
            {user.agency ? user.agency.name : "RAMAYANA CRM"}
          </Link>
          <nav className="flex flex-wrap items-center gap-4">
            {user.agency && (
              <Link href="/dashboard/bookings" className={linkClass}>
                Bookings
              </Link>
            )}
            {user.role === "ADMIN" && (
              <>
                <Link href="/admin/agencies" className={linkClass}>
                  Agencies
                </Link>
                <Link href="/admin/bookings" className={linkClass}>
                  Pending payments
                </Link>
                <Link href="/admin/daily-booking" className={linkClass}>
                  Daily Booking
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-gray-500 sm:inline">{user.email}</span>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-900">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
