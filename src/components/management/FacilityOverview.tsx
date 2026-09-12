"use client";

import { Users, Eye, AlertTriangle, FileText, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export function FacilityOverview() {
  const [stats, setStats] = useState({
    totalClients: 0,
    seenToday: 0,
    escalations: 0,
    notesThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      // Fetch residents with notes and escalations
      const { data } = await supabase.from('residents').select(`
        id,
        visit_notes ( created_at ),
        escalations ( is_resolved )
      `);
      
      if (data) {
        let seenToday = 0;
        let activeEscalations = 0;
        let notesThisWeek = 0;
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        data.forEach((r: any) => {
          // Check escalations
          const openEscalations = (r.escalations || []).filter((e: any) => !e.is_resolved).length;
          activeEscalations += openEscalations;

          // Check notes
          const notes = r.visit_notes || [];
          let residentSeenToday = false;
          
          notes.forEach((n: any) => {
            const noteDate = new Date(n.created_at);
            if (noteDate.toDateString() === new Date().toDateString()) residentSeenToday = true;
            if (noteDate >= oneWeekAgo) notesThisWeek++;
          });

          if (residentSeenToday) seenToday++;
        });

        setStats({
          totalClients: data.length,
          seenToday,
          escalations: activeEscalations,
          notesThisWeek
        });
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const displayStats = [
    { label: "Total clients", value: stats.totalClients, icon: <Users className="w-5 h-5 text-white" />, gradient: "from-blue-500 to-cyan-400", shadow: "shadow-cyan-500/30", delay: "delay-100" },
    { label: "Seen today", value: stats.seenToday, icon: <Eye className="w-5 h-5 text-white" />, gradient: "from-emerald-400 to-teal-500", shadow: "shadow-emerald-500/30", delay: "delay-200" },
    { label: "Open escalations", value: stats.escalations, icon: <AlertTriangle className="w-5 h-5 text-white" />, gradient: "from-rose-500 to-orange-400", shadow: "shadow-rose-500/30", delay: "delay-300" },
    { label: "Notes this week", value: stats.notesThisWeek, icon: <FileText className="w-5 h-5 text-white" />, gradient: "from-indigo-500 to-purple-500", shadow: "shadow-indigo-500/30", delay: "delay-400" },
  ];

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 relative z-10">
        {[1,2,3,4].map((i) => (
           <div key={i} className="glass-panel rounded-3xl p-6 h-32 flex items-center justify-center">
             <Loader2 className="w-6 h-6 animate-spin text-primary" />
           </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 relative z-10">
      {displayStats.map((stat) => (
        <div 
          key={stat.label} 
          className={`glass-panel rounded-3xl p-6 card-hover animate-fade-in-up ${stat.delay} overflow-hidden relative`}
        >
          {/* Subtle internal gradient glow */}
          <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 blur-2xl rounded-full`} />
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">{stat.label}</span>
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.shadow}`}>
              {stat.icon}
            </div>
          </div>
          <p className="text-4xl font-black text-navy tracking-tight relative z-10 drop-shadow-sm">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
