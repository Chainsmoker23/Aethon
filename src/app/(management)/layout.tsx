import { Sidebar } from "@/components/ui/Sidebar";
import { SubscriptionGuard } from "@/components/management/SubscriptionGuard";

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-zinc-900/50 overflow-hidden relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pt-12 pb-16 lg:pb-0 lg:pt-0 overflow-y-auto">
        <SubscriptionGuard>
          {children}
        </SubscriptionGuard>
      </div>
    </div>
  );
}
