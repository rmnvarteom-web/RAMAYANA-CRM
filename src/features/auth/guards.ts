import { redirect } from "next/navigation";
import { getSession, type SessionData } from "@/features/auth/session";

export async function requireSession(): Promise<SessionData> {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  return session;
}

export async function requireAdmin(): Promise<SessionData> {
  const session = await requireSession();
  if (session.role !== "ADMIN") redirect("/dashboard");
  return session;
}
