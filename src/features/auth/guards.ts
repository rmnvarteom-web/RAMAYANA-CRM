import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession, type SessionData } from "@/features/auth/session";

export async function requireSession(): Promise<SessionData> {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  // The session cookie only proves what was true when it was issued — a
  // deleted or deactivated account must not stay usable until it expires.
  // Server Components can't write cookies, so clearing it happens in the
  // /session-expired route handler instead.
  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user || user.status !== "ACTIVE") {
    redirect("/session-expired");
  }

  return session;
}

export async function requireAdmin(): Promise<SessionData> {
  const session = await requireSession();
  if (session.role !== "ADMIN") redirect("/dashboard");
  return session;
}
