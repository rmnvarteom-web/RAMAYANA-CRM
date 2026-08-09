import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/features/auth/guards";
import { formatBangkokDate } from "@/lib/timezone";
import { StatusBadge } from "@/components/StatusBadge";
import { BackLink } from "@/components/BackLink";
import { pageShell, card, buttonPrimary } from "@/lib/ui";

export default async function BookingsPage() {
  const session = await requireSession();
  if (!session.agencyId) redirect("/dashboard");

  const bookings = await db.booking.findMany({
    where: { agencyId: session.agencyId },
    include: { invoices: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className={pageShell}>
      <BackLink href="/dashboard">Dashboard</BackLink>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Bookings</h1>
        <Link href="/dashboard/bookings/new" className={buttonPrimary}>
          + New booking
        </Link>
      </div>

      <ul className="flex flex-col gap-3">
        {bookings.map((booking) => (
          <li key={booking.id} className={`${card} transition-shadow hover:shadow-md`}>
            <Link href={`/dashboard/bookings/${booking.id}`} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">
                  {formatBangkokDate(booking.visitDate)}
                </p>
                <StatusBadge status={booking.status} />
              </div>
              <p className="text-sm text-gray-500">
                THB {Number(booking.totalAmount).toFixed(2)} · {booking.paymentMethod}
              </p>
            </Link>
            {booking.invoices[0] && (
              <a
                href={`/invoices/${booking.invoices[0].id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Download invoice
              </a>
            )}
          </li>
        ))}
        {bookings.length === 0 && (
          <p className={`${card} text-center text-sm text-gray-500`}>No bookings yet.</p>
        )}
      </ul>
    </main>
  );
}
