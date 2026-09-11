"use client";

import { Send, Check } from "lucide-react";
import { useState } from "react";

export function MessagingInterface() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const recentMessages = [
    { body: "Hello! Just checking in — can you bring more of her favorite tea?", time: "Yesterday, 2:00 PM", status: "Seen" },
    { body: "How was her morning walk today?", time: "Monday, 10:00 AM", status: "Seen" },
    { body: "Please let me know if she needs warmer socks.", time: "Saturday, 3:30 PM", status: "Sent" },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessage("");
    setSent(true);
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
        {recentMessages.map((m, i) => (
          <div key={i} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-surface-alt/50 border border-border/50 hover:bg-surface-alt transition-colors">
            <p className="text-sm font-medium text-text-secondary flex-1 leading-relaxed">{m.body}</p>
            <div className="shrink-0 text-right">
              <p className="text-xs font-semibold text-text-muted">{m.time}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${m.status === "Seen" ? "text-primary" : "text-text-muted"}`}>
                {m.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
