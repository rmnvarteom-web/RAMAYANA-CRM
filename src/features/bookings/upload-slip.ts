import { db } from "@/lib/db";

export type UploadSlipResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "wrong_state" };

export async function uploadPaymentSlip(
  bookingId: string,
  agencyId: string,
  proofDataUrl: string,
): Promise<UploadSlipResult> {
  const booking = await db.booking.findFirst({
    where: { id: bookingId, agencyId },
    include: { payments: true },
  });
  if (!booking) return { ok: false, reason: "not_found" };
  if (booking.paymentMethod !== "BANK_TRANSFER") return { ok: false, reason: "wrong_state" };
  if (booking.status !== "AWAITING_PAYMENT" && booking.status !== "REJECTED") {
    return { ok: false, reason: "wrong_state" };
  }

  const payment = booking.payments[0];

  await db.$transaction(
    [
      db.payment.update({
        where: { id: payment.id },
        data: {
          proofFileUrl: proofDataUrl,
          reportedAmount: booking.totalAmount,
          status: "PENDING_REVIEW",
          rejectionReason: null,
          paymentDate: new Date(),
        },
      }),
      db.booking.update({
        where: { id: booking.id },
        data: { status: "PENDING_PAYMENT_REVIEW" },
      }),
    ],
    // Prisma's default 5s interactive-transaction timeout is too tight once
    // the payload includes a multi-MB base64 image — give it real headroom.
    { timeout: 30_000 },
  );

  return { ok: true };
}
