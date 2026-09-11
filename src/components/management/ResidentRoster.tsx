"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

type Resident = {
  id: string;
  name: string;
  careStage: "Independent" | "Home care" | "Facility";
  lastVisit: string;
  seenToday: boolean;
  escalations: number;
  notes7d: number;
  recentVisits: { date: string; type: string; tasks: string }[];
};

const residents: Resident[] = [
  {
    id: "R101", name: "Eleanor Smith", careStage: "Facility",
    lastVisit: "Today, 10:15", seenToday: true, escalations: 0, notes7d: 5,
    recentVisits: [
      { date: "Today", type: "Morning check", tasks: "Vitals, medication, breakfast" },
      { date: "Yesterday", type: "Evening round", tasks: "Medication, mobility" },
      { date: "Mon", type: "GP visit", tasks: "Blood pressure review" },
    ],
  },
  {
    id: "R102", name: "Robert Johnson", careStage: "Facility",
    lastVisit: "Today, 08:30", seenToday: true, escalations: 1, notes7d: 8,
    recentVisits: [
      { date: "Today", type: "Morning check", tasks: "Vitals, medication" },
      { date: "Yesterday", type: "Escalation", tasks: "Agitation during dinner" },
      { date: "Mon", type: "Physio", tasks: "Walking exercise" },
    ],
  },
  {
    id: "R103", name: "Maria Garcia", careStage: "Home care",
    lastVisit: "Yesterday, 16:00", seenToday: false, escalations: 0, notes7d: 3,
    recentVisits: [
      { date: "Yesterday", type: "Afternoon visit", tasks: "Medication, meal prep" },
      { date: "Mon", type: "Morning visit", tasks: "Vitals, hygiene" },
      { date: "Sat", type: "Weekend check", tasks: "Medication" },
    ],
  },
];

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

  return (
    <div className="glass-panel-heavy rounded-3xl overflow-hidden animate-fade-in-up delay-300 relative z-10">
      
      {/* Table header (Glass styled) */}
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
                  <div className="space-y-4">
                    {r.recentVisits.map((v, i) => (
                      <div key={i} className="flex items-start gap-6 text-sm">
                        <span className="text-text-secondary w-28 shrink-0 font-bold">{v.date}</span>
                        <span className="text-navy font-bold w-36 shrink-0">{v.type}</span>
                        <span className="text-text-secondary font-medium">{v.tasks}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
