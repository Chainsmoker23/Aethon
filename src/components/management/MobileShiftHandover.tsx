import { FileText, ChevronRight } from "lucide-react";

export function MobileShiftHandover({ handovers, loading }: { handovers: any[], loading: boolean }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 min-h-[200px] flex items-center justify-center md:hidden">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative z-10 md:hidden">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 tracking-tight">
          <FileText className="w-4 h-4 text-indigo-500" /> Shift Handovers
        </h2>
      </div>

      <div className="divide-y divide-slate-100">
        {handovers.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            <p>No handovers found</p>
          </div>
        ) : (
          handovers.map((h, i) => (
            <div key={i} className="p-3 hover:bg-slate-50 transition-colors flex flex-col gap-2">
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600 shrink-0">
                    {h.authorInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-xs truncate">{h.author}</p>
                    <p className="text-[10px] text-slate-400 truncate">{h.time}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">{h.summary}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
