import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { generateRawToken, hashToken } from "@/features/auth/tokens";
import { hashPassword } from "@/features/auth/password";
import { inviteEmailContent } from "@/features/auth/emails";
import type { Locale } from "@/generated/prisma/enums";

const INVITE_TTL_HOURS = 72;

export async function createAndSendInvite(userId: string, email: string, locale: Locale) {
  const rawToken = generateRawToken();
  const expiresAt = new Date(Date.now() + INVITE_TTL_HOURS * 60 * 60 * 1000);

  await db.invite.create({
    data: { userId, tokenHash: hashToken(rawToken), expiresAt },
  });

  const url = `${env.APP_URL}/invite/${rawToken}`;
  const { subject, html } = inviteEmailContent(locale, url);
  await sendEmail({ to: email, subject, html });
}

export type AcceptInviteResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "not_found" | "expired" | "used" };

export async function acceptInvite(
  rawToken: string,
  newPassword: string,
): Promise<AcceptInviteResult> {
  const invite = await db.invite.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });

  if (!invite) return { ok: false, reason: "not_found" };
  if (invite.usedAt) return { ok: false, reason: "used" };
  if (invite.expiresAt < new Date()) return { ok: false, reason: "expired" };

  const passwordHash = await hashPassword(newPassword);

  await db.$transaction([
    db.user.update({
      where: { id: invite.userId },
      data: { passwordHash, status: "ACTIVE", mustChangePwd: false },
    }),
    db.invite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { ok: true, userId: invite.userId };
}
