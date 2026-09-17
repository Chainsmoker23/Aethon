"use client";

import { ClipboardList, Send, Loader2, AlertCircle, Eye, Info } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { MobileShiftHandover } from "./MobileShiftHandover";

export function ShiftHandover() {
  const [notes, setNotes] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [priority, setPriority] = useState<'general' | 'watch' | 'critical'>('general');
  
  // Mentions logic
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const supabase = createClient();

  const fetchHandover = async () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Fallback to visit_notes table for MVP
    const { data } = await supabase
      .from('visit_notes')
      .select(`
        id, visit_type, tasks_completed, created_at, is_escalation,
        residents(first_name, last_name)
      `)
      .in('visit_type', ['Handover - General', 'Handover - Watch', 'Handover - Critical', 'Handover Note'])
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });
      
    if (data) setNotes(data);
    setLoading(false);
  };

  useEffect(() => {
    async function loadData() {
      const { data: resData } = await supabase.from('residents').select('id, first_name, last_name').order('first_name');
      if (resData) setResidents(resData);
      await fetchHandover();
    }
    loadData();

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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewNote(val);
    
    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    const words = textBeforeCursor.split(/\s/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      setMentionQuery(lastWord.slice(1).toLowerCase());
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (firstName: string, lastName: string) => {
    if (!textareaRef.current) return;
    const cursor = textareaRef.current.selectionStart;
    const textBefore = newNote.slice(0, cursor);
    const textAfter = newNote.slice(cursor);
    
    const words = textBefore.split(/\s/);
    words.pop();
    const newTextBefore = words.length > 0 ? words.join(' ') + ' ' : '';
    
    const mention = `@${firstName}${lastName} `;
    
    setNewNote(newTextBefore + mention + textAfter);
    setMentionQuery(null);
    textareaRef.current.focus();
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    // General shift handovers shouldn't be tied to a specific resident record
    const note = {
      resident_id: null,
      visit_type: `Handover - ${priority.charAt(0).toUpperCase() + priority.slice(1)}`,
      tasks_completed: newNote,
      is_escalation: priority === 'critical'
    };

    setNewNote("");
    setPriority('general');
    await supabase.from('visit_notes').insert([note]);
  };

  const highlightText = (text: string) => {
    return text.split(/(\s+)/).map((word, i) => {
      if (word.startsWith('@') && word.length > 1) {
        return <span key={i} className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold text-xs">{word}</span>;
      }
      return word;
    });
  };

  const priorityColors = {
    critical: 'bg-red-50 text-red-700 border-red-200',
    watch: 'bg-amber-50 text-amber-700 border-amber-200',
    general: 'bg-slate-50 dark:bg-zinc-900/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-zinc-800'
  };
  
  const priorityIcons = {
    critical: <AlertCircle className="w-4 h-4 text-red-600" />,
    watch: <Eye className="w-4 h-4 text-amber-600" />,
    general: <Info className="w-4 h-4 text-slate-500 dark:text-slate-500 dark:text-zinc-400" />
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm h-64 flex items-center justify-center w-full relative z-10">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const filteredResidents = mentionQuery !== null 
    ? residents.filter(r => (r.first_name + ' ' + r.last_name).toLowerCase().includes(mentionQuery))
    : [];

  return (
    <>
      <MobileShiftHandover notes={notes} highlightText={highlightText} priorityIcons={priorityIcons} priorityColors={priorityColors} />

      <div className="hidden md:flex flex-col h-[500px] bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden relative z-10 w-full">
        
        <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Smart Handover</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-zinc-400 font-medium">Type @ to mention residents</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-zinc-900/50/30">
          {notes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
              <ClipboardList className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-xs font-medium">No notes for this shift</p>
            </div>
          ) : (
            notes.map((n, i) => {
              const pType = n.visit_type?.toLowerCase().includes('critical') ? 'critical' : 
                            n.visit_type?.toLowerCase().includes('watch') ? 'watch' : 'general';
                            
              return (
                <div key={i} className={`p-3 rounded-xl border shadow-sm flex flex-col gap-2 transition-all hover:shadow-md ${priorityColors[pType as keyof typeof priorityColors]}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {priorityIcons[pType as keyof typeof priorityIcons]}
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                        {pType}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold opacity-60">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                    {highlightText(n.tasks_completed)}
                  </p>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 bg-white dark:bg-[#0a0a0a] border-t border-slate-200 dark:border-zinc-800 relative">
          
          {mentionQuery !== null && (
            <div className="absolute bottom-full left-4 mb-2 w-64 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="bg-slate-50 dark:bg-zinc-900/50 px-3 py-1.5 border-b border-slate-100 dark:border-zinc-800/50 text-[10px] font-bold text-slate-500 dark:text-slate-500 dark:text-zinc-400 uppercase">
                Mention Resident
              </div>
              <div className="max-h-40 overflow-y-auto p-1">
                {filteredResidents.length === 0 ? (
                  <div className="p-2 text-xs text-slate-400 text-center">No matches found</div>
                ) : (
                  filteredResidents.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => insertMention(r.first_name, r.last_name)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      {r.first_name} {r.last_name}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <form onSubmit={addNote} className="flex flex-col gap-3">
            <textarea
              ref={textareaRef}
              value={newNote}
              onChange={handleTextChange}
              placeholder="Type @ to tag a resident..."
              className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-sm font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:bg-[#0a0a0a] resize-none h-20"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button type="button" onClick={() => setPriority('general')} className={`px-2 md:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${priority === 'general' ? 'bg-slate-800 text-white' : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-700'}`}>
                  <Info className="w-3.5 h-3.5" /> General
                </button>
                <button type="button" onClick={() => setPriority('watch')} className={`px-2 md:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${priority === 'watch' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                  <Eye className="w-3.5 h-3.5" /> Watch
                </button>
                <button type="button" onClick={() => setPriority('critical')} className={`px-2 md:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${priority === 'critical' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                  <AlertCircle className="w-3.5 h-3.5" /> Critical
                </button>
              </div>
              
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-600/20 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
