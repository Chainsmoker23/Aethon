"use client";

import { Send, Check, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

export function MessagingInterface() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  const residentId = '11111111-1111-1111-1111-111111111111'; // Eleanor

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('resident_id', residentId)
      .order('created_at', { ascending: false });
      
    if (data) setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();

    // Listen for new messages incoming from staff/facility
    const channel = supabase
      .channel('live-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMsg = {
      resident_id: residentId,
      body: message.trim(),
      is_read: false
    };

    setSent(true);
    setMessage("");

    await supabase.from('messages').insert([newMsg]);
    setTimeout(() => setSent(false), 2000);
  };

  return (
    <div className="bg-surface rounded-2xl p-5 shadow-sm border border-border/50 card-hover">
      <h2 className="text-lg font-bold text-navy">Send a message</h2>

      <form onSubmit={handleSend} className="mt-4 space-y-3">
        <textarea
          placeholder="Write a message to the care team..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-surface-alt border border-border rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none transition-all"
          rows={3}
        />
        <button 
          type="submit"
          className="w-full h-12 bg-primary text-white text-base font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2 btn-press shadow-sm shadow-primary/20"
          disabled={!message.trim()}
        >
          {sent ? (
            <>
              <Check className="w-5 h-5 animate-fade-in" />
              Sent
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send
            </>
          )}
        </button>
      </form>

      {/* Recent messages */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-text-muted italic text-center p-4">No messages sent yet.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-surface-alt/50 border border-border/50 hover:bg-surface-alt transition-colors animate-fade-in-up">
              <p className="text-sm font-medium text-text-secondary flex-1 leading-relaxed">{m.body}</p>
              <div className="shrink-0 text-right">
                <p className="text-[11px] font-bold text-text-muted">
                  {new Date(m.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${m.is_read ? "text-primary" : "text-text-muted"}`}>
                  {m.is_read ? "Seen" : "Sent"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
