import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { generateOtpCode, hashToken } from "@/features/auth/tokens";
import { hashPassword } from "@/features/auth/password";
import { otpEmailContent } from "@/features/auth/emails";

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const MAX_REQUESTS_PER_HOUR = 3;

// Always resolves without revealing whether the email exists, so the
// reset-password form can't be used to enumerate registered agencies.
export async function requestPasswordResetOtp(email: string): Promise<void> {
  const user = await db.user.findUnique({ where: { email }, include: { agency: true } });
  if (!user) return;

  const recentCount = await db.otpCode.count({
    where: {
      userId: user.id,
      purpose: "PASSWORD_RESET",
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (recentCount >= MAX_REQUESTS_PER_HOUR) return;

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await db.otpCode.create({
    data: {
      userId: user.id,
      purpose: "PASSWORD_RESET",
      codeHash: hashToken(code),
      expiresAt,
    },
  });

  const locale = user.agency?.locale ?? "EN";
  const { subject, html } = otpEmailContent(locale, code);
  await sendEmail({ to: user.email, subject, html });
}

export type VerifyOtpResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "expired" | "too_many_attempts" };

export async function resetPasswordWithOtp(
  email: string,
  code: string,
  newPassword: string,
): Promise<VerifyOtpResult> {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return { ok: false, reason: "invalid" };

  const otp = await db.otpCode.findFirst({
    where: { userId: user.id, purpose: "PASSWORD_RESET", consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return { ok: false, reason: "invalid" };
  if (otp.attempts >= MAX_ATTEMPTS) return { ok: false, reason: "too_many_attempts" };
  if (otp.expiresAt < new Date()) return { ok: false, reason: "expired" };

  if (otp.codeHash !== hashToken(code)) {
    await db.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, reason: "invalid" };
  }

  const passwordHash = await hashPassword(newPassword);
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { passwordHash, mustChangePwd: false } }),
    db.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } }),
  ]);

  return { ok: true };
}
