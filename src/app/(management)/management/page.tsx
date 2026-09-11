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
    <div className="relative min-h-screen flex-1 overflow-hidden bg-slate-50/50 z-0">
      
      {/* === Elegant Color-Shifting Siri Aura Background === */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Top left - Cyan <-> Indigo */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] animate-blob-1" />
        
        {/* Top right - Indigo <-> Pink */}
        <div className="absolute top-[10%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[120px] animate-blob-2" />
        
        {/* Bottom center - Blue <-> Teal */}
        <div className="absolute bottom-[-20%] left-[20%] w-[800px] h-[800px] rounded-full blur-[150px] animate-blob-3" />
        
        {/* Dynamic center highlight - Teal <-> Violet */}
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full blur-[100px] animate-blob-4" />
      </div>

      <main className="p-6 lg:p-10 space-y-8 overflow-y-auto h-full max-w-[1200px] mx-auto w-full relative z-10">
        
        {/* Header */}
        <div className="flex items-start justify-between animate-fade-in-up">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-extrabold text-navy tracking-tight drop-shadow-sm">
                Facility Intelligence
              </h1>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-sm font-semibold text-text-secondary mt-2 flex items-center gap-3">
              {dateStr}
              <span className="w-1 h-1 rounded-full bg-text-muted" />
              {timeStr}
              <span className="mx-2 text-border">|</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-primary bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white/80">
                <RefreshCw className="w-3.5 h-3.5" /> Live Sync Active
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <FacilityOverview />
          
          <ResidentRoster />

          <div className="grid lg:grid-cols-2 gap-8 animate-fade-in-up delay-400">
            <AssistanceRequests />
            <ShiftHandover />
          </div>
        </div>
      </main>
    </div>
  );
}
