"use client";

import { Pill, CheckCircle2, Clock, XCircle, Loader2, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useFamilyResident } from "@/hooks/useFamilyResident";

export function ResidentOverview() {
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { residentId, residentInfo } = useFamilyResident();

  useEffect(() => {
    async function fetchData() {
      if (!residentId) return;
      const { data } = await supabase.from('medications').select('*').eq('resident_id', residentId);
      if (data) setMedications(data);
      setLoading(false);
    }
    fetchData();
  }, [residentId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "taken": return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "due": return <Clock className="w-5 h-5 text-warning" />;
      case "missed": return <XCircle className="w-5 h-5 text-danger" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-3xl p-6 shadow-sm border border-border flex items-center justify-center h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Resident Snapshot */}
      <div className="bg-surface rounded-3xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy">Care Snapshot</h2>
            <p className="text-sm font-medium text-text-muted">Current facility status</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-border/50 shadow-sm">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Room Number</p>
            <p className="text-lg font-black text-navy">{residentInfo?.room_number || "Pending"}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-border/50 shadow-sm">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Care Stage</p>
            <p className="text-lg font-black text-navy truncate">{residentInfo?.care_stage || "Assigned"}</p>
          </div>
        </div>
      </div>

      {/* Medication Schedule */}
      <div className="bg-surface rounded-3xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Pill className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-lg font-bold text-navy">Today's Medication</h2>
          </div>
        </div>

        <div className="space-y-3">
          {medications.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-border/50">
              <Pill className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-navy">No medications scheduled.</p>
            </div>
          ) : (
            medications.map((med, i) => (
              <div key={med.id || i} className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-border/50 shadow-sm hover:border-primary/30 transition-colors">
                <div>
                  <p className="font-bold text-navy text-[15px]">{med.name} <span className="text-text-muted font-semibold ml-1">{med.dosage}</span></p>
                  <p className="text-xs font-semibold text-text-secondary mt-0.5">{med.scheduled_time}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getStatusIcon(med.status || "due")}
                  <span className={`text-[10px] font-black uppercase tracking-wider ${
                    med.status === 'taken' ? 'text-success' :
                    med.status === 'missed' ? 'text-danger' : 'text-warning'
                  }`}>
                    {med.status || "due"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
