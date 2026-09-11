"use client";

import { AlertTriangle, Check, Clock } from "lucide-react";
import { useState } from "react";

type Escalation = {
  id: number;
  client: string;
  room: string;
  reason: string;
  time: string;
  resolved: boolean;
};

export function AssistanceRequests() {
  const [escalations, setEscalations] = useState<Escalation[]>([
    { id: 1, client: "Robert Johnson", room: "112", reason: "Agitation during dinner — needs frequent checks tonight", time: "45 min ago", resolved: false },
    { id: 2, client: "Anna Müller", room: "301", reason: "Elevated blood pressure — monitoring closely", time: "2 hours ago", resolved: false },
  ]);

  const resolve = (id: number) => {
    setEscalations(prev => prev.map(e => e.id === id ? { ...e, resolved: true } : e));
  };

  const open = escalations.filter(e => !e.resolved);

  return (
    <div className="glass-panel-heavy rounded-3xl overflow-hidden flex flex-col relative z-10">
      <div className="px-6 py-5 border-b border-white/50 flex items-center justify-between bg-white/20">
        <div>
          <h2 className="font-bold text-navy text-xl">Open escalations</h2>
          <p className="text-sm font-semibold text-text-secondary mt-0.5">{open.length} require attention</p>
        </div>
        {open.length > 0 && (
          <span className="bg-gradient-to-r from-rose-500 to-orange-400 text-white text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full shadow-lg shadow-rose-500/40 pulse-dot">
            {open.length}
          </span>
        )}
      </div>

      <div className="divide-y divide-white/40 flex-1">
        {escalations.map((e) => (
          <div 
            key={e.id} 
            className={`p-6 border-l-[6px] transition-all duration-300 ${
              e.resolved 
                ? "border-success bg-white/30 opacity-70" 
                : "border-danger bg-white/60 hover:bg-white/80"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-lg font-bold text-navy">{e.client}</p>
                <p className="text-sm font-medium text-text-secondary mt-1.5 leading-relaxed">{e.reason}</p>
                <div className="flex items-center gap-1.5 mt-3">
                  <Clock className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-xs font-bold text-text-muted">Room {e.room} · {e.time}</span>
                </div>
              </div>
              {!e.resolved ? (
                <button
                  onClick={() => resolve(e.id)}
                  className="shrink-0 px-4 py-2 text-sm font-bold bg-white border border-white/80 rounded-xl text-navy hover:bg-success hover:text-white hover:border-success transition-all shadow-sm btn-press"
                >
                  Resolve
                </button>
              ) : (
                <span className="shrink-0 flex items-center gap-1.5 text-sm font-bold text-success animate-fade-in">
                  <Check className="w-5 h-5" /> Resolved
                </span>
              )}
            </div>
          </div>
        ))}
        {open.length === 0 && (
          <div className="p-10 text-center flex flex-col items-center justify-center h-full animate-fade-in">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
              <Check className="w-7 h-7 text-white" />
            </div>
            <p className="text-lg font-bold text-navy">All caught up!</p>
            <p className="text-sm font-medium text-text-secondary mt-1">No open escalations.</p>
          </div>
        )}
      </div>
    </div>
  );
}
