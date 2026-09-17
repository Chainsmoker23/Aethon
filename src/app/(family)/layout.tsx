import { MobileNav } from "@/components/ui/MobileNav";

export default function FamilyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-slate-100 dark:bg-zinc-900 flex justify-center">
      {/* Mobile App Container Frame */}
      <div className="w-full max-w-[640px] bg-slate-50 dark:bg-zinc-900/50 min-h-[100dvh] relative shadow-2xl overflow-hidden border-x border-slate-200 dark:border-zinc-800/60 flex flex-col z-0">
        
        <div className="flex-1 overflow-y-auto pb-[72px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10">
          {children}
        </div>
        <MobileNav />
      </div>
    </div>
  );
}
