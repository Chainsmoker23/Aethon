"use client";

import { ClipboardList, Plus, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { MobileShiftHandover } from "./MobileShiftHandover";

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
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-64 flex items-center justify-center relative z-10 w-full">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const handovers = notes.map(n => ({
    author: `${n.residents?.first_name || 'Staff'} ${n.residents?.last_name || ''}`.trim(),
    authorInitials: (n.residents?.first_name?.[0] || 'S') + (n.residents?.last_name?.[0] || ''),
    time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    summary: n.tasks_completed
  }));

  return (
    <>
      <MobileShiftHandover handovers={handovers} loading={loading} />

      <div className="hidden md:flex bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-col relative z-10 w-full">
      <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div>
          <h2 className="font-semibold text-slate-900 text-lg tracking-tight">Shift Handover</h2>
          <p className="text-sm font-medium text-slate-500 mt-0.5">Key notes for the next shift</p>
        </div>
        <button 
          onClick={copyAsText}
          className="px-4 py-2 text-sm font-medium bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
        >
          <ClipboardList className="w-4 h-4" />
          Copy as text
        </button>
      </div>

      <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[400px]">
        {notes.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center h-full opacity-60">
            <ClipboardList className="w-10 h-10 text-slate-400 mb-3" />
            <p className="font-medium text-slate-600">No handover notes</p>
          </div>
        ) : (
          notes.map((n, i) => (
            <div key={n.id || i} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-slate-700">
                    {n.residents?.first_name?.[0] || 'N'}{n.residents?.last_name?.[0] || ''}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-900">
                      {n.residents?.first_name} {n.residents?.last_name}
                    </p>
                    <span className="text-xs font-medium text-slate-400 px-2 py-0.5 bg-slate-100 rounded-full">
                      {n.visit_type}
                    </span>
                    {n.is_escalation && (
                      <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                        Escalated
                      </span>
                    )}
                    <span className="text-xs font-medium text-slate-400 ml-auto">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{n.tasks_completed}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-white">
        <form onSubmit={addNote} className="flex gap-2 relative">
          <select 
            value={selectedResident}
            onChange={(e) => setSelectedResident(e.target.value)}
            className="w-1/3 h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none shadow-sm cursor-pointer"
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
    </>
  );
}
