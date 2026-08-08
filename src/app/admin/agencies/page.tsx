import Link from "next/link";
import { db } from "@/lib/db";

export default async function AgenciesPage() {
  const agencies = await db.agency.findMany({
    include: { tariffPlan: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Agencies</h1>
        <Link href="/admin/agencies/new" className="text-sm underline">
          + New agency
        </Link>
      </div>

      <ul className="flex flex-col gap-3">
        {agencies.map((agency) => (
          <li key={agency.id} className="rounded-md border border-black/10 p-3">
            <p className="font-medium">{agency.name}</p>
            <p className="text-sm text-black/60">
              {agency.email} · {agency.tariffPlan.name} · contract ends{" "}
              {agency.contractEnd.toLocaleDateString()}
            </p>
          </li>
        ))}
        {agencies.length === 0 && (
          <p className="text-sm text-black/60">No agencies yet.</p>
        )}
      </ul>
    </main>
  );
}
