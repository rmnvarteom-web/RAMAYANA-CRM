import { db } from "@/lib/db";
import { verifyPassword } from "@/features/auth/password";
import { createSession } from "@/features/auth/session";

export type LoginResult =
  | { ok: true }
  | { ok: false; reason: "invalid_credentials" | "not_activated" };

export async function login(email: string, password: string): Promise<LoginResult> {
  const user = await db.user.findUnique({ where: { email } });

  if (!user || !user.passwordHash) return { ok: false, reason: "invalid_credentials" };
  if (user.status !== "ACTIVE") return { ok: false, reason: "not_activated" };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { ok: false, reason: "invalid_credentials" };

  await createSession({ userId: user.id, role: user.role, agencyId: user.agencyId });
  return { ok: true };
}
