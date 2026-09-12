"use client";

import { Calendar, Star, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useFamilyResident } from "@/hooks/useFamilyResident";

export function UpdatesFeed() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { residentId } = useFamilyResident();

  useEffect(() => {
    async function fetchVisits() {
      if (!residentId) return;
      const { data } = await supabase
        .from('visit_notes')
        .select('*')
        .eq('resident_id', residentId)
        .order('created_at', { ascending: false })
        .limit(4);
        
      if (data) setVisits(data);
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
      <div className="bg-surface rounded-2xl p-5 shadow-sm border border-border/50 border-l-[6px] border-l-primary h-48 flex items-center justify-center">
         <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-surface rounded-2xl p-5 shadow-sm border border-border/50 border-l-[6px] border-l-primary card-hover">
        <h2 className="text-lg font-bold text-navy">Recent visits</h2>
        <div className="mt-4 space-y-4">
          {visits.length === 0 ? (
            <p className="text-sm text-text-muted italic">No recent visits logged.</p>
          ) : (
            visits.map((v, i) => (
              <div key={v.id || i} className="flex items-start gap-4 p-2 rounded-lg hover:bg-surface-alt transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-navy">
                      {new Date(v.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">· {v.visit_type}</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">{v.tasks_completed || "Routine check completed."}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-surface rounded-2xl p-5 shadow-sm border border-border/50 border-l-[6px] border-l-warning card-hover mt-5">
        <h2 className="text-lg font-bold text-navy">What matters to Eleanor</h2>
        <div className="mt-4 space-y-3">
          {goals.map((g, i) => (
            <div key={i} className="flex items-start gap-3">
              <Star className="w-4 h-4 text-warning mt-0.5 shrink-0" fill="currentColor" />
              <p className="text-sm font-medium text-text-secondary leading-relaxed">{g}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
