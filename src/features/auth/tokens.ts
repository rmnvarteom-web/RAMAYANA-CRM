import { randomBytes, randomInt, createHash } from "crypto";

// Raw token goes in the URL/email; only its hash is stored, so a leaked
// database never reveals a usable invite link or OTP code.
export function generateRawToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function generateOtpCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}
