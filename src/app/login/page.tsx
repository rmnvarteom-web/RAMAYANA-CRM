import { LoginForm } from "@/app/login/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-xl font-semibold">RAMAYANA CRM — Sign in</h1>
      <LoginForm />
    </main>
  );
}
