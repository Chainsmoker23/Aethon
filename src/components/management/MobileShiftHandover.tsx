import { ClipboardList, ChevronRight } from "lucide-react";
import { ReactNode } from "react";

export function MobileShiftHandover({ 
  notes, 
  highlightText, 
  priorityIcons, 
  priorityColors 
}: { 
  notes: any[], 
  highlightText: (t: string) => ReactNode,
  priorityIcons: Record<string, ReactNode>,
  priorityColors: Record<string, string>
}) {
  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden relative z-10 md:hidden flex flex-col h-[400px]">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/50">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
          <ClipboardList className="w-4 h-4 text-indigo-500" /> Smart Handover
        </h2>
      </div>

      <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-500 dark:text-zinc-400 text-xs flex flex-col items-center">
            <ClipboardList className="w-8 h-8 opacity-20 mb-2" />
            <p>No handovers found</p>
          </div>
        ) : (
          notes.map((n, i) => {
            const pType = n.visit_type?.toLowerCase().includes('critical') ? 'critical' : 
                          n.visit_type?.toLowerCase().includes('watch') ? 'watch' : 'general';
            
            return (
              <div key={i} className={`p-3 flex flex-col gap-2 ${priorityColors[pType]}`}>
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    {priorityIcons[pType]}
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      {pType}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold opacity-60">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap pl-5">
                  {highlightText(n.tasks_completed)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
