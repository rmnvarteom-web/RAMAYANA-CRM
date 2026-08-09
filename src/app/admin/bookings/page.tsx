import { db } from "@/lib/db";
import { requireAdmin } from "@/features/auth/guards";
import { formatBangkokDate } from "@/lib/timezone";
import { approveBookingAction, rejectBookingAction } from "@/features/bookings/admin-actions";

export default async function AdminBookingsPage() {
  await requireAdmin();

  const bookings = await db.booking.findMany({
    where: { status: "PENDING_PAYMENT_REVIEW" },
    include: { agency: true, payments: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-12">
      <h1 className="text-xl font-semibold">Payments pending review</h1>

      <ul className="flex flex-col gap-4">
        {bookings.map((booking) => {
          const payment = booking.payments[0];
          return (
            <li key={booking.id} className="flex flex-col gap-3 rounded-md border border-black/10 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{booking.agency.name}</p>
                <p className="text-sm text-black/60">{formatBangkokDate(booking.visitDate)}</p>
              </div>
              <p className="text-sm">THB {Number(booking.totalAmount).toFixed(2)}</p>

              {payment?.proofFileUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={payment.proofFileUrl}
                  alt="Payment slip"
                  className="max-w-xs rounded-md border border-black/10"
                />
              )}

              <div className="flex flex-wrap items-center gap-3">
                <form action={approveBookingAction}>
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <button
                    type="submit"
                    className="rounded-md bg-black px-3 py-1.5 text-sm text-white"
                  >
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
                    className="flex-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-black"
                  />
                  <button
                    type="submit"
                    className="rounded-md border border-red-600 px-3 py-1.5 text-sm text-red-600"
                  >
                    Reject
                  </button>
                </form>
              </div>
            </li>
          );
        })}
        {bookings.length === 0 && (
          <p className="text-sm text-black/60">Nothing pending review.</p>
        )}
      </ul>
    </main>
  );
}
