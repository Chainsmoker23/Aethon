import { FacilityOverview } from "@/components/management/FacilityOverview";
import { ResidentRoster } from "@/components/management/ResidentRoster";
import { ShiftHandover } from "@/components/management/ShiftHandover";
import { AssistanceRequests } from "@/components/management/AssistanceRequests";
import { RefreshCw, Sparkles } from "lucide-react";

export default function ManagementDashboard() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <main className="p-4 md:p-6 lg:p-10 space-y-6 md:space-y-8 max-w-[1200px] mx-auto w-full pb-20 lg:pb-32">
        {/* Header */}
        <div className="hidden md:flex items-start justify-between animate-fade-in-up">
          <div className="w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Facility Intelligence
              </h1>
            </div>
            <div className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-500 dark:text-zinc-400 mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="whitespace-nowrap">{dateStr}</span>
              <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
              <span className="whitespace-nowrap">{timeStr}</span>
              <span className="hidden sm:block mx-1 text-slate-300">|</span>
              <span className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0a0a0a] px-2 py-1 md:px-3 md:py-1.5 rounded-md shadow-sm border border-slate-200 dark:border-zinc-800 shrink-0">
                <RefreshCw className="w-3.5 h-3.5" /> Live Sync Active
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          <FacilityOverview />
          
          <ResidentRoster />

          <div className="grid lg:grid-cols-2 gap-6 md:gap-8 animate-fade-in-up delay-400">
            <AssistanceRequests />
            <ShiftHandover />
          </div>
        </div>
    </main>
  );
}
