"use client";

import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

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
    "Facility": "bg-navy/10 text-navy border-navy/20",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${styles[stage] || "bg-surface-alt text-text-muted border-border"}`}>
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
          const notes = r.visit_notes || [];
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
    <div className="glass-panel-heavy rounded-3xl overflow-hidden animate-fade-in-up delay-300 relative z-10">
      
      {/* Table header */}
      <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_40px] bg-white/40 backdrop-blur-md border-b border-white/50 text-navy text-xs font-bold uppercase tracking-wider">
        <div className="px-6 py-4">Client</div>
        <div className="px-3 py-4">Care stage</div>
        <div className="px-3 py-4">Last visit</div>
        <div className="px-3 py-4">Seen today</div>
        <div className="px-3 py-4">Escalations</div>
        <div className="px-3 py-4">Notes (7d)</div>
        <div className="px-3 py-4"></div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/40">
        {residents.map((r) => {
          const isExpanded = expandedId === r.id;
          return (
            <div key={r.id} className="group">
              <div
                className={`grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_40px] items-center cursor-pointer row-hover ${getRowBg(r)}`}
                onClick={() => setExpandedId(isExpanded ? null : r.id)}
              >
                <div className="px-6 py-5 font-bold text-base text-navy">{r.name}</div>
                <div className="px-3 py-5 hidden md:block"><CareStageTag stage={r.careStage} /></div>
                <div className="px-3 py-5 text-sm font-semibold text-text-secondary hidden md:block">{r.lastVisit}</div>
                <div className="px-3 py-5 hidden md:block">
                  {r.seenToday ? (
                    <span className="w-3 h-3 rounded-full bg-success inline-block shadow-sm shadow-success/40" title="Yes" />
                  ) : (
                    <span className="w-3 h-3 rounded-full bg-border inline-block" title="No" />
                  )}
                </div>
                <div className="px-3 py-5 hidden md:block">
                  {r.escalations > 0 ? (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-danger text-white text-sm font-bold shadow-sm shadow-danger/40 pulse-dot">
                      {r.escalations}
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-text-muted">—</span>
                  )}
                </div>
                <div className="px-3 py-5 text-sm text-text-secondary font-bold hidden md:block">{r.notes7d}</div>
                <div className="px-3 py-5 text-text-muted">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronRight className="w-5 h-5 group-hover:text-primary transition-colors" />
                  )}
                </div>
              </div>

              {/* Expanded Area */}
              {isExpanded && (
                <div className="bg-white/50 backdrop-blur-md px-10 py-6 border-t border-white/40 animate-fade-in shadow-inner">
                  <p className="text-xs font-extrabold text-navy/60 uppercase tracking-widest mb-4">Recent visits</p>
                  {r.recentVisits.length === 0 ? (
                    <p className="text-sm text-text-muted italic">No recent visits logged.</p>
                  ) : (
                    <div className="space-y-4">
                      {r.recentVisits.map((v, i) => (
                        <div key={i} className="flex items-start gap-6 text-sm">
                          <span className="text-text-secondary w-28 shrink-0 font-bold">{v.date}</span>
                          <span className="text-navy font-bold w-36 shrink-0">{v.type}</span>
                          <span className="text-text-secondary font-medium">{v.tasks}</span>
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
