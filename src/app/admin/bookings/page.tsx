import { db } from "@/lib/db";
import { requireAdmin } from "@/features/auth/guards";
import { formatBangkokDate } from "@/lib/timezone";
import { approveBookingAction, rejectBookingAction } from "@/features/bookings/admin-actions";
import { BackLink } from "@/components/BackLink";
import { pageShell, card, buttonPrimary, buttonDanger, input as inputClass } from "@/lib/ui";

export default async function AdminBookingsPage() {
  await requireAdmin();

  const bookings = await db.booking.findMany({
    where: { status: "PENDING_PAYMENT_REVIEW" },
    include: { agency: true, payments: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className={pageShell}>
      <BackLink href="/dashboard">Dashboard</BackLink>
      <h1 className="text-2xl font-semibold text-gray-900">Payments pending review</h1>

      <ul className="flex flex-col gap-4">
        {bookings.map((booking) => {
          const payment = booking.payments[0];
          return (
            <li key={booking.id} className={`${card} flex flex-col gap-3`}>
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">{booking.agency.name}</p>
                <p className="text-sm text-gray-500">{formatBangkokDate(booking.visitDate)}</p>
              </div>
              <p className="text-sm text-gray-700">
                THB {Number(booking.totalAmount).toFixed(2)}
              </p>

              {payment?.proofFileUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={payment.proofFileUrl}
                  alt="Payment slip"
                  className="max-w-xs rounded-lg border border-gray-200"
                />
              )}

              <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3">
                <form action={approveBookingAction}>
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <button type="submit" className={buttonPrimary}>
                    Approve
                  </button>
                </form>

                <form action={rejectBookingAction} className="flex flex-1 items-center gap-2">
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <input
                    type="text"
                    name="reason"
                    placeholder="Rejection reason"
                    required
                    className={`${inputClass} flex-1 py-2`}
                  />
                  <button type="submit" className={buttonDanger}>
                    Reject
                  </button>
                </form>
              </div>
            </li>
          );
        })}
        {bookings.length === 0 && (
          <p className={`${card} text-center text-sm text-gray-500`}>Nothing pending review.</p>
        )}
      </ul>
    </main>
  );
}
