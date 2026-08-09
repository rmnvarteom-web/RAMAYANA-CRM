import type { Locale } from "@/generated/prisma/enums";

const rejectedText: Record<Locale, { subject: string; body: (reason: string) => string }> = {
  EN: {
    subject: "Your payment slip was not approved",
    body: (reason) =>
      `<p>Your bank transfer for a recent booking was not approved.</p><p><strong>Reason:</strong> ${reason}</p><p>Please upload a new payment slip from your booking page.</p>`,
  },
  RU: {
    subject: "Квитанция об оплате не подтверждена",
    body: (reason) =>
      `<p>Ваш банковский перевод по недавней брони не был подтверждён.</p><p><strong>Причина:</strong> ${reason}</p><p>Пожалуйста, загрузите новую квитанцию на странице брони.</p>`,
  },
  TH: {
    subject: "สลิปการชำระเงินของคุณไม่ได้รับการอนุมัติ",
    body: (reason) =>
      `<p>การโอนเงินสำหรับการจองล่าสุดของคุณไม่ได้รับการอนุมัติ</p><p><strong>เหตุผล:</strong> ${reason}</p><p>กรุณาอัปโหลดสลิปการชำระเงินใหม่จากหน้าการจองของคุณ</p>`,
  },
};

export function bookingRejectedEmailContent(locale: Locale, reason: string) {
  const t = rejectedText[locale];
  return { subject: t.subject, html: t.body(reason) };
}
