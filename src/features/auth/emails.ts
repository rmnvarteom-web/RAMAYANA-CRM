import type { Locale } from "@/generated/prisma/enums";

const inviteText: Record<Locale, { subject: string; body: (url: string) => string }> = {
  EN: {
    subject: "You're invited to RAMAYANA CRM",
    body: (url) =>
      `<p>Your agency account has been created. Set your password to get started:</p><p><a href="${url}">${url}</a></p><p>This link expires in 72 hours.</p>`,
  },
  RU: {
    subject: "Приглашение в RAMAYANA CRM",
    body: (url) =>
      `<p>Для вашего агентства создан аккаунт. Задайте пароль, чтобы начать работу:</p><p><a href="${url}">${url}</a></p><p>Ссылка действует 72 часа.</p>`,
  },
  TH: {
    subject: "คำเชิญเข้าใช้งาน RAMAYANA CRM",
    body: (url) =>
      `<p>บัญชีตัวแทนของคุณถูกสร้างแล้ว กรุณาตั้งรหัสผ่านเพื่อเริ่มใช้งาน:</p><p><a href="${url}">${url}</a></p><p>ลิงก์นี้หมดอายุใน 72 ชั่วโมง</p>`,
  },
};

const otpText: Record<Locale, { subject: string; body: (code: string) => string }> = {
  EN: {
    subject: "Your RAMAYANA CRM password reset code",
    body: (code) => `<p>Your one-time code is:</p><h2>${code}</h2><p>It expires in 10 minutes.</p>`,
  },
  RU: {
    subject: "Код для сброса пароля RAMAYANA CRM",
    body: (code) => `<p>Ваш одноразовый код:</p><h2>${code}</h2><p>Он действует 10 минут.</p>`,
  },
  TH: {
    subject: "รหัสรีเซ็ตรหัสผ่าน RAMAYANA CRM",
    body: (code) => `<p>รหัสใช้ครั้งเดียวของคุณ:</p><h2>${code}</h2><p>หมดอายุใน 10 นาที</p>`,
  },
};

export function inviteEmailContent(locale: Locale, url: string) {
  const t = inviteText[locale];
  return { subject: t.subject, html: t.body(url) };
}

export function otpEmailContent(locale: Locale, code: string) {
  const t = otpText[locale];
  return { subject: t.subject, html: t.body(code) };
}
