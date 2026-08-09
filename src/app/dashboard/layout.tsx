import { AppHeader } from "@/components/AppHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AppHeader />
      {children}
    </div>
  );
}
