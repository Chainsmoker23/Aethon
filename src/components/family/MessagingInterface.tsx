"use client";

import { Send, Loader2, MessageSquare, ShieldCheck, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useFamilyResident } from "@/hooks/useFamilyResident";
import Link from "next/link";

export function MessagingInterface() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();
  const { residentId } = useFamilyResident();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!residentId) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('resident_id', residentId)
      .order('created_at', { ascending: true }); // Standard chat order (newest at bottom)
      
    if (data) setMessages(data);
    setLoading(false);
    
    // Auto scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    fetchMessages();

    if (!residentId) return;

    const channel = supabase
      .channel('live-messages-family')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `resident_id=eq.${residentId}` }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [residentId]);

  const handleSend = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!message.trim() || !residentId) return;
    setSent(true);

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('user_profiles').select('facility_id').eq('id', user?.id).single();

    const newMsg = {
      resident_id: residentId,
      sender_id: user?.id,
      sender_role: 'family',
      content: message.trim(),
      facility_id: profile?.facility_id
    };

    const { error: dbError } = await supabase.from('messages').insert([newMsg]);
    
    if (dbError) {
      setError("Failed to send message. Please try again.");
      setTimeout(() => setError(null), 5000);
      setSent(false);
      return;
    }

    setMessage("");
    setSent(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-900/50 relative">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-zinc-800 p-4 pt-6 shrink-0 flex items-center justify-between z-10 sticky top-0 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <Link href="/family" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </Link>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-sky-600 flex items-center justify-center shadow-md shadow-sky-500/20">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-[17px] font-bold text-slate-900 dark:text-white leading-tight tracking-tight">Care Team</h2>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <p className="text-[11px] font-bold text-slate-400">Secure & Encrypted</p>
            </div>
          </div>
        </div>
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/40" />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 flex flex-col pb-[120px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {loading ? (
          <div className="m-auto"><Loader2 className="w-6 h-6 animate-spin text-sky-600/50" /></div>
        ) : messages.length === 0 ? (
          <div className="m-auto text-center space-y-3 p-6 max-w-[280px]">
            <div className="w-14 h-14 bg-white dark:bg-[#0a0a0a] rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100 dark:border-zinc-800/50 transform -rotate-6">
              <MessageSquare className="w-6 h-6 text-sky-600" />
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-white">Start the conversation</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-500 leading-relaxed">Send a message to the facility staff. They usually reply within a few hours.</p>
          </div>
        ) : (
          messages.map((m, idx) => {
            const isFamily = m.sender_role === 'family';
            return (
              <div 
                key={m.id} 
                className={`flex flex-col max-w-[85%] animate-fade-in-up ${isFamily ? 'self-end items-end' : 'self-start items-start'}`}
              >
                {!isFamily && (
                  <span className="text-[10px] font-black text-slate-400 mb-1.5 ml-1 uppercase tracking-wider">Facility Staff</span>
                )}
                <div className={`px-4 py-2.5 text-[15px] font-medium leading-relaxed ${
                  isFamily 
                    ? 'bg-gradient-to-tr from-sky-500 to-sky-600 text-white rounded-[20px] rounded-br-sm shadow-md shadow-sky-500/20' 
                    : 'bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800/60 text-slate-900 dark:text-white rounded-[20px] rounded-bl-sm shadow-sm'
                }`}>
                  {m.content}
                </div>
                <span className={`text-[10px] font-bold text-slate-400 mt-1.5 ${isFamily ? 'mr-1' : 'ml-1'}`}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} className="shrink-0 h-4" />
      </div>

      {/* Input Area (Fixed to bottom, above MobileNav) */}
      <div className="absolute bottom-0 left-0 right-0 p-3 px-4 bg-white dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-slate-200 dark:border-zinc-800/60 shrink-0">
        {error && (
          <div className="mb-2 px-4 py-2 bg-rose-100 border border-rose-200 rounded-xl text-sm font-bold text-rose-500 animate-fade-in flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-rose-500/60 hover:text-rose-500" aria-label="Dismiss error">✕</button>
          </div>
        )}
        <form onSubmit={handleSend} className="relative flex items-end gap-2 bg-slate-100 dark:bg-zinc-900/80 p-1.5 rounded-3xl border border-slate-200 dark:border-zinc-800/80 focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500/30 transition-all">
          <textarea
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            className="w-full bg-transparent pl-4 pr-2 py-2.5 max-h-[120px] min-h-[44px] text-[15px] font-medium focus:outline-none resize-none custom-scrollbar placeholder:text-slate-400 text-slate-900 dark:text-white"
            rows={1}
          />
          <button 
            type="submit"
            disabled={sent || !message.trim()}
            className="shrink-0 w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center hover:bg-sky-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-sky-500/20"
          >
            {sent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
