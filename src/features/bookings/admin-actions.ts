"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/features/auth/guards";
import { approveBooking, rejectBooking } from "@/features/bookings/moderation";

export async function approveBookingAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const bookingId = String(formData.get("bookingId") ?? "");

  await approveBooking(bookingId, session.userId);

  redirect("/admin/bookings");
}

export async function rejectBookingAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const bookingId = String(formData.get("bookingId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) redirect("/admin/bookings");

  await rejectBooking(bookingId, session.userId, reason);

  redirect("/admin/bookings");
}
