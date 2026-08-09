import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { bookingRejectedEmailContent } from "@/features/bookings/emails";

export type ModerationResult = { ok: true } | { ok: false; reason: "wrong_state" };

export async function approveBooking(
  bookingId: string,
  adminUserId: string,
): Promise<ModerationResult> {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { payments: true },
  });
  if (!booking || booking.status !== "PENDING_PAYMENT_REVIEW") {
    return { ok: false, reason: "wrong_state" };
  }

  await db.$transaction([
    db.payment.update({
      where: { id: booking.payments[0].id },
      data: { status: "APPROVED", reviewedById: adminUserId, reviewedAt: new Date() },
    }),
    db.booking.update({ where: { id: booking.id }, data: { status: "CONFIRMED" } }),
  ]);

  return { ok: true };
}

export async function rejectBooking(
  bookingId: string,
  adminUserId: string,
  reason: string,
): Promise<ModerationResult> {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { payments: true, agency: true },
  });
  if (!booking || booking.status !== "PENDING_PAYMENT_REVIEW") {
    return { ok: false, reason: "wrong_state" };
  }

  await db.$transaction([
    db.payment.update({
      where: { id: booking.payments[0].id },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
        reviewedById: adminUserId,
        reviewedAt: new Date(),
      },
    }),
    db.booking.update({ where: { id: booking.id }, data: { status: "REJECTED" } }),
  ]);

  const { subject, html } = bookingRejectedEmailContent(booking.agency.locale, reason);
  await sendEmail({ to: booking.agency.email, subject, html });

  return { ok: true };
}
