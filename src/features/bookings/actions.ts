"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/features/auth/session";
import { createBooking } from "@/features/bookings/create-booking";
import { createBookingSchema } from "@/features/bookings/schemas";
import { validatePaymentProof } from "@/features/bookings/uploads";
import type { ActionState } from "@/features/auth/actions";

const REASON_MESSAGES: Record<string, string> = {
  past_date: "Visit date can't be in the past.",
  no_items: "Add at least one item to the booking.",
  proof_required: "Attach a transfer screenshot for bank transfer payments.",
  invalid_items: "One of the selected items is no longer available.",
  too_large: "Screenshot must be under 8 MB.",
  unsupported_type: "Screenshot must be a JPEG or PNG image.",
  empty: "Attach a transfer screenshot for bank transfer payments.",
};

export async function createBookingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (!session.userId || !session.agencyId) return { error: "Not authorized." };

  const linesRaw = formData.get("lines");
  let lines: { priceItemId: string; quantity: number }[] = [];
  try {
    lines = JSON.parse(String(linesRaw ?? "[]"));
  } catch {
    return { error: "Invalid form submission." };
  }

  const parsed = createBookingSchema.safeParse({
    visitDate: formData.get("visitDate"),
    customerName: formData.get("customerName"),
    paymentMethod: formData.get("paymentMethod"),
    idempotencyKey: formData.get("idempotencyKey"),
    lines,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  let proofDataUrl: string | null = null;
  const proofFile = formData.get("proofFile");
  if (proofFile instanceof File && proofFile.size > 0) {
    const validated = await validatePaymentProof(proofFile);
    if (!validated.ok) return { error: REASON_MESSAGES[validated.reason] };
    proofDataUrl = validated.dataUrl;
  }

  const existing = await db.booking.findUnique({
    where: { idempotencyKey: parsed.data.idempotencyKey },
  });
  if (existing) redirect("/dashboard/bookings");

  const result = await createBooking(
    parsed.data,
    { agencyId: session.agencyId, createdById: session.userId },
    proofDataUrl,
  );
  if (!result.ok) return { error: REASON_MESSAGES[result.reason] };

  redirect("/dashboard/bookings");
}
