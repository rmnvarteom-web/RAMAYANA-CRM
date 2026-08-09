import { ResetPasswordForm } from "@/app/reset-password/ResetPasswordForm";
import { AuthCard } from "@/components/AuthCard";
import { BackLink } from "@/components/BackLink";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthCard title="Enter your reset code" subtitle="Sent to your email">
      <div className="flex flex-col gap-5">
        <ResetPasswordForm email={email ?? ""} />
        <BackLink href="/forgot-password">Reset password</BackLink>
      </div>
    </AuthCard>
  );
}
