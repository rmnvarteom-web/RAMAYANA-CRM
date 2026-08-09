import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/features/auth/guards";
import { formatBangkokDate } from "@/lib/timezone";
import { UploadSlipForm } from "@/app/dashboard/bookings/[id]/UploadSlipForm";
import { StatusBadge } from "@/components/StatusBadge";
import { BackLink } from "@/components/BackLink";
import { pageShell, card } from "@/lib/ui";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      lines: { include: { priceItem: true } },
      payments: true,
      invoices: true,
      agency: true,
    },
  });

  if (!booking) notFound();
  if (session.role !== "ADMIN" && booking.agencyId !== session.agencyId) notFound();

  const payment = booking.payments[0];
  const canUploadSlip =
    booking.paymentMethod === "BANK_TRANSFER" &&
    (booking.status === "AWAITING_PAYMENT" || booking.status === "REJECTED") &&
    session.role !== "ADMIN";

  const backHref = session.role === "ADMIN" ? "/admin/daily-booking" : "/dashboard/bookings";

  return (
    <main className={pageShell}>
      <BackLink href={backHref}>{session.role === "ADMIN" ? "Daily Booking" : "Bookings"}</BackLink>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          {formatBangkokDate(booking.visitDate)}
        </h1>
        <StatusBadge status={booking.status} />
      </div>

      {session.role === "ADMIN" && <p className="text-sm text-gray-500">{booking.agency.name}</p>}

      <div className={card}>
        <ul className="flex flex-col divide-y divide-gray-100 text-sm">
          {booking.lines.map((line) => (
            <li key={line.id} className="flex justify-between py-2 first:pt-0 last:pb-0">
              <span className="text-gray-700">
                {line.priceItem.nameEn} × {line.quantity}
              </span>
              <span className="text-gray-900">THB {Number(line.lineTotal).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-sm text-gray-500">{booking.paymentMethod}</span>
          <span className="text-base font-semibold text-gray-900">
            THB {Number(booking.totalAmount).toFixed(2)}
          </span>
        </div>
      </div>

      {booking.invoices[0] && (
        <a
          href={`/invoices/${booking.invoices[0].id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Download invoice →
        </a>
      )}

      {payment?.rejectionReason && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <span className="font-medium">Rejected:</span> {payment.rejectionReason}
        </p>
      )}

      {payment?.proofFileUrl && (
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-gray-700">Payment slip</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={payment.proofFileUrl}
            alt="Payment slip"
            className="max-w-xs rounded-lg border border-gray-200"
          />
        </div>
      )}

      {canUploadSlip && <UploadSlipForm bookingId={booking.id} />}
    </main>
  );
}
