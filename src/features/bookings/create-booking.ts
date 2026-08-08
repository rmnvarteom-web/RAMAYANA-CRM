import { db } from "@/lib/db";
import { getPricedItemsForTariffPlan } from "@/features/bookings/pricing";
import { createInvoiceForBooking } from "@/features/invoices/create-invoice";
import { bangkokToday } from "@/lib/timezone";
import type { CreateBookingInput } from "@/features/bookings/schemas";

export type CreateBookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; reason: "past_date" | "no_items" | "proof_required" | "invalid_items" };

export async function createBooking(
  input: CreateBookingInput,
  context: { agencyId: string; createdById: string },
  proofDataUrl: string | null,
): Promise<CreateBookingResult> {
  if (input.visitDate < bangkokToday()) return { ok: false, reason: "past_date" };

  const selectedLines = input.lines.filter((line) => line.quantity > 0);
  if (selectedLines.length === 0) return { ok: false, reason: "no_items" };

  if (input.paymentMethod === "BANK_TRANSFER" && !proofDataUrl) {
    return { ok: false, reason: "proof_required" };
  }

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

  const isAutoConfirmed = input.paymentMethod !== "BANK_TRANSFER";

  const booking = await db.booking.create({
    data: {
      agencyId: context.agencyId,
      createdById: context.createdById,
      visitDate: new Date(input.visitDate),
      status: isAutoConfirmed ? "CONFIRMED" : "PENDING_PAYMENT_REVIEW",
      paymentMethod: input.paymentMethod,
      idempotencyKey: input.idempotencyKey,
      totalAmount,
      lines: { create: lineData },
      payments: {
        create: {
          method: input.paymentMethod,
          status: isAutoConfirmed ? "APPROVED" : "PENDING_REVIEW",
          proofFileUrl: proofDataUrl,
          reportedAmount: isAutoConfirmed ? totalAmount : null,
        },
      },
    },
  });

  if (isAutoConfirmed) {
    await createInvoiceForBooking(booking.id, context.agencyId);
  }

  return { ok: true, bookingId: booking.id };
}
