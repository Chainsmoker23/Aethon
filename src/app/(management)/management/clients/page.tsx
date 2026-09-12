"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Search, MapPin, Activity, UserPlus, Loader2, Sparkles, ChevronRight } from "lucide-react";

type ClientData = {
  id: string;
  first_name: string;
  last_name: string;
  room_number: string | null;
  care_stage: string;
  last_note: { date: string; task: string } | null;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function fetchClients() {
      const { data } = await supabase.from('residents').select(`
        id, first_name, last_name, room_number, care_stage,
        visit_notes ( created_at, tasks_completed )
      `);

      if (data) {
        const formatted = data.map((r: any) => {
          const notes = r.visit_notes || [];
          notes.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          return {
            id: r.id,
            first_name: r.first_name,
            last_name: r.last_name,
            room_number: r.room_number,
            care_stage: r.care_stage,
            last_note: notes.length > 0 ? {
              date: new Date(notes[0].created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
              task: notes[0].tasks_completed
            } : null
          };
        });
        setClients(formatted);
      }
      setLoading(false);
    }
    fetchClients();
  }, []);

  const filteredClients = clients.filter(c => 
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    c.room_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-screen flex-1 overflow-hidden bg-slate-50/50 z-0">
      {/* Siri Aura Background (Consistent with Overview) */}
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
                Client Directory
              </h1>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <UsersIcon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-sm font-semibold text-text-secondary mt-2">
              Manage profiles, medical history, and family access.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search by name or room..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Client Grid */}
        {loading ? (
          <div className="glass-panel-heavy rounded-3xl h-96 flex items-center justify-center animate-fade-in-up delay-100">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in-up delay-100">
            {/* Add New Client Card */}
            <button className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-white/60 transition-all border-dashed border-2 border-primary/30 min-h-[220px] group">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary transition-all">
                <UserPlus className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
              </div>
              <p className="font-bold text-navy">Admit New Client</p>
            </button>

            {/* Render Clients */}
            {filteredClients.map((c, i) => (
              <div key={c.id} className="glass-panel-heavy rounded-3xl p-6 card-hover flex flex-col justify-between min-h-[220px]" style={{animationDelay: `${i * 50}ms`}}>
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/50">
                      <span className="font-black text-indigo-700 text-lg">{c.first_name[0]}{c.last_name[0]}</span>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/60 text-navy border border-white/80 shadow-sm">
                      {c.care_stage}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-navy">{c.first_name} {c.last_name}</h3>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {c.room_number ? `Room ${c.room_number}` : "Outpatient"}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/40">
                  <p className="text-[10px] font-black uppercase tracking-wider text-text-muted mb-1.5">Last recorded note</p>
                  <p className="text-sm font-medium text-navy line-clamp-2 leading-relaxed">
                    {c.last_note ? (
                      <><span className="font-bold text-primary mr-2">{c.last_note.date}</span>{c.last_note.task}</>
                    ) : (
                      <span className="text-text-muted italic">No notes recorded yet.</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Quick inline icon component to avoid adding another lucide import at the top if missed
function UsersIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
