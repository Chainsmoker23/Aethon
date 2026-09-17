import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";

export function MobileAssistanceRequests({ requests, loading }: { requests: any[], loading: boolean }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 p-4 min-h-[200px] flex items-center justify-center md:hidden">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden relative z-10 md:hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-[#0a0a0a]">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
          <AlertCircle className="w-4 h-4 text-rose-500" /> Open Escalations
        </h2>
        <span className="bg-rose-100 text-rose-700 dark:text-rose-400 py-0.5 px-2 rounded-full text-[10px] font-bold">
          {requests.length} Open
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {requests.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-500 dark:text-zinc-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-50" />
            <p>No active escalations</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="p-3 hover:bg-slate-50 dark:hover:bg-zinc-900 dark:bg-zinc-900/50 dark:hover:bg-slate-800/50 dark:bg-zinc-900/50 transition-colors flex flex-col gap-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col items-start min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-xs line-clamp-1">{req.resident_name}</p>
                  <p className="text-[11px] font-medium text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-1.5 py-0.5 rounded mt-1">{req.issue_type}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded shrink-0">
                  <Clock className="w-3 h-3" /> {req.time_ago}
                </div>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{req.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
