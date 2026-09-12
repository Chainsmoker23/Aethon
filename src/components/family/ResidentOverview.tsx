"use client";

import { HeartPulse, Pill, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function ResidentOverview() {
  const [medications, setMedications] = useState<any[]>([]);
  const [moods, setMoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const residentId = '11111111-1111-1111-1111-111111111111'; // Eleanor

  useEffect(() => {
    async function fetchData() {
      const [medsResponse, moodsResponse] = await Promise.all([
        supabase.from('medications').select('*').eq('resident_id', residentId),
        supabase.from('wellbeing_logs').select('*').eq('resident_id', residentId)
      ]);
      
      if (medsResponse.data) setMedications(medsResponse.data);
      if (moodsResponse.data) setMoods(moodsResponse.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "taken": return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "due": return <Clock className="w-5 h-5 text-warning" />;
      case "missed": return <XCircle className="w-5 h-5 text-danger" />;
      default: return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score === 0) return "bg-border/30"; // No data
    if (score >= 4) return "bg-success";
    if (score === 3) return "bg-warning";
    return "bg-danger";
  };

  // Build the 14-day array matching dates
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dateStr = d.toISOString().split('T')[0];
    const found = moods.find(m => m.date === dateStr);
    return found ? found.mood_score : 0;
  });

  if (loading) {
    return (
      <div className="bg-surface rounded-3xl p-6 shadow-sm border border-border flex items-center justify-center h-[350px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-3xl p-6 shadow-sm border border-border">
      
      {/* 14-Day Wellbeing Tracking */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
            <HeartPulse className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy">14-Day Wellbeing</h2>
            <p className="text-sm font-medium text-text-muted">Based on daily check-ins</p>
          </div>
        </div>
        
        <div className="flex justify-between items-end h-16 mt-6 px-2">
          {last14Days.map((score, i) => (
            <div key={i} className="flex flex-col items-center gap-2 group relative">
              {/* Tooltip */}
              {score > 0 && (
                <div className="absolute -top-8 bg-navy text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Score: {score}/5
                </div>
              )}
              <div 
                className={`w-3 rounded-full transition-all duration-500 ease-out ${getScoreColor(score)}`}
                style={{ height: score === 0 ? '12px' : `${(score / 5) * 48}px` }}
              />
              <span className="text-[10px] font-bold text-text-muted">
                {i === 0 ? '14d' : i === 13 ? 'Today' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-border/60 my-6" />

      {/* Medication Schedule */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Pill className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="text-lg font-bold text-navy">Today's Medication</h2>
        </div>

        <div className="space-y-3">
          {medications.length === 0 ? (
            <p className="text-sm text-text-muted italic">No medications scheduled for today.</p>
          ) : (
            medications.map((med, i) => (
              <div key={med.id || i} className="flex items-center justify-between p-3 rounded-xl bg-surface-alt border border-border/50 hover:bg-surface transition-colors">
                <div>
                  <p className="font-bold text-navy text-sm">{med.name} <span className="text-text-muted font-semibold ml-1">{med.dosage}</span></p>
                  <p className="text-xs font-semibold text-text-secondary mt-0.5">{med.scheduled_time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${
                    med.status === 'taken' ? 'text-success' :
                    med.status === 'missed' ? 'text-danger' : 'text-warning'
                  }`}>
                    {med.status}
                  </span>
                  {getStatusIcon(med.status)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
