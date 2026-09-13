"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Send, Loader2, MessageSquare, CheckCheck } from "lucide-react";

export function ResidentChat({ residentId }: { residentId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('resident_id', residentId)
      .order('created_at', { ascending: true });
      
    if (data) setMessages(data);
    setLoading(false);
    
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`chat-management-${residentId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `resident_id=eq.${residentId}` 
      }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [residentId]);

  const handleSend = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error: dbError } = await supabase.from('messages').insert([{
      resident_id: residentId,
      sender_id: user?.id,
      sender_role: 'staff',
      content: newMessage.trim()
    }]);

    if (dbError) {
      setError("Failed to send message. Please try again.");
      setTimeout(() => setError(null), 5000);
      console.error(dbError);
    } else {
      setNewMessage("");
    }
    
    setSending(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-2xl border border-border/50 overflow-hidden shadow-inner relative animate-fade-in">
      
      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {loading ? (
          <div className="m-auto"><Loader2 className="w-6 h-6 animate-spin text-primary/50" /></div>
        ) : messages.length === 0 ? (
          <div className="m-auto flex flex-col items-center justify-center text-center max-w-[260px] opacity-70">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-border/50 mb-4 transform -rotate-3">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-base font-bold text-navy">No messages</h3>
            <p className="text-xs font-medium text-text-muted mt-1 leading-relaxed">Start a direct, secure conversation with the family regarding this resident.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isStaff = msg.sender_role === 'staff';
            return (
              <div key={idx} className={`flex flex-col animate-fade-in-up ${isStaff ? 'items-end' : 'items-start'}`}>
                {!isStaff && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-muted mb-1.5 ml-1">Family Member</span>
                )}
                
                <div className={`px-4 py-2.5 text-[15px] font-medium leading-relaxed max-w-[80%] ${
                  isStaff 
                    ? 'bg-navy text-white rounded-2xl rounded-br-sm shadow-sm' 
                    : 'bg-white text-navy border border-slate-200/80 rounded-2xl rounded-bl-sm shadow-sm'
                }`}>
                  {msg.content}
                </div>
                
                <div className={`flex items-center gap-1 mt-1.5 ${isStaff ? 'mr-1' : 'ml-1'}`}>
                  <span className="text-[10px] font-bold text-text-muted">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isStaff && <CheckCheck className="w-3 h-3 text-primary/70" />}
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} className="shrink-0 h-2" />
      </div>

      {/* Embedded Input Area */}
      <div className="p-4 bg-white border-t border-border/50 shrink-0">
        {error && (
          <div className="mb-3 px-4 py-2 bg-danger/10 border border-danger/20 rounded-xl text-sm font-bold text-danger animate-fade-in flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-danger/60 hover:text-danger" aria-label="Dismiss error">✕</button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-end gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 focus-within:bg-white transition-all shadow-sm">
          <textarea
            placeholder="Type a message to the family..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            className="w-full bg-transparent pl-3 pr-2 py-2 max-h-[140px] min-h-[40px] text-[15px] font-medium focus:outline-none resize-none custom-scrollbar text-navy placeholder:text-slate-400"
            rows={1}
          />
          <button 
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="shrink-0 w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
