"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Calendar as CalendarIcon, Check, X, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";

export function UpcomingVisits() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchVisits = async () => {
    setLoading(true);
    // Since RLS is enabled, we just query family_visits and it filters by facility_id automatically!
    const { data } = await supabase
      .from('family_visits')
      .select('*, residents(first_name, last_name, room_number)')
      .gte('scheduled_date', new Date().toISOString().split('T')[0])
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })
      .limit(10);
      
    if (data) setVisits(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVisits();
    
    // Subscribe to realtime changes
    const channel = supabase.channel('family-visits')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'family_visits' }, () => {
        fetchVisits();
      })
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    await supabase.from('family_visits').update({ status }).eq('id', id);
    // Realtime will auto-fetch
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl md:rounded-[32px] p-5 md:p-8 shadow-sm border border-slate-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-4 h-4 md:w-5 md:h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Family Visits</h2>
            <p className="text-xs md:text-sm font-medium text-slate-500">Upcoming scheduled visitation</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
        ) : visits.length === 0 ? (
          <div className="py-6 text-center text-sm font-medium text-slate-500 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
            No upcoming visits scheduled.
          </div>
        ) : (
          visits.map((v) => (
            <div key={v.id} className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {v.residents?.first_name} {v.residents?.last_name}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-white dark:bg-zinc-800 rounded border border-slate-200 dark:border-zinc-700 text-slate-500">
                    Room {v.residents?.room_number || '?'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                  <span>Visitor: <span className="text-slate-700 dark:text-slate-300">{v.visitor_name}</span></span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(v.scheduled_date), 'MMM d')} at {v.scheduled_time.substring(0, 5)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {v.status === 'pending' ? (
                  <>
                    <button onClick={() => handleUpdateStatus(v.id, 'rejected')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors flex items-center gap-1">
                      <X className="w-3 h-3" /> Deny
                    </button>
                    <button onClick={() => handleUpdateStatus(v.id, 'approved')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors flex items-center gap-1">
                      <Check className="w-3 h-3" /> Approve
                    </button>
                  </>
                ) : v.status === 'approved' ? (
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 flex items-center gap-1 border border-emerald-100 dark:border-emerald-900/30">
                    <Check className="w-3 h-3" /> Approved
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 flex items-center gap-1 border border-rose-100 dark:border-rose-900/30">
                    <X className="w-3 h-3" /> Denied
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
