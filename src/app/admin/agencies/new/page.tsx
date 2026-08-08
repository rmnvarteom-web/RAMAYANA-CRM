import { db } from "@/lib/db";
import { CreateAgencyForm } from "@/app/admin/agencies/new/CreateAgencyForm";
import { requireAdmin } from "@/features/auth/guards";

export default async function NewAgencyPage() {
  await requireAdmin();

  const tariffPlans = await db.tariffPlan.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-12">
      <h1 className="text-xl font-semibold">New agency</h1>
      <CreateAgencyForm tariffPlans={tariffPlans} />
    </main>
  );
}
