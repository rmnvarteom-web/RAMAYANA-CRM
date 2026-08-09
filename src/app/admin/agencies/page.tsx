import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/features/auth/guards";
import { formatBangkokDate } from "@/lib/timezone";
import { BackLink } from "@/components/BackLink";
import { pageShell, card, buttonPrimary } from "@/lib/ui";

export default async function AgenciesPage() {
  await requireAdmin();

  const agencies = await db.agency.findMany({
    include: { tariffPlan: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className={pageShell}>
      <BackLink href="/dashboard">Dashboard</BackLink>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Agencies</h1>
        <Link href="/admin/agencies/new" className={buttonPrimary}>
          + New agency
        </Link>
      </div>

      <ul className="flex flex-col gap-3">
        {agencies.map((agency) => (
          <li key={agency.id} className={card}>
            <p className="font-medium text-gray-900">{agency.name}</p>
            <p className="text-sm text-gray-500">
              {agency.email} · {agency.tariffPlan.name} · contract ends{" "}
              {formatBangkokDate(agency.contractEnd)}
            </p>
          </li>
        ))}
        {agencies.length === 0 && (
          <p className={`${card} text-center text-sm text-gray-500`}>No agencies yet.</p>
        )}
      </ul>
    </main>
  );
}
