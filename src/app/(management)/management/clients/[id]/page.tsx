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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", room_number: "", care_stage: "Independent" });

  // Discharge Modal State
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [isDischarging, setIsDischarging] = useState(false);
  const [dischargeConfirm, setDischargeConfirm] = useState("");

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
      supabase.from('visit_notes').select('*').eq('resident_id', residentId).not('visit_type', 'ilike', 'Handover%'),
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
        .select('id, full_name')
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

  const handleUpdateMedStatus = async (medId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'due' ? 'taken' : currentStatus === 'taken' ? 'missed' : 'due';
    
    // Optimistic update
    setMedications(prev => prev.map(m => m.id === medId ? { ...m, status: nextStatus } : m));
    
    const { error } = await supabase
      .from('medications')
      .update({ status: nextStatus })
      .eq('id', medId);
      
    if (error) {
      alert("Failed to update medication status");
      fetchProfile(); // Revert on failure
    }
  };

  const handleRevokeAccess = async (userId: string) => {
    await supabase
      .from('family_access')
      .delete()
      .eq('resident_id', residentId)
      .eq('user_id', userId);
    await fetchProfile();
  };

  const handleCancelInvite = async (email: string) => {
    await supabase
      .from('family_invitations')
      .delete()
      .eq('resident_id', residentId)
      .eq('email', email);
    await fetchProfile();
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

  const openEditModal = () => {
    if (!resident) return;
    setEditForm({
      first_name: resident.first_name,
      last_name: resident.last_name,
      room_number: resident.room_number || "",
      care_stage: resident.care_stage || "Independent"
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    const { error } = await supabase
      .from('residents')
      .update({
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        room_number: editForm.room_number.trim() || null,
        care_stage: editForm.care_stage
      })
      .eq('id', residentId);

    if (error) {
      alert("Failed to update resident: " + error.message);
    } else {
      await fetchProfile();
      setIsEditModalOpen(false);
    }
    setIsUpdating(false);
  };

  const handleDischarge = async () => {
    setIsDischarging(true);

    // 1. Delete related records first (cascading cleanup)
    await supabase.from('medications').delete().eq('resident_id', residentId);
    await supabase.from('visit_notes').delete().eq('resident_id', residentId);
    await supabase.from('escalations').delete().eq('resident_id', residentId);
    await supabase.from('family_access').delete().eq('resident_id', residentId);
    await supabase.from('family_invitations').delete().eq('resident_id', residentId);
    await supabase.from('messages').delete().eq('resident_id', residentId);

    // 2. Delete the resident
    const { error } = await supabase.from('residents').delete().eq('id', residentId);

    if (error) {
      alert("Failed to discharge resident: " + error.message);
      setIsDischarging(false);
      return;
    }

    // 3. Navigate back to the directory
    router.push('/management/clients');
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex-1 overflow-hidden bg-slate-50 dark:bg-zinc-900/50 z-0 p-4 md:p-6 lg:p-10 space-y-6 md:space-y-8 max-w-[1200px] mx-auto w-full">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
            <div className="space-y-3">
              <div className="w-48 h-8 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse" />
              <div className="w-32 h-4 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-28 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
            <div className="w-28 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Col Skeleton */}
          <div className="space-y-8">
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-3xl animate-pulse" />
            <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-3xl animate-pulse" />
          </div>
          {/* Right Col Skeleton */}
          <div className="lg:col-span-2 h-[500px] lg:h-[700px] bg-slate-200 dark:bg-slate-700 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="p-4 md:p-6 lg:p-10 space-y-6 md:space-y-8 max-w-[1200px] mx-auto w-full pb-20 lg:pb-32">
        {/* Header Navigation */}
        <div className="animate-fade-in-up">
          <Link href="/management/clients" className="inline-flex items-center gap-2 text-xs md:text-sm font-medium text-slate-500 dark:text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white transition-colors mb-3 md:mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
            <div className="flex flex-row items-center gap-3 md:gap-5">
              <div className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-3xl bg-slate-900 dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center text-white text-xl md:text-3xl font-bold shrink-0">
                {resident.first_name[0]}{resident.last_name[0]}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-0.5 md:mb-1">
                  <h1 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {resident.first_name} {resident.last_name}
                  </h1>
                  <Badge variant="secondary" className="text-[10px] md:text-xs uppercase tracking-wider font-semibold">
                    {resident.care_stage}
                  </Badge>
                </div>
                <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-500 dark:text-zinc-400">
                  Room {resident.room_number || 'N/A'} · Admitted 2026
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 mt-1 md:mt-0">
              <Button onClick={openEditModal} variant="outline" className="rounded-xl flex items-center gap-2 text-xs md:text-sm h-9 md:h-10 flex-1 md:flex-none">
                <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" /> Edit
              </Button>
              <Button onClick={() => setIsDischargeModalOpen(true)} variant="destructive" className="rounded-xl flex items-center gap-2 text-xs md:text-sm h-9 md:h-10 flex-1 md:flex-none">
                <UserMinus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Discharge
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 animate-fade-in-up delay-100">
          
          {/* Left Column: Meds & Info */}
          <div className="space-y-8">
            
            {/* Medications Card */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 md:mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Pill className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                  </div>
                  <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Medications</h2>
                </div>
                <button 
                  onClick={() => setIsMedModalOpen(true)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 dark:bg-zinc-900 dark:hover:bg-slate-800 dark:bg-zinc-900 transition-colors shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5 text-slate-700 dark:text-slate-300" />
                </button>
              </div>
              
              <div className="space-y-3 max-h-[250px] md:max-h-[300px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {medications.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No medications prescribed.</p>
                ) : (
                  medications.map(med => (
                    <div key={med.id} className="p-3 bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/50 rounded-xl">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{med.name} <span className="text-slate-500 dark:text-slate-500 dark:text-zinc-400 font-medium">{med.dosage}</span></p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-500 dark:text-zinc-400">{med.scheduled_time}</span>
                        <button 
                          onClick={() => handleUpdateMedStatus(med.id, med.status)}
                          className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md hover:opacity-80 transition-opacity cursor-pointer ${
                            med.status === 'taken' ? 'bg-emerald-100 text-emerald-700' : 
                            med.status === 'missed' ? 'bg-rose-100 text-rose-700' : 
                            'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {med.status}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Family Contacts Card */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 md:mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                  </div>
                  <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Family Access</h2>
                </div>
                <button 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 dark:bg-zinc-900 dark:hover:bg-slate-800 dark:bg-zinc-900 transition-colors shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5 text-slate-700 dark:text-slate-300" />
                </button>
              </div>

              {pendingInvites.length === 0 && activeFamily.length === 0 ? (
                <div className="text-center p-4 md:p-5 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50 dark:bg-zinc-900/50">
                  <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-500 dark:text-zinc-400 mb-2 md:mb-3">No family members connected.</p>
                  <button 
                    onClick={() => setIsInviteModalOpen(true)}
                    className="text-[11px] md:text-xs font-bold text-primary hover:text-primary-dark transition-colors"
                  >
                    Invite Family Member
                  </button>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  
                  {/* Active Connected Family Members */}
                  {activeFamily.map((family, idx) => (
                    <div key={`active-${idx}`} className="flex items-center justify-between p-2.5 md:p-3 bg-white dark:bg-[#0a0a0a] border border-emerald-200 rounded-xl animate-fade-in-up">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                          {family.full_name?.[0] || 'F'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white truncate">{family.full_name}</p>
                          <p className="text-[9px] md:text-[10px] font-medium text-slate-500 dark:text-slate-500 dark:text-zinc-400">Connected</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Active
                        </span>
                        <button
                          onClick={() => handleRevokeAccess(family.id)}
                          className="w-6 h-6 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center hover:bg-rose-100 transition-colors group"
                          title="Revoke access"
                        >
                          <X className="w-3 h-3 text-rose-400 group-hover:text-rose-600" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Pending Email Invites */}
                  {pendingInvites.map((email, idx) => (
                    <div key={`pending-${idx}`} className="flex items-center justify-between p-2.5 md:p-3 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl animate-fade-in-up">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white dark:bg-[#0a0a0a] flex items-center justify-center border border-slate-200 dark:border-zinc-800 shrink-0">
                          <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white truncate">{email}</p>
                          <p className="text-[9px] md:text-[10px] font-medium text-slate-500 dark:text-slate-500 dark:text-zinc-400">Invite Sent</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                          Pending
                        </span>
                        <button
                          onClick={() => handleCancelInvite(email)}
                          className="w-6 h-6 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center hover:bg-rose-100 transition-colors group"
                          title="Cancel invite"
                        >
                          <X className="w-3 h-3 text-rose-400 group-hover:text-rose-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
  
          </div>

          {/* Right Column: Tabbed Content Area */}
          <Tabs defaultValue="timeline" className="lg:col-span-2 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm p-4 sm:p-6 md:p-8 flex flex-col min-h-[500px] lg:h-[700px]">
            
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0 pb-6 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-10 bg-white dark:bg-[#0a0a0a] sm:relative -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Patient Record</h2>
                  <p className="text-[11px] md:text-sm font-medium text-slate-500 dark:text-slate-500 dark:text-zinc-400 mt-0.5 max-w-[200px] md:max-w-none">
                    Combined history and family communications
                  </p>
                </div>
              </div>
              
              <TabsList className="w-full sm:w-auto grid grid-cols-2">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="chat">Family Chat</TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content Wrapper */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              
              <TabsContent value="timeline" className="flex-1 overflow-hidden flex flex-col min-h-0 m-0 border-0 p-0 outline-none">
                <>
                  {/* Note / Escalation Toggle */}
                  <div className="flex justify-end mb-4">
                    <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl shadow-inner border border-slate-200 dark:border-zinc-800">
                      <button 
                        onClick={() => setNoteMode("note")}
                        className={`px-4 py-1.5 text-[11px] md:text-xs font-bold rounded-lg transition-all ${noteMode === "note" ? "bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white"}`}
                      >
                        Note
                      </button>
                      <button 
                        onClick={() => setNoteMode("escalation")}
                        className={`px-4 py-1.5 text-[11px] md:text-xs font-bold rounded-lg transition-all ${noteMode === "escalation" ? "bg-rose-500 text-white shadow-sm" : "text-slate-500 dark:text-slate-500 dark:text-zinc-400 hover:text-rose-600"}`}
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
                placeholder={noteMode === "escalation" ? `Describe emergency...` : `Log a quick note...`}
                className={`w-full h-10 md:h-12 pl-4 pr-12 bg-slate-50 dark:bg-zinc-900/50 border rounded-xl text-xs md:text-sm font-medium focus:outline-none focus:ring-2 transition-all shadow-sm ${
                  noteMode === "escalation" 
                    ? "border-rose-200 focus:ring-rose-500/40 text-rose-700 placeholder:text-rose-300" 
                    : "border-slate-200 dark:border-zinc-800 focus:ring-primary/40 focus:bg-white dark:bg-[#0a0a0a]"
                }`}
              />
              <button 
                type="submit"
                disabled={!newNote.trim() || isSubmittingNote}
                className={`absolute right-1 top-1 md:w-10 md:h-10 w-8 h-8 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 shadow-sm btn-press ${
                  noteMode === "escalation" ? "bg-rose-600 hover:bg-rose-700" : "bg-slate-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-slate-800"
                }`}
              >
                {isSubmittingNote ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Plus className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
            </form>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {feed.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-50">
                  <ClipboardList className="w-12 h-12 text-slate-400 mb-3" />
                  <p className="font-bold text-slate-900 dark:text-white">No history recorded.</p>
                </div>
              ) : (
                feed.map(item => (
                  <div key={item.id} className="relative pl-6 md:pl-8 pb-2 animate-fade-in">
                    {/* Timeline line */}
                    <div className="absolute left-[11px] md:left-[17px] top-8 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
                    
                    <div className={`bg-white dark:bg-[#0a0a0a] border p-4 md:p-5 rounded-2xl shadow-sm transition-colors ${
                      item.type === 'escalation' ? 'border-rose-200 hover:bg-rose-50' : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 dark:bg-zinc-900/50 dark:hover:bg-slate-800/50 dark:bg-zinc-900/50'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className={`absolute left-0 md:left-1 w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                            item.type === 'escalation' ? 'bg-rose-500 text-white' : 'bg-slate-900 dark:bg-zinc-100 dark:text-zinc-900 text-white'
                          }`}>
                            {item.type === 'escalation' ? <AlertTriangle className="w-3 h-3 md:w-3.5 md:h-3.5" /> : <ClipboardList className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                          </div>
                          <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            item.type === 'escalation' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-slate-300'
                          }`}>
                            {item.type === 'escalation' ? 'Escalation' : item.visit_type}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] md:text-xs font-bold text-slate-900 dark:text-white">
                            {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 mt-0.5">
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      
                      <p className={`text-xs md:text-sm font-medium leading-relaxed mt-2 ${
                        item.type === 'escalation' ? 'text-rose-700 font-semibold' : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {item.type === 'escalation' ? item.reason : item.tasks_completed}
                      </p>
                      
                      {item.type === 'escalation' && item.is_resolved && (
                        <div className="mt-3 text-[10px] font-bold text-emerald-700 bg-emerald-100 inline-flex px-2 py-1 rounded-md uppercase tracking-wider">
                          Resolved
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            </>
            </TabsContent>

            <TabsContent value="chat" className="flex-1 overflow-hidden flex flex-col min-h-0 m-0 border-0 p-0 outline-none">
              <ResidentChat residentId={residentId} />
            </TabsContent>

            </div>
          </Tabs>
        </div>
      </main>

      {/* Add Medication Modal */}
      {isMedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900 dark:bg-zinc-100 dark:text-zinc-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 w-full max-w-sm rounded-t-[32px] sm:rounded-3xl p-5 md:p-6 shadow-xl relative animate-slide-up sm:animate-fade-in-up pb-safe">
            {/* Mobile drag handle indicator */}
            <div className="w-10 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5 md:hidden" />
            
            <button 
              onClick={() => setIsMedModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500 dark:text-slate-500 dark:text-zinc-400" />
            </button>
            
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Pill className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">Add Medication</h2>
              </div>
            </div>

            <form onSubmit={handleAddMed} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Medication Name</label>
                <input 
                  type="text" required placeholder="e.g. Lisinopril"
                  value={newMed.name}
                  onChange={e => setNewMed({...newMed, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white dark:bg-[#0a0a0a] transition-colors"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Dosage</label>
                  <input 
                    type="text" required placeholder="e.g. 50mg"
                    value={newMed.dosage}
                    onChange={e => setNewMed({...newMed, dosage: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white dark:bg-[#0a0a0a] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Time</label>
                  <input 
                    type="time" required
                    value={newMed.scheduled_time}
                    onChange={e => setNewMed({...newMed, scheduled_time: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white dark:bg-[#0a0a0a] transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmittingMed}
                  className="w-full py-3 bg-slate-900 dark:bg-zinc-100 dark:text-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900 dark:bg-zinc-100 dark:text-zinc-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 w-full max-w-sm rounded-t-[32px] sm:rounded-3xl p-5 md:p-6 shadow-xl relative animate-slide-up sm:animate-fade-in-up pb-safe">
            {/* Mobile drag handle indicator */}
            <div className="w-10 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5 md:hidden" />
            
            <button 
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500 dark:text-slate-500 dark:text-zinc-400" />
            </button>
            
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">Invite Family</h2>
              </div>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Family Member's Email</label>
                <input 
                  type="email" required placeholder="e.g. sarah@example.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white dark:bg-[#0a0a0a] transition-colors"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isInviting}
                  className="w-full py-3 bg-slate-900 dark:bg-zinc-100 dark:text-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {isInviting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Resident Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900 dark:bg-zinc-100 dark:text-zinc-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 w-full max-w-sm rounded-t-[32px] sm:rounded-3xl p-5 md:p-6 shadow-xl relative animate-slide-up sm:animate-fade-in-up pb-safe">
            <div className="w-10 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5 md:hidden" />
            
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500 dark:text-slate-500 dark:text-zinc-400" />
            </button>
            
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center shrink-0">
                <Edit className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">Edit Profile</h2>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
                  <input 
                    type="text" required
                    value={editForm.first_name}
                    onChange={e => setEditForm({...editForm, first_name: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white dark:bg-[#0a0a0a] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
                  <input 
                    type="text" required
                    value={editForm.last_name}
                    onChange={e => setEditForm({...editForm, last_name: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white dark:bg-[#0a0a0a] transition-colors"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Room Number</label>
                  <input 
                    type="text"
                    value={editForm.room_number}
                    onChange={e => setEditForm({...editForm, room_number: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white dark:bg-[#0a0a0a] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Care Stage</label>
                  <select 
                    value={editForm.care_stage}
                    onChange={e => setEditForm({...editForm, care_stage: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white dark:bg-[#0a0a0a] transition-colors"
                  >
                    <option value="Independent">Independent</option>
                    <option value="Home care">Home care</option>
                    <option value="Facility">Facility</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="w-full py-3 bg-slate-900 dark:bg-zinc-100 dark:text-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discharge Resident Modal */}
      {isDischargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900 dark:bg-zinc-100 dark:text-zinc-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 w-full max-w-sm rounded-t-[32px] sm:rounded-3xl p-5 md:p-6 shadow-xl relative animate-slide-up sm:animate-fade-in-up pb-safe">
            <div className="w-10 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5 md:hidden" />
            
            <button 
              onClick={() => setIsDischargeModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500 dark:text-slate-500 dark:text-zinc-400" />
            </button>
            
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">Discharge Resident</h2>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Are you sure you want to discharge <span className="font-bold text-slate-900 dark:text-white">{resident?.first_name} {resident?.last_name}</span>? This will permanently delete their profile, visit history, and immediately revoke family access.
              </p>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Type <span className="text-red-600 select-none">DISCHARGE</span> to confirm
                </label>
                <input 
                  type="text"
                  value={dischargeConfirm}
                  onChange={e => setDischargeConfirm(e.target.value)}
                  placeholder="DISCHARGE"
                  className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white dark:bg-[#0a0a0a] transition-colors uppercase"
                />
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleDischarge}
                  disabled={isDischarging || dischargeConfirm !== 'DISCHARGE'}
                  className="w-full py-3 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-red-600"
                >
                  {isDischarging ? <Loader2 className="w-5 h-5 animate-spin" /> : "Permanently Discharge"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
