import { Sidebar } from "@/components/ui/Sidebar";

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pt-12 pb-16 lg:pb-0 lg:pt-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
