"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { 
  ArrowLeft, Activity, Pill, Calendar, HeartPulse, 
  AlertTriangle, ClipboardList, Loader2, UserMinus, Edit, Plus, Users, X
} from "lucide-react";
import { ResidentChat } from "@/components/management/ResidentChat";

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const residentId = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [resident, setResident] = useState<any>(null);
  const [feed, setFeed] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  
  // Note/Escalation Input State
  const [newNote, setNewNote] = useState("");
  const [noteMode, setNoteMode] = useState<"note" | "escalation">("note");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Medication Modal State
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [isSubmittingMed, setIsSubmittingMed] = useState(false);
  const [newMed, setNewMed] = useState({ name: "", dosage: "", scheduled_time: "" });

  // Family Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<string[]>([]);
  const [activeFamily, setActiveFamily] = useState<any[]>([]);

  // Right Column Tab State
  const [activeTab, setActiveTab] = useState<"timeline" | "chat">("timeline");

  const fetchProfile = async () => {
    // 1. Fetch resident info
    const { data: resData } = await supabase
      .from('residents')
      .select('*')
      .eq('id', residentId)
      .single();
    
    if (!resData) {
      router.push('/management/clients');
      return;
    }
    setResident(resData);

    // 2. Fetch Meds
    const { data: medData } = await supabase
      .from('medications')
      .select('*')
      .eq('resident_id', residentId)
      .order('scheduled_time', { ascending: true });
    if (medData) setMedications(medData);

    // 3. Fetch Notes & Escalations to merge into a single feed
    const [notesRes, escRes] = await Promise.all([
      supabase.from('visit_notes').select('*').eq('resident_id', residentId),
      supabase.from('escalations').select('*').eq('resident_id', residentId)
    ]);

    const merged = [
      ...(notesRes.data || []).map(n => ({ ...n, type: 'note' })),
      ...(escRes.data || []).map(e => ({ ...e, type: 'escalation' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setFeed(merged);

    // 4. Fetch real pending invites from the database
    const { data: invites } = await supabase
      .from('family_invitations')
      .select('*')
      .eq('resident_id', residentId);
    if (invites) {
      setPendingInvites(invites.map(i => i.email));
    }

    // 5. Fetch ACTIVE family members
    const { data: accessData } = await supabase
      .from('family_access')
      .select('user_id')
      .eq('resident_id', residentId);
    
    if (accessData && accessData.length > 0) {
      const userIds = accessData.map(a => a.user_id);
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('full_name')
        .in('id', userIds);
        
      if (profiles) {
        setActiveFamily(profiles);
      }
    } else {
      setActiveFamily([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [residentId, router]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsSubmittingNote(true);

    if (noteMode === "escalation") {
      await supabase.from('escalations').insert([{
        resident_id: residentId,
        reason: newNote.trim(),
        is_resolved: false
      }]);
    } else {
      await supabase.from('visit_notes').insert([{
        resident_id: residentId,
        visit_type: 'Direct Note',
        tasks_completed: newNote.trim(),
        is_escalation: false
      }]);
    }

    setNewNote("");
    setNoteMode("note");
    await fetchProfile(); // Refresh feed
    setIsSubmittingNote(false);
  };

  const handleAddMed = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingMed(true);
    await supabase.from('medications').insert([{
      resident_id: residentId,
      name: newMed.name,
      dosage: newMed.dosage,
      scheduled_time: newMed.scheduled_time,
      status: 'due'
    }]);
    
    await fetchProfile();
    setIsSubmittingMed(false);
    setIsMedModalOpen(false);
    setNewMed({ name: "", dosage: "", scheduled_time: "" });
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    
    // Actually insert the pending invite into the database!
    await supabase.from('family_invitations').insert([{
      email: inviteEmail.trim(),
      resident_id: residentId
    }]);
    
    await fetchProfile(); // Refresh the list from the database
    
    setIsInviting(false);
    setIsInviteModalOpen(false);
    setInviteEmail("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex-1 overflow-hidden bg-slate-50/50 z-0">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] animate-blob-1" />
        <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] animate-blob-3" />
      </div>

      <main className="p-6 lg:p-10 space-y-8 overflow-y-auto h-full max-w-[1200px] mx-auto w-full relative z-10 pb-32 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Header Navigation */}
        <div className="animate-fade-in-up">
          <Link href="/management/clients" className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-navy transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-500/30">
                {resident.first_name[0]}{resident.last_name[0]}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-4xl font-extrabold text-navy tracking-tight drop-shadow-sm">
                    {resident.first_name} {resident.last_name}
                  </h1>
                  <span className="px-3 py-1 bg-white/80 border border-white rounded-full text-xs font-black uppercase tracking-wider text-navy shadow-sm">
                    {resident.care_stage}
                  </span>
                </div>
                <p className="text-sm font-semibold text-text-secondary">
                  Room {resident.room_number || 'N/A'} · Admitted 2026
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white/70 border border-white/80 rounded-xl text-sm font-bold text-navy hover:bg-white shadow-sm transition-all flex items-center gap-2">
                <Edit className="w-4 h-4" /> Edit Profile
              </button>
              <button className="px-4 py-2 bg-danger/10 border border-danger/20 rounded-xl text-sm font-bold text-danger hover:bg-danger hover:text-white shadow-sm transition-all flex items-center gap-2">
                <UserMinus className="w-4 h-4" /> Discharge
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 animate-fade-in-up delay-100">
          
          {/* Left Column: Meds & Info */}
          <div className="space-y-8">
            
            {/* Medications Card */}
            <div className="glass-panel-heavy rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Pill className="w-5 h-5 text-blue-500" />
                  </div>
                  <h2 className="text-lg font-bold text-navy">Medications</h2>
                </div>
                <button 
                  onClick={() => setIsMedModalOpen(true)}
                  className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center hover:bg-white hover:text-primary transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 text-navy" />
                </button>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {medications.length === 0 ? (
                  <p className="text-sm text-text-muted italic">No medications prescribed.</p>
                ) : (
                  medications.map(med => (
                    <div key={med.id} className="p-3 bg-white/50 border border-white/80 rounded-xl">
                      <p className="font-bold text-navy">{med.name} <span className="text-text-muted">{med.dosage}</span></p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs font-semibold text-text-secondary">{med.scheduled_time}</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${
                          med.status === 'taken' ? 'text-success' : med.status === 'missed' ? 'text-danger' : 'text-warning'
                        }`}>
                          {med.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Family Contacts Card */}
            <div className="glass-panel-heavy rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-500" />
                  </div>
                  <h2 className="text-lg font-bold text-navy">Family Access</h2>
                </div>
                <button 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 text-navy" />
                </button>
              </div>

              {pendingInvites.length === 0 && activeFamily.length === 0 ? (
                <div className="text-center p-5 border border-dashed border-border/80 rounded-2xl bg-white/30">
                  <p className="text-sm font-medium text-text-secondary mb-3">No family members connected to this resident.</p>
                  <button 
                    onClick={() => setIsInviteModalOpen(true)}
                    className="text-xs font-bold text-primary hover:text-primary-dark transition-colors"
                  >
                    Invite Family Member
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  
                  {/* Active Connected Family Members */}
                  {activeFamily.map((family, idx) => (
                    <div key={`active-${idx}`} className="flex items-center justify-between p-3 bg-white/70 border border-success/30 rounded-xl animate-fade-in-up">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                          {family.full_name?.[0] || 'F'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-navy truncate max-w-[120px] sm:max-w-[150px]">{family.full_name}</p>
                          <p className="text-[10px] font-bold text-text-muted">Connected Account</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-success bg-success/10 px-2 py-0.5 rounded-full shrink-0">
                        Active
                      </span>
                    </div>
                  ))}

                  {/* Pending Email Invites */}
                  {pendingInvites.map((email, idx) => (
                    <div key={`pending-${idx}`} className="flex items-center justify-between p-3 bg-white/50 border border-white/80 rounded-xl animate-fade-in-up">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-border">
                          <Users className="w-4 h-4 text-text-muted" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-navy truncate max-w-[120px] sm:max-w-[150px]">{email}</p>
                          <p className="text-[10px] font-bold text-text-muted">Invitation Sent</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-warning bg-warning-light px-2 py-0.5 rounded-full shrink-0">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
  
          </div>

          {/* Right Column: Tabbed Content Area */}
          <div className="lg:col-span-2 glass-panel-heavy rounded-3xl p-6 md:p-8 flex flex-col h-[700px]">
            
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0 border-b border-border/50 pb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${
                  activeTab === 'timeline' ? 'bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-indigo-500/20 text-white' : 'bg-gradient-to-tr from-primary to-primary-dark shadow-primary/20 text-white'
                }`}>
                  {activeTab === 'timeline' ? <Activity className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-navy">{activeTab === 'timeline' ? 'Patient Timeline' : 'Family Chat'}</h2>
                  <p className="text-sm font-semibold text-text-secondary mt-0.5">
                    {activeTab === 'timeline' ? 'Combined history of notes and escalations' : 'Secure direct messaging with the family'}
                  </p>
                </div>
              </div>
              
              {/* Tab Selector */}
              <div className="flex bg-slate-200/50 p-1.5 rounded-2xl shadow-inner self-start">
                <button 
                  onClick={() => setActiveTab("timeline")}
                  className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === "timeline" ? "bg-white text-navy shadow-sm" : "text-text-muted hover:text-navy"}`}
                >
                  Timeline
                </button>
                <button 
                  onClick={() => setActiveTab("chat")}
                  className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === "chat" ? "bg-white text-navy shadow-sm" : "text-text-muted hover:text-navy"}`}
                >
                  Family Chat
                </button>
              </div>
            </div>

            {/* Tab Content Wrapper */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              
              {activeTab === "timeline" && (
                <>
                  {/* Note / Escalation Toggle */}
                  <div className="flex justify-end mb-4">
                    <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-xl border border-white/80 shadow-sm">
                      <button 
                        onClick={() => setNoteMode("note")}
                        className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${noteMode === "note" ? "bg-white text-navy shadow-sm" : "text-text-muted hover:text-navy"}`}
                      >
                        Note
                      </button>
                      <button 
                        onClick={() => setNoteMode("escalation")}
                        className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${noteMode === "escalation" ? "bg-danger text-white shadow-sm" : "text-text-muted hover:text-danger"}`}
                      >
                        Emergency
                      </button>
                    </div>
                  </div>

                  {/* Quick Note Input */}
                  <form onSubmit={handleAddNote} className="mb-6 flex gap-2 relative shrink-0">
              <input 
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={noteMode === "escalation" ? `Describe emergency for ${resident.first_name}...` : `Log a quick note for ${resident.first_name}...`}
                className={`w-full h-12 pl-4 pr-12 bg-white/80 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition-all shadow-sm ${
                  noteMode === "escalation" 
                    ? "border-danger/40 focus:ring-danger/40 placeholder-danger/50 text-danger" 
                    : "border-white focus:ring-primary/40 focus:bg-white"
                }`}
              />
              <button 
                type="submit"
                disabled={!newNote.trim() || isSubmittingNote}
                className={`absolute right-1 top-1 w-10 h-10 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 shadow-sm btn-press ${
                  noteMode === "escalation" ? "bg-danger hover:bg-red-600" : "bg-primary hover:bg-primary-dark"
                }`}
              >
                {isSubmittingNote ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              </button>
            </form>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {feed.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-50">
                  <ClipboardList className="w-12 h-12 text-text-muted mb-3" />
                  <p className="font-bold text-navy">No history recorded.</p>
                </div>
              ) : (
                feed.map(item => (
                  <div key={item.id} className="relative pl-6 pb-2 animate-fade-in">
                    {/* Timeline line */}
                    <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-border/60" />
                    
                    <div className={`bg-white/60 backdrop-blur-md border p-5 rounded-2xl shadow-sm transition-colors ${
                      item.type === 'escalation' ? 'border-danger/30 hover:bg-danger/5' : 'border-white/80 hover:bg-white/80'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`absolute left-0 w-[24px] h-[24px] rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                            item.type === 'escalation' ? 'bg-danger text-white' : 'bg-primary text-white'
                          }`}>
                            {item.type === 'escalation' ? <AlertTriangle className="w-3 h-3" /> : <ClipboardList className="w-3 h-3" />}
                          </div>
                          <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            item.type === 'escalation' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'
                          }`}>
                            {item.type === 'escalation' ? 'Escalation' : item.visit_type}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-navy">
                            {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-[10px] font-bold text-text-muted mt-0.5">
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      
                      <p className={`text-sm font-medium leading-relaxed mt-2 ${
                        item.type === 'escalation' ? 'text-danger-dark font-semibold' : 'text-text-secondary'
                      }`}>
                        {item.type === 'escalation' ? item.reason : item.tasks_completed}
                      </p>
                      
                      {item.type === 'escalation' && item.is_resolved && (
                        <div className="mt-3 text-xs font-bold text-success bg-success/10 inline-flex px-2 py-1 rounded-md">
                          Resolved
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            </>
            )}

            {activeTab === "chat" && (
              <ResidentChat residentId={residentId} />
            )}

            </div>
          </div>
        </div>
      </main>

      {/* Add Medication Modal */}
      {isMedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/80 backdrop-blur-2xl border border-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-fade-in-up">
            <button 
              onClick={() => setIsMedModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-surface hover:bg-surface-alt transition-colors"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Pill className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy">Prescribe Med</h2>
              </div>
            </div>

            <form onSubmit={handleAddMed} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">Medication Name</label>
                <input 
                  type="text" required placeholder="e.g. Aspirin"
                  value={newMed.name}
                  onChange={e => setNewMed({...newMed, name: e.target.value})}
                  className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Dosage</label>
                  <input 
                    type="text" required placeholder="e.g. 50mg"
                    value={newMed.dosage}
                    onChange={e => setNewMed({...newMed, dosage: e.target.value})}
                    className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Time</label>
                  <input 
                    type="time" required
                    value={newMed.scheduled_time}
                    onChange={e => setNewMed({...newMed, scheduled_time: e.target.value})}
                    className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmittingMed}
                  className="w-full py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30 flex items-center justify-center gap-2"
                >
                  {isSubmittingMed ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Medication"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Family Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/80 backdrop-blur-2xl border border-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-fade-in-up">
            <button 
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-surface hover:bg-surface-alt transition-colors"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy">Invite Family</h2>
              </div>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">Family Member's Email</label>
                <input 
                  type="email" required placeholder="e.g. sarah@example.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isInviting}
                  className="w-full py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30 flex items-center justify-center gap-2"
                >
                  {isInviting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
