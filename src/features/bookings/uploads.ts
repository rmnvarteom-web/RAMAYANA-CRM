const MAX_FILE_BYTES = 8 * 1024 * 1024;

// Signature bytes, not the filename/extension — a renamed .exe still has to
// pass this check, not just claim to be a JPEG.
const SIGNATURES: { mime: string; bytes: number[] }[] = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
];

export type ValidateProofResult =
  | { ok: true; dataUrl: string }
  | { ok: false; reason: "too_large" | "unsupported_type" | "empty" };

export async function validatePaymentProof(file: File): Promise<ValidateProofResult> {
  if (file.size === 0) return { ok: false, reason: "empty" };
  if (file.size > MAX_FILE_BYTES) return { ok: false, reason: "too_large" };

  const buffer = Buffer.from(await file.arrayBuffer());
  const match = SIGNATURES.find((sig) =>
    sig.bytes.every((byte, i) => buffer[i] === byte),
  );
  if (!match) return { ok: false, reason: "unsupported_type" };

  return { ok: true, dataUrl: `data:${match.mime};base64,${buffer.toString("base64")}` };
}
