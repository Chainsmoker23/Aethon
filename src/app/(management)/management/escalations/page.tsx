"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { AlertTriangle, Search, Check, Clock, Loader2, Filter, Calendar } from "lucide-react";

type EscalationData = {
  id: string;
  reason: string;
  created_at: string;
  is_resolved: boolean;
  resolved_at: string | null;
  residents: {
    first_name: string;
    last_name: string;
    room_number: string | null;
  };
};

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState<EscalationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");
  const [search, setSearch] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function fetchAllEscalations() {
      const { data } = await supabase
        .from('escalations')
        .select(`
          id, reason, created_at, is_resolved, resolved_at,
          residents (first_name, last_name, room_number)
        `)
        .order('created_at', { ascending: false });
        
      if (data) setEscalations(data as unknown as EscalationData[]);
      setLoading(false);
    }
    fetchAllEscalations();
  }, []);

  const filtered = escalations.filter(e => {
    const matchesFilter = 
      filter === "all" ? true :
      filter === "open" ? !e.is_resolved :
      e.is_resolved;
      
    const residentName = `${e.residents?.first_name} ${e.residents?.last_name}`.toLowerCase();
    const matchesSearch = residentName.includes(search.toLowerCase()) || e.reason.toLowerCase().includes(search.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <main className="p-4 md:p-6 lg:p-10 space-y-6 md:space-y-8 max-w-[1200px] mx-auto w-full pb-20 lg:pb-32">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 animate-fade-in-up">
          <div className="hidden md:block">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Escalation Log
              </h1>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center shadow-md">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-500 mt-1">
              Historical record of all alerts and assistance requests.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl shadow-inner border border-slate-200 dark:border-zinc-800">
              <button 
                onClick={() => setFilter("all")}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === "all" ? "bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:text-white"}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter("open")}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === "open" ? "bg-white dark:bg-[#0a0a0a] text-rose-600 shadow-sm" : "text-slate-500 dark:text-slate-500 hover:text-rose-600"}`}
              >
                Open
              </button>
              <button 
                onClick={() => setFilter("resolved")}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === "resolved" ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 shadow-sm" : "text-slate-500 dark:text-slate-500 hover:text-emerald-600"}`}
              >
                Resolved
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-[42px] pl-10 pr-4 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* Escalations List */}
        {loading ? (
          <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-2xl h-96 flex items-center justify-center animate-fade-in-up delay-100 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden animate-fade-in-up delay-100 divide-y divide-slate-100 shadow-sm">
            {filtered.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-zinc-800 shadow-sm">
                  <Check className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">No escalations found</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-500 mt-2">Try adjusting your search or filters.</p>
              </div>
            ) : (
              filtered.map((e, i) => {
                const date = new Date(e.created_at);
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <div key={e.id} className="p-6 md:p-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-zinc-900/50 transition-colors flex flex-col md:flex-row gap-6 md:items-start group">
                    
                    {/* Status Badge */}
                    <div className="shrink-0 pt-1">
                      {e.is_resolved ? (
                        <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                          <Check className="w-5 h-5 text-emerald-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/40 pulse-dot">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                          {e.residents?.first_name} {e.residents?.last_name}
                        </h3>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-zinc-900 px-2 py-1 rounded-md border border-slate-200 dark:border-zinc-800 shadow-sm">
                          Room {e.residents?.room_number || 'N/A'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-3xl">
                        {e.reason}
                      </p>
                    </div>

                    {/* Meta Info */}
                    <div className="shrink-0 flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-2 text-sm border-t border-slate-100 dark:border-zinc-800/50 md:border-t-0 pt-4 md:pt-0">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-500 font-medium">
                        <Calendar className="w-4 h-4" />
                        {isToday ? "Today" : date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-500 font-medium">
                        <Clock className="w-4 h-4" />
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      
                      {e.is_resolved && e.resolved_at && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[11px] uppercase tracking-wider rounded-full">
                          <Check className="w-3 h-3" /> Resolved
                        </div>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}
    </main>
  );
}
