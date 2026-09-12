"use client";

import { ClipboardList, Plus, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export function ShiftHandover() {
  const [notes, setNotes] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [selectedResident, setSelectedResident] = useState("");
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const supabase = createClient();

  const fetchHandover = async () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const { data } = await supabase
      .from('visit_notes')
      .select(`
        id, visit_type, tasks_completed, created_at, is_escalation,
        residents(first_name, last_name)
      `)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });
      
    if (data) setNotes(data);
    setLoading(false);
  };

  useEffect(() => {
    async function loadData() {
      // 1. Load active residents for the dropdown
      const { data: resData } = await supabase.from('residents').select('id, first_name, last_name').order('first_name');
      if (resData && resData.length > 0) {
        setResidents(resData);
        setSelectedResident(resData[0].id);
      }
      // 2. Load handover notes
      await fetchHandover();
    }
    loadData();

    // Listen for new notes added by other staff members in real-time
    const channel = supabase
      .channel('live-notes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visit_notes' }, () => {
        fetchHandover();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const copyAsText = () => {
    const text = notes.map(n => 
      `[${new Date(n.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}] ${n.residents?.first_name || 'System'}: ${n.tasks_completed}`
    ).join("\n");
    navigator.clipboard.writeText(text);
    alert("Shift handover copied to clipboard!");
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedResident) return;

    const note = {
      resident_id: selectedResident,
      visit_type: 'Handover Note',
      tasks_completed: newNote,
      is_escalation: false
    };

    setNewNote("");
    await supabase.from('visit_notes').insert([note]);
  };

  if (loading) {
    return (
      <div className="glass-panel-heavy rounded-3xl h-96 flex items-center justify-center relative z-10">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="glass-panel-heavy rounded-3xl overflow-hidden flex flex-col relative z-10 h-[500px]">
      <div className="px-6 py-5 border-b border-white/50 flex items-center justify-between bg-white/20">
        <div>
          <h2 className="font-bold text-navy text-xl">Shift Handover</h2>
          <p className="text-sm font-semibold text-text-secondary mt-0.5">Live coordination board</p>
        </div>
        <button 
          onClick={copyAsText}
          className="px-4 py-2 text-sm font-bold bg-white text-navy border border-white/80 rounded-xl hover:bg-surface-alt hover:text-primary transition-colors shadow-sm btn-press flex items-center gap-2"
        >
          <ClipboardList className="w-4 h-4" />
          Copy as text
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/10">
        {notes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
            <Search className="w-10 h-10 text-text-muted mb-3" />
            <p className="text-navy font-bold">No notes yet today.</p>
            <p className="text-sm text-text-secondary">Handover notes and completed tasks will appear here.</p>
          </div>
        ) : (
          notes.map((n, i) => (
            <div key={n.id || i} className="bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/80 animate-fade-in-up" style={{animationDelay: `${i * 50}ms`}}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold text-navy">
                  {n.residents?.first_name} {n.residents?.last_name}
                </span>
                <span className="text-xs font-semibold text-text-muted px-2 py-0.5 bg-surface-alt rounded-full">
                  {n.visit_type}
                </span>
                {n.is_escalation && (
                  <span className="text-xs font-bold text-danger bg-danger-light px-2 py-0.5 rounded-full">
                    Escalated
                  </span>
                )}
                <span className="text-xs font-bold text-text-muted ml-auto">
                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-text-secondary font-medium leading-relaxed">{n.tasks_completed}</p>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-white/50 bg-white/30 backdrop-blur-md">
        <form onSubmit={addNote} className="flex gap-2 relative">
          <select 
            value={selectedResident}
            onChange={(e) => setSelectedResident(e.target.value)}
            className="w-1/3 h-12 px-3 bg-white/70 border border-white/80 rounded-xl text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none shadow-sm cursor-pointer"
            disabled={residents.length === 0}
          >
            {residents.length === 0 ? (
              <option value="">No clients</option>
            ) : (
              residents.map(r => (
                <option key={r.id} value={r.id}>{r.first_name} {r.last_name}</option>
              ))
            )}
          </select>

          <div className="relative flex-1">
            <input 
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Type note..."
              className="w-full h-12 pl-4 pr-12 bg-white/70 border border-white/80 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all shadow-sm"
              disabled={residents.length === 0}
            />
            <button 
              type="submit"
              disabled={!newNote.trim() || residents.length === 0}
              className="absolute right-1 top-1 w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-sm"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
