import { LoginForm } from "@/app/login/LoginForm";
import { AuthCard } from "@/components/AuthCard";

export default function LoginPage() {
  return (
    <AuthCard title="RAMAYANA CRM" subtitle="Sign in to your account">
      <LoginForm />
    </AuthCard>
  );
}
