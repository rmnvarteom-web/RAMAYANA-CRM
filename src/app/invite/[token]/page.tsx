import { InviteForm } from "@/app/invite/[token]/InviteForm";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-xl font-semibold">Welcome to RAMAYANA CRM</h1>
      <p className="text-sm text-black/60">Set a password to activate your agency account.</p>
      <InviteForm token={token} />
    </main>
  );
}
