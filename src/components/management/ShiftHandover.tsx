"use client";

import { Send, AlertTriangle, CheckCircle2, Copy, Sparkles } from "lucide-react";
import { useState } from "react";

export function ShiftHandover() {
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  const handoverData = {
    carer: "Sarah Johnson",
    shiftStart: "06:00",
    shiftEnd: "14:00",
    clientsSeen: 12,
    notesRecorded: 8,
    escalationsOpen: 1,
    notes: [
      {
        client: "Robert Johnson",
        time: "13:45",
        text: "Agitated during dinner. Required additional support. Recommend frequent checks tonight.",
        isEscalation: true,
      },
      {
        client: "Eleanor Smith",
        time: "10:30",
        text: "Good morning. Medication taken. Walked in the garden for 15 minutes.",
        isEscalation: false,
      },
    ],
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel-heavy rounded-3xl overflow-hidden flex flex-col relative z-10">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/50 bg-white/20">
        <h2 className="text-xl font-bold text-navy flex items-center gap-2">
          Shift Handover
          <Sparkles className="w-4 h-4 text-indigo-500" />
        </h2>
        <p className="text-sm font-semibold text-text-secondary mt-1">
          {handoverData.carer} · {handoverData.shiftStart} – {handoverData.shiftEnd}
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 border-b border-white/50 bg-white/30 backdrop-blur-md">
        <div className="p-4 text-center border-r border-white/50">
          <p className="text-3xl font-black text-navy">{handoverData.clientsSeen}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mt-1">Clients Seen</p>
        </div>
        <div className="p-4 text-center border-r border-white/50">
          <p className="text-3xl font-black text-navy">{handoverData.notesRecorded}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mt-1">Notes</p>
        </div>
        <div className="p-4 text-center">
          <p className={`text-3xl font-black ${handoverData.escalationsOpen > 0 ? "text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400" : "text-primary"}`}>
            {handoverData.escalationsOpen}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mt-1">Escalations</p>
        </div>
      </div>

      {/* Notes */}
      <div className="p-6 space-y-4 flex-1 bg-white/40">
        {handoverData.notes.map((n, i) => (
          <div 
            key={i} 
            className={`p-5 rounded-2xl text-sm leading-relaxed ${
              n.isEscalation 
                ? "bg-rose-50/80 border border-rose-200 shadow-sm shadow-rose-100/50" 
                : "bg-white/80 border border-white shadow-sm shadow-black/5"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              {n.isEscalation ? (
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              )}
              <span className="font-bold text-base text-navy">{n.client}</span>
              <span className="text-xs font-bold text-text-muted ml-auto bg-white/50 px-2 py-1 rounded-md">{n.time}</span>
            </div>
            <p className="text-text-secondary font-medium">{n.text}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-white/50 bg-white/30 backdrop-blur-md space-y-4">
        <button 
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-navy bg-white/80 border border-white rounded-xl hover:bg-white transition-colors shadow-sm btn-press"
        >
          {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
          {copied ? "Copied to clipboard" : "Copy as text"}
        </button>
        <form 
          className="flex gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (note.trim()) setNote("");
          }}
        >
          <textarea
            placeholder="Add a note for the next shift..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="flex-1 bg-white/80 border border-white p-4 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none shadow-sm transition-all"
            rows={2}
          />
          <button 
            type="submit"
            className="self-end p-4 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/30 btn-press disabled:opacity-40"
            disabled={!note.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-xs text-text-muted italic text-center font-bold">
          Care coordination summary. Not an official medical record.
        </p>
      </div>
    </div>
  );
}
