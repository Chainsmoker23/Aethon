import { ChevronDown, ChevronRight, AlertTriangle, Activity } from "lucide-react";

export function MobileResidentRoster({ residents, expandedId, setExpandedId }: { residents: any[], expandedId: string | null, setExpandedId: (id: string | null) => void }) {
  return (
    <div className="divide-y divide-slate-100 bg-white dark:bg-[#0a0a0a] md:hidden">
      {residents.map((r) => {
        const isExpanded = expandedId === r.id;
        return (
          <div key={r.id} className="group">
            <div
              className={`flex flex-col gap-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900 dark:bg-zinc-900/50 dark:hover:bg-slate-800/50 dark:bg-zinc-900/50 transition-colors p-3 ${r.escalations > 0 ? "bg-red-50 dark:bg-red-900/30/30 border-l-[4px] border-red-500" : "border-l-[4px] border-transparent"}`}
              onClick={() => setExpandedId(isExpanded ? null : r.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight flex-1 line-clamp-1">{r.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    r.careStage === "Independent" ? "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-slate-400" :
                    r.careStage === "Home care" ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600" : "bg-blue-50 dark:bg-blue-900/30 text-blue-600"
                  }`}>
                    {r.careStage}
                  </span>
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-primary" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${r.seenToday ? "bg-emerald-500" : "bg-slate-300"}`} />
                  {r.lastVisit}
                </div>
                {r.escalations > 0 && (
                  <div className="flex items-center gap-1 text-red-600 font-semibold bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                    <AlertTriangle className="w-3 h-3" /> {r.escalations}
                  </div>
                )}
                <div className="flex items-center gap-1 text-slate-400">
                  <Activity className="w-3 h-3" /> {r.notes7d} notes
                </div>
              </div>
            </div>

            {/* Expanded Area */}
            {isExpanded && (
              <div className="bg-slate-50 dark:bg-zinc-900/80 px-4 py-4 border-t border-slate-100 dark:border-zinc-800/50 shadow-inner">
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Recent visits</p>
                {r.recentVisits.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-500 dark:text-zinc-400 italic bg-white dark:bg-[#0a0a0a] p-3 rounded-lg border border-slate-200 dark:border-zinc-800">No recent visits logged.</p>
                ) : (
                  <div className="space-y-2">
                    {r.recentVisits.map((v: any, i: number) => (
                      <div key={i} className="flex gap-3 bg-white dark:bg-[#0a0a0a] p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex flex-col items-center mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {i !== r.recentVisits.length - 1 && <div className="w-px h-full bg-slate-200 dark:bg-slate-700 mt-1" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">{v.type}</span>
                            <span className="text-[10px] font-medium text-slate-400">{v.date}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">{v.tasks}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
