"use client";

import { AlertTriangle, Check, Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { MobileAssistanceRequests } from "./MobileAssistanceRequests";

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
    fetchEscalations();

    const channel = supabase
      .channel('live-escalations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'escalations' }, (payload) => {
        fetchEscalations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const resolve = async (id: string) => {
    setEscalations(prev => prev.map(e => e.id === id ? { ...e, is_resolved: true } : e));
    await supabase
      .from('escalations')
      .update({ is_resolved: true, resolved_at: new Date().toISOString() })
      .eq('id', id);
  };

  const open = escalations.filter(e => !e.is_resolved);

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm h-64 flex items-center justify-center relative z-10 w-full">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const mobileRequests = escalations
    .filter(e => !e.is_resolved)
    .map(e => {
      const hoursAgo = Math.floor((new Date().getTime() - new Date(e.created_at).getTime()) / (1000 * 60 * 60));
      return {
        id: e.id,
        resident_name: `${e.residents?.first_name || ''} ${e.residents?.last_name || ''}`.trim(),
        issue_type: e.reason,
        description: e.reason,
        time_ago: hoursAgo < 1 ? "Just now" : `${hoursAgo}h ago`
      };
    });

  return (
    <>
      <MobileAssistanceRequests requests={mobileRequests} loading={loading} />

      <div className="hidden md:flex bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden flex-col relative z-10 w-full">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/50">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white text-lg tracking-tight">Open escalations</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-500 mt-0.5">{open.length} require attention</p>
          </div>
          {open.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-semibold w-7 h-7 flex items-center justify-center rounded-full shadow-sm animate-pulse">
              {open.length}
            </span>
          )}
        </div>

        <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[400px]">
          {escalations.map((e) => (
            <div 
              key={e.id} 
              className={`p-6 border-l-[4px] transition-all duration-300 ${
                e.is_resolved 
                  ? "border-emerald-400 bg-slate-50 dark:bg-zinc-900/50 opacity-60" 
                  : "border-red-500 bg-white dark:bg-[#0a0a0a] hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-zinc-900/50"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    e.is_resolved ? "bg-emerald-100" : "bg-red-100 animate-pulse"
                  }`}>
                    {e.is_resolved ? (
                      <Check className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-base ${e.is_resolved ? 'text-slate-500 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                        {e.residents?.first_name} {e.residents?.last_name}
                      </span>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full">
                        Room {e.residents?.room_number}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 font-medium ${e.is_resolved ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {e.reason}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                {!e.is_resolved && (
                  <button 
                    onClick={() => resolve(e.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold hover:bg-emerald-100 transition-colors border border-emerald-200/50"
                  >
                    <Check className="w-4 h-4" /> Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {escalations.length === 0 && (
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                <Check className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-slate-900 dark:text-white font-semibold text-sm">All clear</p>
              <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">No pending escalations right now.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
