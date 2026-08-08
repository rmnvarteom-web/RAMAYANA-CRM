import { ResetPasswordForm } from "@/app/reset-password/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-xl font-semibold">Enter your reset code</h1>
      <ResetPasswordForm email={email ?? ""} />
    </main>
  );
}
