"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useFamilyResident } from "@/hooks/useFamilyResident";
import { Calendar as CalendarIcon, Clock, Plus, Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { format, addDays } from "date-fns";

export default function FamilyPlannerPage() {
  const { residentId, residentInfo, loading: residentLoading } = useFamilyResident();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ date: "", time: "10:00", name: "" });

  const supabase = createClient();

  useEffect(() => {
    if (residentId) {
      fetchVisits();
    }
  }, [residentId]);

  const fetchVisits = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Get the user's name for default form
    if (!form.name) {
       setForm(prev => ({ ...prev, name: user.user_metadata?.full_name || user.email || '' }));
    }

    const { data } = await supabase
      .from('family_visits')
      .select('*')
      .eq('resident_id', residentId)
      .eq('visitor_id', user.id)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });
      
    if (data) setVisits(data);
    setLoading(false);
  };

  const handleRequestVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !residentInfo?.facility_id) return;
    
    const { error } = await supabase.from('family_visits').insert([{
      resident_id: residentId,
      facility_id: residentInfo.facility_id,
      visitor_id: user.id,
      visitor_name: form.name.trim(),
      scheduled_date: form.date,
      scheduled_time: form.time + ':00', // Time format requires seconds
      status: 'pending'
    }]);
    
    if (error) {
      alert("Failed to schedule visit: " + error.message);
    } else {
      await fetchVisits();
      setIsModalOpen(false);
      setForm(prev => ({ ...prev, date: "", time: "10:00" }));
    }
    
    setIsSubmitting(false);
  };

  const handleCancelVisit = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this visit?")) return;
    await supabase.from('family_visits').delete().eq('id', id);
    fetchVisits();
  };

  if (residentLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-30 pt-safe">
        <div className="px-4 py-4 max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Visit Planner</h1>
            <p className="text-sm font-medium text-slate-500">Schedule visits with {residentInfo?.first_name || 'your loved one'}</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <main className="p-4 max-w-3xl mx-auto space-y-6 mt-4">
        
        {visits.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Upcoming Visits</h3>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mb-6 max-w-xs mx-auto">
              Schedule a visit to let the care team know when you are coming.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-colors"
            >
              Request a Visit
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Your Scheduled Visits</h2>
            {visits.map((visit) => {
              const visitDate = new Date(visit.scheduled_date + 'T' + visit.scheduled_time);
              const isPast = visitDate < new Date();
              
              return (
                <div key={visit.id} className={`bg-white dark:bg-zinc-900 border rounded-2xl p-4 md:p-5 shadow-sm flex flex-col md:flex-row gap-4 md:items-center justify-between ${isPast ? 'border-slate-100 dark:border-zinc-800 opacity-60' : 'border-slate-200 dark:border-zinc-800'}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold uppercase">{format(new Date(visit.scheduled_date), 'MMM')}</span>
                      <span className="text-lg font-black leading-none">{format(new Date(visit.scheduled_date), 'd')}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">{format(new Date(visit.scheduled_date), 'EEEE, MMMM do')}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm font-medium text-slate-500">
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {visit.scheduled_time.substring(0, 5)}</span>
                        <span className="flex items-center gap-1.5">
                          {visit.status === 'approved' ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Approved</span>
                          ) : visit.status === 'rejected' ? (
                            <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1"><XCircle className="w-4 h-4" /> Rejected</span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1"><Loader2 className="w-4 h-4" /> Pending</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {!isPast && (
                    <button 
                      onClick={() => handleCancelVisit(visit.id)}
                      className="px-4 py-2 bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 text-sm font-bold rounded-xl transition-colors self-start md:self-center"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* New Visit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 w-full max-w-sm rounded-t-[32px] sm:rounded-3xl p-5 md:p-6 shadow-xl relative animate-slide-up pb-safe">
            <div className="w-10 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5 md:hidden" />
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <XCircle className="w-5 h-5 text-slate-500" />
            </button>
            
            <h2 className="text-xl font-bold mb-1">Request a Visit</h2>
            <p className="text-sm text-slate-500 mb-6">The care team will review and approve your requested time.</p>
            
            <form onSubmit={handleRequestVisit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Visitor Name</label>
                <input 
                  type="text" required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Date</label>
                  <input 
                    type="date" required
                    min={format(new Date(), 'yyyy-MM-dd')}
                    value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Time</label>
                  <input 
                    type="time" required
                    value={form.time}
                    onChange={e => setForm({...form, time: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
