"use client";

import { useState } from "react";
import { Settings, Shield, Bell, Download, Building, Users, ToggleLeft, ToggleRight, Save, Check } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);
  
  // Mock settings state
  const [settings, setSettings] = useState({
    facilityName: "Aethon Pro Care Center",
    timezone: "Europe/Berlin",
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
    { id: "staff", label: "Staff & Roles", icon: <Shield className="w-4 h-4" /> },
    { id: "alerts", label: "Alert Thresholds", icon: <Bell className="w-4 h-4" /> },
    { id: "export", label: "Data & Export", icon: <Download className="w-4 h-4" /> },
  ];

  return (
    <div className="relative min-h-screen flex-1 overflow-hidden bg-slate-50/50 z-0">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] animate-blob-1" />
        <div className="absolute top-[10%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[120px] animate-blob-2" />
        <div className="absolute bottom-[-20%] left-[20%] w-[800px] h-[800px] rounded-full blur-[150px] animate-blob-3" />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full blur-[100px] animate-blob-4" />
      </div>

      <main className="p-6 lg:p-10 space-y-8 overflow-y-auto h-full max-w-[1200px] mx-auto w-full relative z-10">
        
        <div className="flex items-center gap-3 animate-fade-in-up">
          <h1 className="text-4xl font-extrabold text-navy tracking-tight drop-shadow-sm">
            Settings
          </h1>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Settings className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 animate-fade-in-up delay-100">
          
          {/* Settings Sidebar */}
          <div className="w-full lg:w-64 shrink-0 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === tab.id 
                    ? "bg-white border border-white/80 text-primary shadow-sm" 
                    : "text-text-secondary hover:bg-white/40 hover:text-navy"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Settings Content Area */}
          <div className="flex-1 glass-panel-heavy rounded-3xl p-8 min-h-[500px]">
            {activeTab === "general" && (
              <div className="animate-fade-in space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-navy">Facility Profile</h2>
                  <p className="text-sm font-medium text-text-secondary mt-1">Manage your organization's core details.</p>
                </div>
                
                <div className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-sm font-bold text-navy mb-2">Facility Name</label>
                    <input 
                      type="text" 
                      value={settings.facilityName}
                      onChange={(e) => setSettings({...settings, facilityName: e.target.value})}
                      className="w-full bg-white/50 border border-white/80 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-navy mb-2">Timezone</label>
                    <select 
                      value={settings.timezone}
                      onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                      className="w-full bg-white/50 border border-white/80 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                    >
                      <option value="Europe/Berlin">Central European Time (CET)</option>
                      <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                      <option value="America/New_York">Eastern Standard Time (EST)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "alerts" && (
              <div className="animate-fade-in space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-navy">Alert Thresholds</h2>
                  <p className="text-sm font-medium text-text-secondary mt-1">Configure when the system generates automatic escalations.</p>
                </div>

                <div className="space-y-6 max-w-xl">
                  <div className="flex items-center justify-between p-4 bg-white/40 border border-white/60 rounded-2xl">
                    <div>
                      <p className="font-bold text-navy text-sm">Missing Visit Alert</p>
                      <p className="text-xs font-medium text-text-secondary mt-0.5">Trigger an escalation if a client is not seen by this time.</p>
                    </div>
                    <input 
                      type="time" 
                      value={settings.alertTime}
                      onChange={(e) => setSettings({...settings, alertTime: e.target.value})}
                      className="bg-white/80 border border-border rounded-lg px-3 py-1.5 text-sm font-bold text-navy"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/40 border border-white/60 rounded-2xl">
                    <div>
                      <p className="font-bold text-navy text-sm">Family Notifications</p>
                      <p className="text-xs font-medium text-text-secondary mt-0.5">Send a push notification to family when an escalation is resolved.</p>
                    </div>
                    <button 
                      onClick={() => setSettings({...settings, notifyFamily: !settings.notifyFamily})}
                      className={`transition-colors ${settings.notifyFamily ? "text-primary" : "text-text-muted"}`}
                    >
                      {settings.notifyFamily ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "staff" && (
              <div className="animate-fade-in space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-navy">Staff & Roles</h2>
                    <p className="text-sm font-medium text-text-secondary mt-1">Manage dashboard access for your team.</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-sm btn-press">
                    <Users className="w-4 h-4" />
                    Invite Staff
                  </button>
                </div>
                
                <div className="bg-white/40 border border-white/60 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/60 flex items-center justify-between">
                    <span className="text-sm font-bold text-navy">Dr. Anna Weber</span>
                    <span className="text-xs font-bold text-primary bg-primary-light px-2 py-1 rounded-md">Admin</span>
                  </div>
                  <div className="px-5 py-3 flex items-center justify-between opacity-60">
                    <span className="text-sm font-bold text-navy">Marcus Schmidt</span>
                    <span className="text-xs font-bold text-text-muted bg-surface-alt px-2 py-1 rounded-md border border-border">Caregiver</span>
                  </div>
                </div>
              </div>
            )}

            {/* Save Action Footer */}
            <div className="mt-10 pt-6 border-t border-white/50 flex justify-end">
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 bg-navy text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm btn-press"
              >
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? "Saved" : "Save changes"}
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
