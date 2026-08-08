import { ForgotPasswordForm } from "@/app/forgot-password/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-xl font-semibold">Reset your password</h1>
      <ForgotPasswordForm />
    </main>
  );
}
