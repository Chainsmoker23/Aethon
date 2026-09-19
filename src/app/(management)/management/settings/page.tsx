"use client";

import { useState, useEffect } from "react";
import { Settings, Shield, Bell, Download, Building, Users, ToggleLeft, ToggleRight, Save, Check, Loader2, LogOut, User, AlertTriangle, CreditCard, Receipt, AlertCircle, CheckCircle2, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [userName, setUserName] = useState("Staff User");
  const [plan, setPlan] = useState("pilot");
  const [subscriptionStatus, setSubscriptionStatus] = useState("trialing");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [totalBeds, setTotalBeds] = useState(0);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [loadingCards, setLoadingCards] = useState(true);
  const supabase = createClient();
  const [staff, setStaff] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  
  // Staff Invite Modal State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffInviteEmail, setStaffInviteEmail] = useState("");
  const [staffInviteRole, setStaffInviteRole] = useState("caregiver");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);

  const { theme, setTheme } = useTheme();
  
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || "Staff User");
        
          // Also fetch subscription status from their facility
          const { data: profile } = await supabase
            .from('user_profiles')
            .select(`
              facilities ( plan, subscription_status )
            `)
            .eq('id', user.id)
            .single();
            
          const facility: any = profile?.facilities;
          
          const actualFacility = Array.isArray(facility) ? facility[0] : facility;
            
          if (actualFacility?.plan) {
            setPlan(actualFacility.plan);
          }
          if (actualFacility?.subscription_status) {
            setSubscriptionStatus(actualFacility.subscription_status);
          }
        
        // Fetch active beds
        const { count } = await supabase
          .from('residents')
          .select('*', { count: 'exact', head: true });
        
        if (count !== null) {
          setTotalBeds(count);
        }
        
        // Fallback: If we just returned from Stripe, verify the session directly
        // to bypass any webhook delays or failures
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        if (sessionId && actualFacility?.plan !== 'annual') {
          fetch(`/api/verify-session?session_id=${sessionId}`)
            .then(res => res.json())
            .then(data => {
              if (data.success) setPlan('annual');
            })
            .catch(console.error);
        }
        // Fetch invoices
        fetch('/api/invoices')
          .then(res => res.json())
          .then(data => {
            if (data.invoices) setInvoices(data.invoices);
            setLoadingInvoices(false);
          })
          .catch(err => {
            console.error(err);
            setLoadingInvoices(false);
          });
          
        // Fetch saved cards
        fetch('/api/payment-methods')
          .then(res => res.json())
          .then(data => {
            if (data.cards) setCards(data.cards);
            setLoadingCards(false);
          })
          .catch(err => {
            console.error(err);
            setLoadingCards(false);
          });
          
        // Fetch staff and invites
        fetchStaff();
      }
    }
    getUser();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (data.active) setStaff(data.active);
      if (data.pending) setInvites(data.pending);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingInvite(true);
    
    try {
      const res = await fetch('/api/invite-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: staffInviteEmail, role: staffInviteRole }),
      });
      
      if (res.ok) {
        setStaffInviteEmail("");
        setIsStaffModalOpen(false);
        fetchStaff();
      } else {
        const error = await res.json();
        alert("Failed to invite: " + error.error);
      }
    } catch (err) {
      alert("Error sending invite");
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleRevokeStaff = async (id: string, type: 'active' | 'invite') => {
    if (!confirm(`Are you sure you want to revoke this ${type}?`)) return;
    setIsRevoking(id);
    
    try {
      await fetch(`/api/staff/${id}?type=${type}`, { method: 'DELETE' });
      fetchStaff();
    } catch (err) {
      alert("Failed to revoke");
    } finally {
      setIsRevoking(null);
    }
  };

  const handleExport = async (type: 'records' | 'logs', format: 'csv' | 'pdf' = 'csv') => {
    setIsExporting(`${type}-${format}`);
    try {
      if (type === 'records') {
        const [notesRes, escRes] = await Promise.all([
          supabase.from('visit_notes').select('*, residents(first_name, last_name)'),
          supabase.from('escalations').select('*, residents(first_name, last_name)')
        ]);
        
        if (notesRes.error) throw notesRes.error;
        if (escRes.error) throw escRes.error;
        
        const combined = [
          ...(notesRes.data || []).map(n => ({ ...n, type: 'visit_note' })),
          ...(escRes.data || []).map(e => ({ ...e, type: 'escalation' }))
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        if (format === 'pdf') {
          const printWindow = window.open('', '_blank');
          if (!printWindow) return;
          
          const html = `
            <html>
              <head>
                <title>Resident Care Records - Aethon Health</title>
                <style>
                  body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; }
                  h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 30px; }
                  table { width: 100%; border-collapse: collapse; }
                  th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
                  th { background: #f8fafc; font-weight: 600; color: #475569; }
                  .type-badge { padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; background: #e0f2fe; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px; }
                  .escalation { background: #ffe4e6; color: #e11d48; }
                </style>
              </head>
              <body>
                <h1>Aethon Health - Resident Care Timeline</h1>
                <p style="margin-bottom: 20px; color: #64748b; font-weight: 500;">Generated on: ${new Date().toLocaleString()}</p>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Resident</th>
                      <th>Event Type</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${combined.map(d => `
                      <tr>
                        <td style="white-space: nowrap">${new Date(d.created_at).toLocaleString()}</td>
                        <td style="font-weight: 600">${d.residents?.first_name ? `${d.residents.first_name} ${d.residents.last_name}` : 'General / Facility'}</td>
                        <td><span class="type-badge ${d.type === 'escalation' ? 'escalation' : ''}">${d.type.replace('_', ' ')}</span></td>
                        <td>${d.tasks_completed || d.reason || ''}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                <script>
                  window.onload = () => { window.print(); window.setTimeout(() => window.close(), 500); }
                </script>
              </body>
            </html>
          `;
          
          printWindow.document.write(html);
          printWindow.document.close();
          return;
        }
        
        const headers = ['Date', 'Resident', 'Type', 'Details'];
        const rows = combined.map((d: any) => [
          new Date(d.created_at).toLocaleString(),
          d.residents?.first_name ? `${d.residents.first_name} ${d.residents.last_name}` : 'General / Facility',
          d.type,
          `"${(d.tasks_completed || d.reason || '').replace(/"/g, '""')}"`
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const filename = `resident_care_records_${new Date().toISOString().split('T')[0]}.csv`;
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      } else {
        const { data, error } = await supabase.from('user_profiles').select('*');
        if (error) throw error;
        
        const headers = ['ID', 'Role', 'Full Name'];
        const rows = data.map((d: any) => [
          d.id,
          d.role,
          `"${(d.full_name || '').replace(/"/g, '""')}"`
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const filename = `staff_audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error("Export failed:", e);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(null);
    }
  };
  
  // Mock settings state
  const [settings, setSettings] = useState({
    facilityName: "Aethon Pro Care Center",
    timezone: "Europe/Berlin",
    theme: "light",
    alertTime: "14:00",
    notifyFamily: true,
    requireHandoverSignoff: true
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "general", label: "Facility Profile", icon: <Building className="w-4 h-4" /> },
    { id: "appearance", label: "Appearance", icon: <ToggleLeft className="w-4 h-4" /> },
    { id: "staff", label: "Staff & Roles", icon: <Shield className="w-4 h-4" /> },
    { id: "alerts", label: "Alert Thresholds", icon: <Bell className="w-4 h-4" /> },
    { id: "export", label: "Data & Export", icon: <Download className="w-4 h-4" /> },
    { id: "billing", label: "Subscription", icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <>
      <main className="p-4 md:p-6 lg:p-10 space-y-6 md:space-y-8 max-w-[1200px] mx-auto w-full pb-20 lg:pb-32">
        
        <div className="hidden md:flex items-center gap-3 animate-fade-in-up">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            System Settings
          </h1>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center shadow-md">
            <Settings className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Mobile Account Block */}
        <div className="lg:hidden flex items-center justify-between p-3 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm animate-fade-in-up mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-[10px] shadow-sm shrink-0">
              {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'S'}
            </div>
            <p className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[140px]">{userName}</p>
          </div>
          <SignOutButton className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 transition-colors shrink-0">
            <LogOut className="w-3 h-3" />
            Sign Out
          </SignOutButton>
        </div>

        {/* Lockout Banner */}
        {subscriptionStatus === 'past_due' && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-xl shadow-sm mb-8 animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-4">
              <AlertTriangle className="w-8 h-8 text-red-500 shrink-0" />
              <div>
                <h2 className="text-red-800 dark:text-red-200 font-bold text-lg mb-1">Payment Declined: Access Restricted</h2>
                <p className="text-red-700 dark:text-red-300/80 text-sm">
                  We were unable to process the charge for a recently added active bed. Your access to the Client Directory and Shift Handovers has been temporarily locked. Please update your payment method to automatically process the open invoice and instantly restore access.
                </p>
              </div>
            </div>
            <a 
              href="/api/customer-portal" 
              className="shrink-0 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold shadow-sm transition-colors flex items-center justify-center text-sm"
            >
              Update Payment Method
            </a>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          
          {/* Settings Sidebar */}
          <div className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto hide-scrollbar pb-2 lg:pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap shrink-0 ${
                  activeTab === tab.id 
                    ? "bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-primary dark:text-white shadow-sm" 
                    : "text-slate-500 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 md:p-8 md:min-h-[500px] shadow-sm">
            {activeTab === "billing" && (
              <div className="animate-fade-in space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-navy dark:text-zinc-100">Subscription & Billing</h2>
                  <p className="text-sm font-medium text-text-secondary dark:text-zinc-400 mt-1">Manage your facility&apos;s Aethon plan, licenses, and invoices.</p>
                </div>

                {plan !== 'annual' && (
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <div className="inline-flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full text-xs font-bold mb-3">
                          <AlertCircle className="w-3.5 h-3.5" />
                          90-Day Free Pilot
                        </div>
                        <h2 className="text-xl font-bold mb-1">Your trial ends in 42 days</h2>
                        <p className="text-indigo-100 text-sm max-w-md">You are currently enjoying full access to Aethon Management Core. Upgrade to an annual plan to ensure uninterrupted access to resident baselines and shift handovers.</p>
                      </div>
                      <a href="/api/checkout" className="shrink-0 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm shadow-sm hover:scale-105 transition-transform flex items-center justify-center">
                        Upgrade to Annual Plan
                      </a>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Building className="w-5 h-5 text-blue-500" />
                        Active Licenses
                      </h3>
                      <span className="text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg">CHF 12 / bed</span>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex justify-between items-center text-sm mb-4">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Total Active Beds</span>
                        <span className="text-lg font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">
                          {totalBeds}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm bg-slate-50 dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-700 p-4 rounded-xl">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">Monthly Cost (CHF 12/bed)</span>
                        <span className="font-black text-slate-900 dark:text-white text-lg">CHF {Math.max(1, totalBeds) * 12}.00</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Billed Annually (Swiss SaaS Contract)
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Includes MWST 8.1%
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-5 h-5 text-slate-400" />
                      <h3 className="font-bold text-slate-900 dark:text-white">Payment Method</h3>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Powered securely by Stripe</p>
                    
                    {loadingCards ? (
                      <div className="flex-1 flex items-center justify-center p-6 border-2 border-dashed border-slate-100 dark:border-zinc-800/80 rounded-xl mb-4">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                      </div>
                    ) : cards.length > 0 ? (
                      <div className="flex-1 flex flex-col gap-3 mb-4">
                        {cards.map((card, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-6 bg-white dark:bg-zinc-800 rounded border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-black uppercase text-slate-600 dark:text-zinc-300">{card.brand}</span>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">•••• {card.last4}</p>
                                <p className="text-xs text-slate-500 dark:text-zinc-400">Expires {card.exp_month}/{card.exp_year}</p>
                              </div>
                            </div>
                            {idx === 0 && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">Default</span>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 dark:border-zinc-800/80 rounded-xl mb-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No payment method added yet.</p>
                        <p className="text-xs text-slate-400 mt-1">Add a card to smoothly transition after your pilot.</p>
                      </div>
                    )}
                    
                    <a href="/api/setup-card" className="w-full py-2.5 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-900 dark:text-white text-sm font-bold rounded-xl transition-colors border border-slate-200 dark:border-zinc-800 flex items-center justify-center">
                      Add Payment Method
                    </a>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-slate-400" />
                      Billing History
                    </h3>
                    <a href="/api/customer-portal" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">View all in Stripe</a>
                  </div>
                  <div className="p-0 flex flex-col">
                    {loadingInvoices ? (
                      <div className="p-12 flex justify-center items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                      </div>
                    ) : invoices.length > 0 ? (
                      <div className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                        {invoices.map((inv: any) => (
                          <div key={inv.id} className="p-4 md:p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                <Receipt className="w-5 h-5 text-blue-500" />
                              </div>
                              <div>
                                <p className="font-bold text-sm text-slate-900 dark:text-white">
                                  {(inv.amount_paid / 100).toLocaleString('en-CH', { style: 'currency', currency: inv.currency.toUpperCase() })}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                  {new Date(inv.created * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <a 
                              href={inv.hosted_invoice_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="px-4 py-2 text-xs font-bold bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                            >
                              Download PDF
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 flex flex-col items-center justify-center text-center">
                        <Receipt className="w-12 h-12 text-slate-200 dark:text-zinc-800 mb-3" />
                        <h4 className="font-bold text-slate-900 dark:text-white mb-1">No invoices yet</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">Once your pilot ends and your annual subscription begins, your invoices will appear here.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "general" && (
              <div className="animate-fade-in space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-navy dark:text-zinc-100">Facility Profile</h2>
                  <p className="text-sm font-medium text-text-secondary dark:text-zinc-400 mt-1">Manage your organization's core details.</p>
                </div>
                
                <div className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Facility Name</label>
                    <input 
                      type="text" 
                      value={settings.facilityName}
                      onChange={(e) => setSettings({...settings, facilityName: e.target.value})}
                      className="w-full bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Timezone</label>
                    <select 
                      value={settings.timezone}
                      onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                      className="w-full bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none shadow-sm"
                    >
                      <option value="Europe/Berlin">Central European Time (CET)</option>
                      <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                      <option value="America/New_York">Eastern Standard Time (EST)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="animate-fade-in space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-navy dark:text-zinc-100">Theme & Appearance</h2>
                  <p className="text-sm font-medium text-text-secondary dark:text-zinc-400 mt-1">Customize the look and feel of the management dashboard.</p>
                </div>
                
                <div className="space-y-6 max-w-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl gap-4">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Theme Preference</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-0.5">Switch between Light and Dark mode.</p>
                    </div>
                    <div className="grid grid-cols-2 w-full sm:w-[240px] bg-slate-200/70 dark:bg-zinc-950 p-1 rounded-xl border border-slate-300/50 dark:border-zinc-800 shrink-0">
                      <button 
                        onClick={() => setTheme('light')}
                        className={`w-full text-center px-2 py-2 rounded-lg text-xs font-bold transition-all ${theme === 'light' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'}`}
                      >
                        Light Mode
                      </button>
                      <button 
                        onClick={() => setTheme('dark')}
                        className={`w-full text-center px-2 py-2 rounded-lg text-xs font-bold transition-all ${theme === 'dark' ? 'bg-slate-900 dark:bg-zinc-800 text-white dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'}`}
                      >
                        Dark Mode
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "alerts" && (
              <div className="animate-fade-in space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Alert Thresholds</h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-500 dark:text-zinc-400 mt-1">Configure when the system generates automatic escalations.</p>
                </div>

                <div className="space-y-4 max-w-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl gap-4">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Missing Visit Alert</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-500 dark:text-zinc-400 mt-0.5">Trigger an escalation if a client is not seen by this time.</p>
                    </div>
                    <input 
                      type="time" 
                      value={settings.alertTime}
                      onChange={(e) => setSettings({...settings, alertTime: e.target.value})}
                      className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 dark:text-white shadow-sm w-full sm:w-auto"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl gap-4">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Family Notifications</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-500 dark:text-zinc-400 mt-0.5">Send a push notification to family when an escalation is resolved.</p>
                    </div>
                    <button 
                      onClick={() => setSettings({...settings, notifyFamily: !settings.notifyFamily})}
                      className={`transition-colors self-start sm:self-auto ${settings.notifyFamily ? "text-primary" : "text-slate-300"}`}
                    >
                      {settings.notifyFamily ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl gap-4">
                    <div>
                      <label className="block font-bold text-slate-900 dark:text-white text-sm">Heart Rate Threshold (BPM)</label>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-500 dark:text-zinc-400 mt-0.5">Alert if heart rate goes outside this range.</p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <input type="number" defaultValue="45" className="w-20 px-3 py-1.5 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm text-center" />
                      <span className="text-sm font-medium text-slate-400">to</span>
                      <input type="number" defaultValue="120" className="w-20 px-3 py-1.5 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm text-center" />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl gap-4">
                    <div>
                      <label className="block font-bold text-slate-900 dark:text-white text-sm">Missed Medication Window</label>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-500 dark:text-zinc-400 mt-0.5">Hours before escalation is generated.</p>
                    </div>
                    <input type="number" defaultValue="2" className="w-20 px-3 py-1.5 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm self-start sm:self-auto text-center" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "staff" && (
              <div className="animate-fade-in space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-navy dark:text-zinc-100">Staff & Roles</h2>
                    <p className="text-sm font-medium text-text-secondary dark:text-zinc-400 mt-1">Manage dashboard access for your team.</p>
                  </div>
                  <button 
                    onClick={() => setIsStaffModalOpen(true)}
                    className="px-4 py-2 bg-slate-900 dark:bg-zinc-800 text-white dark:text-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-700 rounded-xl text-sm font-bold shadow-sm transition-all"
                  >
                    + Invite
                  </button>
                </div>
                
                {loadingStaff ? (
                  <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
                ) : (
                  <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                    {/* Active Staff */}
                    {staff.map((s, idx) => (
                      <div key={s.id} className={`flex items-center justify-between p-4 bg-white dark:bg-[#0a0a0a] ${idx !== staff.length - 1 || invites.length > 0 ? 'border-b border-slate-100 dark:border-zinc-800/50' : ''}`}>
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{s.full_name}</p>
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            s.role === 'admin' 
                              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                          }`}>{s.role}</span>
                        </div>
                        <button 
                          onClick={() => handleRevokeStaff(s.id, 'active')}
                          disabled={isRevoking === s.id}
                          className="text-xs text-red-500 hover:text-red-700 font-bold"
                        >
                          {isRevoking === s.id ? 'Revoking...' : 'Revoke'}
                        </button>
                      </div>
                    ))}

                    {/* Pending Invites */}
                    {invites.map((inv, idx) => (
                      <div key={inv.id} className={`flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900/30 ${idx !== invites.length - 1 ? 'border-b border-slate-100 dark:border-zinc-800/50' : ''}`}>
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-sm text-slate-500 dark:text-zinc-400">{inv.email}</p>
                          <span className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 rounded-md text-[10px] font-black uppercase tracking-wider">Pending ({inv.role})</span>
                        </div>
                        <button 
                          onClick={() => handleRevokeStaff(inv.id, 'invite')}
                          disabled={isRevoking === inv.id}
                          className="text-xs text-red-400 hover:text-red-600 font-medium"
                        >
                          {isRevoking === inv.id ? 'Canceling...' : 'Cancel'}
                        </button>
                      </div>
                    ))}

                    {staff.length === 0 && invites.length === 0 && (
                      <div className="p-8 text-center text-slate-500 text-sm">No staff found.</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "export" && (
              <div className="animate-fade-in space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Data & Export</h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-500 dark:text-zinc-400 mt-1">Export facility and resident data for compliance or offline backup.</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Resident Care Records</h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-500 dark:text-zinc-400 mt-1">Download complete timeline histories.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto shrink-0 mt-1 sm:mt-0">
                      <button 
                        onClick={() => handleExport('records', 'pdf')}
                        disabled={isExporting !== null}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-800 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900 dark:bg-zinc-900/50 dark:hover:bg-slate-800/50 dark:bg-zinc-900/50 transition-colors shadow-sm btn-press disabled:opacity-50 w-full sm:w-auto"
                      >
                        {isExporting === 'records-pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Export PDF
                      </button>
                      <button 
                        onClick={() => handleExport('records', 'csv')}
                        disabled={isExporting !== null}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-800 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900 dark:bg-zinc-900/50 dark:hover:bg-slate-800/50 dark:bg-zinc-900/50 transition-colors shadow-sm btn-press disabled:opacity-50 w-full sm:w-auto"
                      >
                        {isExporting === 'records-csv' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Export CSV
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Staff Audit Logs</h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-500 dark:text-zinc-400 mt-1">Security logs showing who accessed what.</p>
                    </div>
                    <button 
                      onClick={() => handleExport('logs', 'csv')}
                      disabled={isExporting !== null}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-800 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900 dark:bg-zinc-900/50 dark:hover:bg-slate-800/50 dark:bg-zinc-900/50 transition-colors shadow-sm btn-press disabled:opacity-50 w-full sm:w-auto shrink-0 mt-1 sm:mt-0"
                    >
                      {isExporting === 'logs-csv' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Export CSV
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Action Footer */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-zinc-800 flex justify-end">
              <button 
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-2.5 text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-sm btn-press w-full sm:w-auto justify-center ${
                  saved ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "bg-slate-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-slate-800"
                }`}
              >
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? "Saved" : "Save changes"}
              </button>
            </div>

          </div>
      </div>
    </main>

      {/* Staff Invite Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-xl border border-slate-200 dark:border-zinc-800 animate-fade-in-up">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Invite Staff</h3>
              <button 
                onClick={() => setIsStaffModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleInviteStaff} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={staffInviteEmail}
                  onChange={e => setStaffInviteEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                  placeholder="colleague@alpinahealth.ch"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Role</label>
                <select 
                  value={staffInviteRole}
                  onChange={e => setStaffInviteRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                >
                  <option value="caregiver">Caregiver (Limited Access)</option>
                  <option value="admin">Facility Admin (Full Access)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSendingInvite}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  {isSendingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
