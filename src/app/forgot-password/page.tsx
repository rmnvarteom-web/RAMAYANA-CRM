import { ForgotPasswordForm } from "@/app/forgot-password/ForgotPasswordForm";
import { AuthCard } from "@/components/AuthCard";
import { BackLink } from "@/components/BackLink";

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Reset your password">
      <div className="flex flex-col gap-5">
        <ForgotPasswordForm />
        <BackLink href="/login">Sign in</BackLink>
      </div>
    </AuthCard>
  );
}
