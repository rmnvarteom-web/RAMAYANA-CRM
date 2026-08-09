import { db } from "@/lib/db";
import { getPricedItemsForTariffPlan } from "@/features/bookings/pricing";
import { createInvoiceForBooking } from "@/features/invoices/create-invoice";
import { bangkokToday } from "@/lib/timezone";
import type { CreateBookingInput } from "@/features/bookings/schemas";

export type CreateBookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; reason: "past_date" | "no_items" | "invalid_items" };

// Bank transfer bookings don't need proof up front — an agency can book now
// and attach the slip once they've actually collected payment (later that
// day, or whenever). Every booking gets an invoice immediately regardless
// of payment status; confirming payment is a separate step.
export async function createBooking(
  input: CreateBookingInput,
  context: { agencyId: string; createdById: string },
  proofDataUrl: string | null,
): Promise<CreateBookingResult> {
  if (input.visitDate < bangkokToday()) return { ok: false, reason: "past_date" };

  const selectedLines = input.lines.filter((line) => line.quantity > 0);
  if (selectedLines.length === 0) return { ok: false, reason: "no_items" };

  const agency = await db.agency.findUniqueOrThrow({ where: { id: context.agencyId } });
  const pricedItems = await getPricedItemsForTariffPlan(agency.tariffPlanId);
  const priceById = new Map(pricedItems.map((item) => [item.id, item]));

  const lineData = [];
  for (const line of selectedLines) {
    const item = priceById.get(line.priceItemId);
    if (!item) return { ok: false, reason: "invalid_items" };
    lineData.push({
      priceItemId: item.id,
      quantity: line.quantity,
      unitPriceAtBooking: item.unitPrice,
      lineTotal: item.unitPrice * line.quantity,
    });
  }
  const totalAmount = lineData.reduce((sum, l) => sum + l.lineTotal, 0);

  const isBankTransfer = input.paymentMethod === "BANK_TRANSFER";
  const status = !isBankTransfer
    ? "CONFIRMED"
    : proofDataUrl
      ? "PENDING_PAYMENT_REVIEW"
      : "AWAITING_PAYMENT";

  const booking = await db.booking.create({
    data: {
      agencyId: context.agencyId,
      createdById: context.createdById,
      customerName: input.customerName ?? null,
      visitDate: new Date(input.visitDate),
      status,
      paymentMethod: input.paymentMethod,
      idempotencyKey: input.idempotencyKey,
      totalAmount,
      lines: { create: lineData },
      payments: {
        create: {
          method: input.paymentMethod,
          status: isBankTransfer ? "PENDING_REVIEW" : "APPROVED",
          proofFileUrl: proofDataUrl,
          reportedAmount: isBankTransfer ? null : totalAmount,
        },
      },
    },
  });

  await createInvoiceForBooking(booking.id, context.agencyId);

  return { ok: true, bookingId: booking.id };
}
