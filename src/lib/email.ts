import { Resend } from "resend";
import { env } from "@/lib/env";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// Without a RESEND_API_KEY (local dev before the account exists) we log the
// email instead of sending it, so the rest of the flow stays testable.
export async function sendEmail(input: SendEmailInput): Promise<void> {
  if (!resend) {
    console.log("[email:dev] to=%s subject=%s\n%s", input.to, input.subject, input.html);
    return;
  }

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  if (error) {
    throw new Error(`Failed to send email to ${input.to}: ${error.message}`);
  }
}
