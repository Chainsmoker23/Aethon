"use client";

import { Calendar, Star, Loader2, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useFamilyResident } from "@/hooks/useFamilyResident";

export function UpdatesFeed() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { residentId, residentInfo } = useFamilyResident();

  useEffect(() => {
    async function fetchVisits() {
      if (!residentId) return;
      
      const [notesRes, escRes] = await Promise.all([
        supabase.from('visit_notes').select('*').eq('resident_id', residentId).not('visit_type', 'ilike', 'Handover%'),
        supabase.from('escalations').select('*').eq('resident_id', residentId)
      ]);
      
      const merged = [
        ...(notesRes.data || []).map(n => ({ ...n, type: 'note' })),
        ...(escRes.data || []).map(e => ({ ...e, type: 'escalation' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
       .slice(0, 5);
        
      setVisits(merged);
      setLoading(false);
    }
    fetchVisits();
  }, [residentId]);

  const goals = [
    "Walk to the garden and back each morning",
    "Eat breakfast independently",
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 h-48 flex items-center justify-center">
         <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
      </div>
    );
  }

  const firstName = residentInfo?.first_name || "your loved one";

  return (
    <>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Recent updates</h2>
        <div className="mt-4 space-y-4">
          {visits.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No recent updates logged.</p>
          ) : (
            visits.map((v, i) => (
              <div key={v.id || i} className="flex items-start gap-4 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${v.type === 'escalation' ? 'bg-rose-100' : 'bg-sky-100'}`}>
                  {v.type === 'escalation' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  ) : (
                    <Calendar className="w-4 h-4 text-sky-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {new Date(v.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${v.type === 'escalation' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                      {v.type === 'escalation' ? v.severity || 'Alert' : v.visit_type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {v.type === 'escalation' ? v.reason : (v.tasks_completed || "Routine check completed.")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mt-5">
        <h2 className="text-lg font-bold text-slate-900">What matters to {firstName}</h2>
        <div className="mt-4 space-y-3">
          {goals.map((g, i) => (
            <div key={i} className="flex items-start gap-3">
              <Star className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="currentColor" />
              <p className="text-sm font-medium text-slate-500 leading-relaxed">{g}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
