import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/features/auth/guards";
import { getPricedItemsForTariffPlan } from "@/features/bookings/pricing";
import { CreateBookingForm } from "@/app/dashboard/bookings/new/CreateBookingForm";
import { BackLink } from "@/components/BackLink";
import { pageShell } from "@/lib/ui";

export default async function NewBookingPage() {
  const session = await requireSession();
  if (!session.agencyId) redirect("/dashboard");

  const agency = await db.agency.findUniqueOrThrow({ where: { id: session.agencyId } });
  const items = await getPricedItemsForTariffPlan(agency.tariffPlanId);

  return (
    <main className={`${pageShell} max-w-md`}>
      <BackLink href="/dashboard/bookings">Bookings</BackLink>
      <h1 className="text-2xl font-semibold text-gray-900">New booking</h1>
      <CreateBookingForm items={items} idempotencyKey={randomUUID()} />
    </main>
  );
}
