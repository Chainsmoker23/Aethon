"use client";

import { AlertTriangle, Check, Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

type Escalation = {
  id: string;
  reason: string;
  created_at: string;
  is_resolved: boolean;
  residents: {
    first_name: string;
    last_name: string;
    room_number: string;
  };
};

export function AssistanceRequests() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchEscalations = async () => {
    const { data } = await supabase
      .from('escalations')
      .select(`
        id, reason, created_at, is_resolved,
        residents (first_name, last_name, room_number)
      `)
      .order('created_at', { ascending: false });
      
    if (data) setEscalations(data as unknown as Escalation[]);
    setLoading(false);
  };

  useEffect(() => {
    // 1. Initial Fetch
    fetchEscalations();

    // 2. Realtime Subscription
    const channel = supabase
      .channel('live-escalations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'escalations' }, (payload) => {
        // Whenever any escalation is added or resolved in the DB, re-fetch the live list
        fetchEscalations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const resolve = async (id: string) => {
    // Optimistic UI update
    setEscalations(prev => prev.map(e => e.id === id ? { ...e, is_resolved: true } : e));
    
    // Database update
    await supabase
      .from('escalations')
      .update({ is_resolved: true, resolved_at: new Date().toISOString() })
      .eq('id', id);
  };

  const open = escalations.filter(e => !e.is_resolved);

  if (loading) {
    return (
      <div className="glass-panel-heavy rounded-3xl h-64 flex items-center justify-center relative z-10">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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

      <div className="divide-y divide-white/40 flex-1 overflow-y-auto max-h-[400px]">
        {escalations.map((e) => (
          <div 
            key={e.id} 
            className={`p-6 border-l-[6px] transition-all duration-300 ${
              e.is_resolved 
                ? "border-success bg-white/30 opacity-70" 
                : "border-danger bg-white/60 hover:bg-white/80"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-lg font-bold text-navy">
                  {e.residents?.first_name} {e.residents?.last_name}
                </p>
                <p className="text-sm font-medium text-text-secondary mt-1.5 leading-relaxed">{e.reason}</p>
                <div className="flex items-center gap-1.5 mt-3">
                  <Clock className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-xs font-bold text-text-muted">
                    Room {e.residents?.room_number || "N/A"} · {new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              {!e.is_resolved ? (
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
