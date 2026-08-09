import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/features/auth/guards";
import { formatBangkokDate } from "@/lib/timezone";

const STATUS_LABEL: Record<string, string> = {
  AWAITING_PAYMENT: "Awaiting payment slip",
  PENDING_PAYMENT_REVIEW: "Pending review",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

export default async function BookingsPage() {
  const session = await requireSession();
  if (!session.agencyId) redirect("/dashboard");

  const bookings = await db.booking.findMany({
    where: { agencyId: session.agencyId },
    include: { invoices: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Bookings</h1>
        <Link href="/dashboard/bookings/new" className="text-sm underline">
          + New booking
        </Link>
      </div>

      <ul className="flex flex-col gap-3">
        {bookings.map((booking) => (
          <li key={booking.id} className="rounded-md border border-black/10 p-3">
            <Link href={`/dashboard/bookings/${booking.id}`} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{formatBangkokDate(booking.visitDate)}</p>
                <span className="text-sm">{STATUS_LABEL[booking.status]}</span>
              </div>
              <p className="text-sm text-black/60">
                THB {Number(booking.totalAmount).toFixed(2)} · {booking.paymentMethod}
              </p>
            </Link>
            {booking.invoices[0] && (
              <a
                href={`/invoices/${booking.invoices[0].id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline"
              >
                Download invoice
              </a>
            )}
          </li>
        ))}
        {bookings.length === 0 && (
          <p className="text-sm text-black/60">No bookings yet.</p>
        )}
      </ul>
    </main>
  );
}
