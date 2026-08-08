import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/features/auth/guards";
import { getPricedItemsForTariffPlan } from "@/features/bookings/pricing";
import { CreateBookingForm } from "@/app/dashboard/bookings/new/CreateBookingForm";

export default async function NewBookingPage() {
  const session = await requireSession();
  if (!session.agencyId) redirect("/dashboard");

  const agency = await db.agency.findUniqueOrThrow({ where: { id: session.agencyId } });
  const items = await getPricedItemsForTariffPlan(agency.tariffPlanId);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-12">
      <h1 className="text-xl font-semibold">New booking</h1>
      <CreateBookingForm items={items} idempotencyKey={randomUUID()} />
    </main>
  );
}
