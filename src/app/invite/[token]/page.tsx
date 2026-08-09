import { InviteForm } from "@/app/invite/[token]/InviteForm";
import { AuthCard } from "@/components/AuthCard";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <AuthCard title="Welcome to RAMAYANA CRM" subtitle="Set a password to activate your account">
      <InviteForm token={token} />
    </AuthCard>
  );
}
