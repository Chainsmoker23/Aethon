import { Users, Eye, AlertTriangle, FileText, Loader2 } from "lucide-react";

export function MobileFacilityOverview({ stats, loading }: { stats: any, loading: boolean }) {
  const displayStats = [
    { label: "Clients", value: stats.totalClients, icon: <Users className="w-4 h-4 text-white" />, gradient: "from-blue-500 to-cyan-400" },
    { label: "Seen Today", value: stats.seenToday, icon: <Eye className="w-4 h-4 text-white" />, gradient: "from-emerald-400 to-teal-500" },
    { label: "Escalations", value: stats.escalations, icon: <AlertTriangle className="w-4 h-4 text-white" />, gradient: "from-rose-500 to-orange-400" },
    { label: "Notes (7d)", value: stats.notesThisWeek, icon: <FileText className="w-4 h-4 text-white" />, gradient: "from-indigo-500 to-purple-500" },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {[1,2,3,4].map((i) => (
           <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 h-24 flex items-center justify-center">
             <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
           </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:hidden relative z-10 w-full">
      {displayStats.map((stat) => (
        <div 
          key={stat.label} 
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-3 flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-6 h-6 rounded-md flex items-center justify-center bg-gradient-to-br ${stat.gradient} shadow-sm text-white shrink-0`}>
              {stat.icon}
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight leading-none">{stat.label}</span>
          </div>
          <p className="text-xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
