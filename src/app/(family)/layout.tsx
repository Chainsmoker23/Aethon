import { MobileNav } from "@/components/ui/MobileNav";

export default function FamilyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-slate-100 flex justify-center">
      {/* Mobile App Container Frame */}
      <div className="w-full max-w-[640px] bg-slate-50 min-h-[100dvh] relative shadow-2xl overflow-hidden border-x border-slate-200/60 flex flex-col z-0">
        
        {/* Dynamic Siri Aura Background */}
        <div className="absolute top-[-150px] left-[-50px] w-[500px] h-[500px] pointer-events-none z-[-1] opacity-70">
          <div className="siri-aura-orb siri-aura-orb-1 w-full h-full" />
          <div className="siri-aura-orb siri-aura-orb-2 w-full h-full" />
        </div>

        <div className="flex-1 overflow-y-auto pb-[72px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10">
          {children}
        </div>
        <MobileNav />
      </div>
    </div>
  );
}
