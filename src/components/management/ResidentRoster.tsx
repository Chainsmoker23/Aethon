"use client";

import { ChevronDown, ChevronRight, Loader2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { MobileResidentRoster } from "./MobileResidentRoster";

type Resident = {
  id: string;
  name: string;
  careStage: string;
  lastVisit: string;
  seenToday: boolean;
  escalations: number;
  notes7d: number;
  recentVisits: { date: string; type: string; tasks: string }[];
};

function getRowBg(r: Resident): string {
  if (r.escalations > 0) return "bg-danger-light/40 border-l-[6px] border-danger";
  const hour = new Date().getHours();
  if (!r.seenToday && hour >= 14) return "bg-warning-light/40 border-l-[6px] border-warning";
  return "border-l-[6px] border-transparent";
}

function CareStageTag({ stage }: { stage: string }) {
  const styles: Record<string, string> = {
    "Independent": "bg-primary-light text-primary-dark border-primary/20",
    "Home care": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "Facility": "bg-navy/10 text-navy dark:text-zinc-100 border-navy/20",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${styles[stage] || "bg-surface-alt text-text-muted dark:text-zinc-500 border-border"}`}>
      {stage}
    </span>
  );
}

export function ResidentRoster() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // Fetch residents + nested notes + nested escalations
      const { data, error } = await supabase.from('residents').select(`
        id, first_name, last_name, care_stage,
        visit_notes ( visit_type, tasks_completed, created_at ),
        escalations ( is_resolved )
      `);
      
      if (data) {
        const formatted = data.map((r: any) => {
          const notes = (r.visit_notes || []).filter((n: any) => !n.visit_type?.toLowerCase().startsWith('handover'));
          const activeEscalations = (r.escalations || []).filter((e: any) => !e.is_resolved).length;
          
          // Sort notes newest first
          notes.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          const lastNote = notes[0];
          const seenToday = lastNote ? new Date(lastNote.created_at).toDateString() === new Date().toDateString() : false;
          
          const recentVisits = notes.slice(0, 3).map((n: any) => ({
            date: new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            type: n.visit_type,
            tasks: n.tasks_completed || '—'
          }));

          return {
            id: r.id,
            name: `${r.first_name} ${r.last_name}`,
            careStage: r.care_stage,
            lastVisit: lastNote ? new Date(lastNote.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never',
            seenToday,
            escalations: activeEscalations,
            notes7d: notes.length,
            recentVisits
          };
        });
        
        setResidents(formatted);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="glass-panel-heavy rounded-3xl h-64 flex items-center justify-center relative z-10">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden relative z-10">
      <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/50">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Active Residents</h2>
      </div>

      {/* Desktop Table Header */}
      <div className="hidden md:grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_40px] bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-slate-500 dark:text-zinc-400 text-xs font-medium uppercase tracking-wider px-4">
        <div className="px-4 py-3">Client</div>
        <div className="px-3 py-3">Care stage</div>
        <div className="px-3 py-3">Last visit</div>
        <div className="px-3 py-3 text-center">Seen today</div>
        <div className="px-3 py-3 text-center">Escalations</div>
        <div className="px-3 py-3 text-center">Notes (7d)</div>
        <div className="px-3 py-3"></div>
      </div>

      <MobileResidentRoster residents={residents} expandedId={expandedId} setExpandedId={setExpandedId} />

      {/* Desktop Rows */}
      <div className="hidden md:block divide-y divide-slate-100 bg-white dark:bg-[#0a0a0a]">
        {residents.map((r) => {
          const isExpanded = expandedId === r.id;
          return (
            <div key={r.id} className="group">
              
              {/* Desktop Row Wrapper */}
              <div
                className={`grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_40px] items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900 dark:bg-zinc-900/50 dark:hover:bg-slate-800/50 dark:bg-zinc-900/50 transition-colors ${r.escalations > 0 ? "bg-red-50/30" : ""} px-4`}
                onClick={() => setExpandedId(isExpanded ? null : r.id)}
              >
                
                {/* 1. Client Name */}
                <div className="px-4 py-4">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">{r.name}</span>
                </div>

                {/* 2. Care Stage */}
                <div className="px-3 py-4">
                  <CareStageTag stage={r.careStage} />
                </div>

                {/* 3. Last Visit */}
                <div className="px-3 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                  {r.lastVisit}
                </div>

                {/* 4. Seen Today */}
                <div className="px-3 py-4 flex justify-center items-center text-sm">
                  {r.seenToday ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" title="Yes" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" title="No" />
                  )}
                </div>

                {/* 5. Escalations */}
                <div className="px-3 py-4 flex justify-center items-center">
                  {r.escalations > 0 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-semibold shadow-sm">
                      {r.escalations}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-300">—</span>
                  )}
                </div>

                {/* 6. Notes (7d) */}
                <div className="px-3 py-4 flex justify-center items-center text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {r.notes7d}
                </div>

                {/* 7. Desktop Chevron */}
                <div className="px-3 py-4 text-slate-400 flex justify-end">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Expanded Area */}
              {isExpanded && (
                <div className="bg-slate-50 dark:bg-zinc-900/50/80 px-10 py-6 border-t border-slate-100 dark:border-zinc-800/50 shadow-inner">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-4">Recent visits</p>
                  {r.recentVisits.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-500 dark:text-zinc-400 italic bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">No recent visits logged.</p>
                  ) : (
                    <div className="space-y-3">
                      {r.recentVisits.map((v: any, i: number) => (
                        <div key={i} className="flex gap-4 bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm max-w-3xl">
                          <div className="flex flex-col items-center mt-1">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            {i !== r.recentVisits.length - 1 && <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-700 mt-2" />}
                          </div>
                          <div>
                            <div className="flex gap-3 items-center mb-1">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded-md">{v.type}</span>
                              <span className="text-xs font-medium text-slate-400">{v.date}</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{v.tasks}</p>
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
    </div>
  );
}
