import { MobileNav } from "@/components/ui/MobileNav";

export default function FamilyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/20 pb-20 md:pb-0">
      {children}
      <MobileNav />
    </div>
  );
}
