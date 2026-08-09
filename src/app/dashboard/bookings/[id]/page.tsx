import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/features/auth/guards";
import { formatBangkokDate } from "@/lib/timezone";
import { UploadSlipForm } from "@/app/dashboard/bookings/[id]/UploadSlipForm";

const STATUS_LABEL: Record<string, string> = {
  AWAITING_PAYMENT: "Awaiting payment slip",
  PENDING_PAYMENT_REVIEW: "Pending review",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

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

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{formatBangkokDate(booking.visitDate)}</h1>
        <span className="text-sm">{STATUS_LABEL[booking.status]}</span>
      </div>

      {session.role === "ADMIN" && (
        <p className="text-sm text-black/60">{booking.agency.name}</p>
      )}

      <ul className="flex flex-col gap-1 text-sm">
        {booking.lines.map((line) => (
          <li key={line.id} className="flex justify-between">
            <span>
              {line.priceItem.nameEn} × {line.quantity}
            </span>
            <span>THB {Number(line.lineTotal).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm font-semibold">
        Total: THB {Number(booking.totalAmount).toFixed(2)} · {booking.paymentMethod}
      </p>

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

      {payment?.rejectionReason && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          Rejected: {payment.rejectionReason}
        </p>
      )}

      {payment?.proofFileUrl && (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">Payment slip</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={payment.proofFileUrl}
            alt="Payment slip"
            className="max-w-xs rounded-md border border-black/10"
          />
        </div>
      )}

      {canUploadSlip && <UploadSlipForm bookingId={booking.id} />}
    </main>
  );
}
