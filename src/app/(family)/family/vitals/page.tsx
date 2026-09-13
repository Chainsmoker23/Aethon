import { ResidentOverview } from "@/components/family/ResidentOverview";
import { Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function VitalsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-20 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/family" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-4 h-4 text-navy" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-navy tracking-tight">Vitals & Meds</h1>
            <p className="text-sm font-semibold text-text-muted mt-0.5">Live health data tracking</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
          <Activity className="w-5 h-5 text-rose-600" />
        </div>
      </div>
      
      <main className="flex-1 p-6 space-y-6">
        <ResidentOverview />
      </main>
    </div>
  );
}
