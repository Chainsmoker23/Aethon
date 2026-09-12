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
    <div className="relative min-h-screen flex-1 overflow-hidden bg-slate-50/50 z-0">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] animate-blob-1" />
        <div className="absolute top-[10%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[120px] animate-blob-2" />
        <div className="absolute bottom-[-20%] left-[20%] w-[800px] h-[800px] rounded-full blur-[150px] animate-blob-3" />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full blur-[100px] animate-blob-4" />
      </div>

      <main className="p-6 lg:p-10 space-y-8 overflow-y-auto h-full max-w-[1200px] mx-auto w-full relative z-10">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-extrabold text-navy tracking-tight drop-shadow-sm">
                Escalation Log
              </h1>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center shadow-lg shadow-rose-500/30">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-sm font-semibold text-text-secondary mt-2">
              Historical record of all alerts and assistance requests.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-xl border border-white/80 shadow-sm">
              <button 
                onClick={() => setFilter("all")}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === "all" ? "bg-white text-navy shadow-sm" : "text-text-muted hover:text-navy"}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter("open")}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === "open" ? "bg-white text-danger shadow-sm" : "text-text-muted hover:text-danger"}`}
              >
                Open
              </button>
              <button 
                onClick={() => setFilter("resolved")}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === "resolved" ? "bg-white text-success shadow-sm" : "text-text-muted hover:text-success"}`}
              >
                Resolved
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-[42px] pl-10 pr-4 bg-white/70 backdrop-blur-md border border-white/80 rounded-xl text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Escalations List */}
        {loading ? (
          <div className="glass-panel-heavy rounded-3xl h-96 flex items-center justify-center animate-fade-in-up delay-100">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="glass-panel-heavy rounded-3xl overflow-hidden animate-fade-in-up delay-100 divide-y divide-white/40">
            {filtered.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/80 shadow-sm">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-bold text-navy">No escalations found</h3>
                <p className="text-sm font-medium text-text-secondary mt-2">Try adjusting your search or filters.</p>
              </div>
            ) : (
              filtered.map((e, i) => {
                const date = new Date(e.created_at);
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <div key={e.id} className="p-6 md:p-8 hover:bg-white/40 transition-colors flex flex-col md:flex-row gap-6 md:items-start group">
                    
                    {/* Status Badge */}
                    <div className="shrink-0 pt-1">
                      {e.is_resolved ? (
                        <div className="w-10 h-10 rounded-full bg-success/10 border border-success/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-success" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-danger text-white flex items-center justify-center shadow-lg shadow-danger/40 pulse-dot">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-navy">
                          {e.residents?.first_name} {e.residents?.last_name}
                        </h3>
                        <span className="text-xs font-bold text-text-secondary bg-white/60 px-2 py-1 rounded-md border border-white/80 shadow-sm">
                          Room {e.residents?.room_number || 'N/A'}
                        </span>
                      </div>
                      <p className="text-base text-text-secondary font-medium leading-relaxed max-w-3xl">
                        {e.reason}
                      </p>
                    </div>

                    {/* Meta Info */}
                    <div className="shrink-0 flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-2 text-sm border-t border-white/50 md:border-t-0 pt-4 md:pt-0">
                      <div className="flex items-center gap-2 text-text-secondary font-bold">
                        <Calendar className="w-4 h-4 text-text-muted" />
                        {isToday ? "Today" : date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 text-text-secondary font-bold">
                        <Clock className="w-4 h-4 text-text-muted" />
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      
                      {e.is_resolved && e.resolved_at && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-success-light text-success font-bold text-[11px] uppercase tracking-wider rounded-full">
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
    </div>
  );
}
