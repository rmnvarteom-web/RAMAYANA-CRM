import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/features/auth/session";
import { db } from "@/lib/db";
import { logoutAction } from "@/features/auth/actions";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const user = await db.user.findUniqueOrThrow({
    where: { id: session.userId },
    include: { agency: true },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {user.agency ? user.agency.name : "RAMAYANA CRM Admin"}
        </h1>
        <form action={logoutAction}>
          <button type="submit" className="text-sm underline">
            Sign out
          </button>
        </form>
      </div>

      <p className="text-black/60">
        Signed in as {user.email} ({user.role}).
      </p>

      <p className="text-sm text-black/60">
        Bookings, statistics, and invoices land here in the next build steps.
      </p>

      {user.role === "ADMIN" && (
        <Link href="/admin/agencies" className="text-sm underline">
          Manage agencies →
        </Link>
      )}
    </main>
  );
}
