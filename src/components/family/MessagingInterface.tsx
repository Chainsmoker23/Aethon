"use client";

import { Send, Loader2, MessageSquare, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useFamilyResident } from "@/hooks/useFamilyResident";

export function MessagingInterface() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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

    const newMsg = {
      resident_id: residentId,
      sender_id: user?.id,
      sender_role: 'family',
      content: message.trim()
    };

    const { error } = await supabase.from('messages').insert([newMsg]);
    
    if (error) {
      alert("Database Error: " + error.message);
      setSent(false);
      return;
    }

    setMessage("");
    setSent(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 relative">
      
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200/60 p-4 pt-6 shrink-0 flex items-center justify-between z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-dark flex items-center justify-center shadow-md shadow-primary/20">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-[17px] font-bold text-navy leading-tight tracking-tight">Care Team</h2>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-success" />
              <p className="text-[11px] font-bold text-text-muted">Secure & Encrypted</p>
            </div>
          </div>
        </div>
        <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse shadow-sm shadow-success/40" />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 flex flex-col pb-[120px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {loading ? (
          <div className="m-auto"><Loader2 className="w-6 h-6 animate-spin text-primary/50" /></div>
        ) : messages.length === 0 ? (
          <div className="m-auto text-center space-y-3 p-6 max-w-[280px]">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100 transform -rotate-6">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <p className="text-base font-bold text-navy">Start the conversation</p>
            <p className="text-xs font-medium text-text-secondary leading-relaxed">Send a message to the facility staff. They usually reply within a few hours.</p>
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
                  <span className="text-[10px] font-black text-text-muted mb-1.5 ml-1 uppercase tracking-wider">Facility Staff</span>
                )}
                <div className={`px-4 py-2.5 text-[15px] font-medium leading-relaxed ${
                  isFamily 
                    ? 'bg-gradient-to-tr from-primary to-primary-dark text-white rounded-[20px] rounded-br-sm shadow-md shadow-primary/20' 
                    : 'bg-white border border-slate-200/60 text-navy rounded-[20px] rounded-bl-sm shadow-sm'
                }`}>
                  {m.content}
                </div>
                <span className={`text-[10px] font-bold text-text-muted mt-1.5 ${isFamily ? 'mr-1' : 'ml-1'}`}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} className="shrink-0 h-4" />
      </div>

      {/* Input Area (Fixed to bottom, above MobileNav) */}
      <div className="absolute bottom-0 left-0 right-0 p-3 px-4 bg-white/80 backdrop-blur-xl border-t border-slate-200/60 shrink-0">
        <form onSubmit={handleSend} className="relative flex items-end gap-2 bg-slate-100/80 p-1.5 rounded-3xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
          <textarea
            placeholder="iMessage..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            className="w-full bg-transparent pl-4 pr-2 py-2.5 max-h-[120px] min-h-[44px] text-[15px] font-medium focus:outline-none resize-none custom-scrollbar placeholder:text-slate-400 text-navy"
            rows={1}
          />
          <button 
            type="submit"
            disabled={sent || !message.trim()}
            className="shrink-0 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/20"
          >
            {sent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
