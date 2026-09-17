"use client";

import { useState, useEffect } from "react";
import { Settings, Shield, Bell, Download, Building, Users, ToggleLeft, ToggleRight, Save, Check, Loader2, LogOut, User, AlertTriangle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [userName, setUserName] = useState("Staff User");
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || "Staff User");
      }
    }
    getUser();
  }, []);

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
  ];

  return (
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
          <SignOutButton className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors shrink-0">
            <LogOut className="w-3 h-3" />
            Sign Out
          </SignOutButton>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 animate-fade-in-up delay-100">
          
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

          {/* Settings Content Area */}
          <div className="flex-1 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 md:p-8 min-h-[500px] shadow-sm">
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
                    <div className="flex bg-slate-200/70 dark:bg-zinc-950 p-1 rounded-xl border border-slate-300/50 dark:border-zinc-800">
                      <button 
                        onClick={() => setTheme('light')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${theme === 'light' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'}`}
                      >
                        Light Mode
                      </button>
                      <button 
                        onClick={() => setTheme('dark')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${theme === 'dark' ? 'bg-slate-900 dark:bg-zinc-800 text-white dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'}`}
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
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Staff & Roles</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-500 dark:text-zinc-400 mt-1">Manage dashboard access for your team.</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-sm btn-press">
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Invite Staff</span>
                  </button>
                </div>
                
                <div className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                     <span className="text-sm font-bold text-slate-900 dark:text-white">Dr. Anna Weber</span>
                     <span className="text-xs font-bold text-primary bg-indigo-50 px-2 py-1 rounded-md">Admin</span>
                  </div>
                  <div className="px-5 py-4 flex items-center justify-between bg-white dark:bg-[#0a0a0a]">
                     <span className="text-sm font-bold text-slate-900 dark:text-white">Marcus Schmidt</span>
                     <span className="text-xs font-bold text-slate-500 dark:text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-900 px-2 py-1 rounded-md border border-slate-200 dark:border-zinc-800">Caregiver</span>
                  </div>
                </div>
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
  );
}
