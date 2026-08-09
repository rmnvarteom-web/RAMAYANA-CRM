import { db } from "@/lib/db";
import { CreateAgencyForm } from "@/app/admin/agencies/new/CreateAgencyForm";
import { requireAdmin } from "@/features/auth/guards";
import { BackLink } from "@/components/BackLink";
import { pageShell } from "@/lib/ui";

export default async function NewAgencyPage() {
  await requireAdmin();

  const tariffPlans = await db.tariffPlan.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className={`${pageShell} max-w-md`}>
      <BackLink href="/admin/agencies">Agencies</BackLink>
      <h1 className="text-2xl font-semibold text-gray-900">New agency</h1>
      <CreateAgencyForm tariffPlans={tariffPlans} />
    </main>
  );
}
