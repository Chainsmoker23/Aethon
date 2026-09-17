"use client";

import { Users, Eye, AlertTriangle, FileText, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { MobileFacilityOverview } from "./MobileFacilityOverview";

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
        visit_notes ( visit_type, created_at ),
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
          const notes = (r.visit_notes || []).filter((n: any) => !n.visit_type?.toLowerCase().startsWith('handover'));
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

  return (
    <>
      <MobileFacilityOverview stats={stats} loading={loading} />
      
      {/* Desktop View */}
      <div className={`hidden md:grid md:grid-cols-2 xl:grid-cols-4 gap-4 relative z-10 w-full`}>
        {loading ? (
          [1,2,3,4].map((i) => (
             <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 h-32 flex items-center justify-center shrink-0">
               <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
             </div>
          ))
        ) : (
          displayStats.map((stat) => (
            <div 
              key={stat.label} 
              className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4 gap-3">
                <span className="text-sm font-medium text-slate-500 tracking-tight leading-tight pt-1">{stat.label}</span>
                <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-gradient-to-br ${stat.gradient} ${stat.shadow} shadow-sm text-white`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
}
