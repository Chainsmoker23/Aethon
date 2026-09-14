"use client";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { User, Settings, Shield, Bell, ChevronRight, LogOut, Loader2, ArrowLeft, Mail, Smartphone, Lock, Eye, EyeOff, Globe } from "lucide-react";
import { useFamilyResident } from "@/hooks/useFamilyResident";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`w-12 h-6 rounded-full flex items-center transition-colors px-1 ${enabled ? 'bg-sky-500' : 'bg-slate-300'}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );
}

export default function ProfilePage() {
  const { residentInfo, loading: residentLoading } = useFamilyResident();
  const [userName, setUserName] = useState("Family Member");
  const supabase = createClient();

  // Mock states for settings
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(true);
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email || "Family Member");
      }
    }
    loadUser();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-5 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <Link href="/family" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Family Profile</h1>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
          <User className="w-5 h-5 text-sky-600" />
        </div>
      </div>
      
      <main className="flex-1 p-6 space-y-6 pb-32">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-black shadow-md shrink-0">
            {userName[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-slate-900 truncate">{userName}</h2>
            <p className="text-sm font-medium text-slate-500 mt-0.5 truncate">
              {residentLoading ? <Loader2 className="w-3 h-3 animate-spin inline-block text-slate-400" /> : 
                `Connected to ${residentInfo?.first_name || 'Resident'}`}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Notification Preferences */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 border-b border-slate-200 transition-colors active:bg-slate-100">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-sky-500" />
                  <span className="font-bold text-slate-900 text-sm">Notification Preferences</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl border-t-0 p-0 overflow-hidden flex flex-col bg-slate-50">
              <SheetHeader className="p-6 bg-white border-b border-slate-200 sticky top-0 z-10">
                <SheetTitle className="text-xl font-black text-slate-900 text-left">Notifications</SheetTitle>
                <p className="text-sm font-medium text-slate-500 text-left mt-1">Manage how you receive updates about your loved one.</p>
              </SheetHeader>
              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Push Notifications</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Instant alerts on your device</p>
                    </div>
                  </div>
                  <ToggleSwitch enabled={pushEnabled} onChange={setPushEnabled} />
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Email Digests</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Daily summary of activities</p>
                    </div>
                  </div>
                  <ToggleSwitch enabled={emailEnabled} onChange={setEmailEnabled} />
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Bell className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">SMS Alerts</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">For urgent updates only</p>
                    </div>
                  </div>
                  <ToggleSwitch enabled={smsEnabled} onChange={setSmsEnabled} />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Privacy & Security */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 border-b border-slate-200 transition-colors active:bg-slate-100">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  <span className="font-bold text-slate-900 text-sm">Privacy & Security</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl border-t-0 p-0 overflow-hidden flex flex-col bg-slate-50">
              <SheetHeader className="p-6 bg-white border-b border-slate-200 sticky top-0 z-10">
                <SheetTitle className="text-xl font-black text-slate-900 text-left">Security</SheetTitle>
                <p className="text-sm font-medium text-slate-500 text-left mt-1">Keep your account safe and secure.</p>
              </SheetHeader>
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm">Change Password</h3>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all" />
                    </div>
                    <div className="space-y-1.5 relative">
                      <label className="text-xs font-bold text-slate-500">New Password</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors active:scale-[0.98]">
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Lock className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Two-Factor Auth</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Require code on login</p>
                    </div>
                  </div>
                  <ToggleSwitch enabled={twoFactorEnabled} onChange={setTwoFactorEnabled} />
                </div>

              </div>
            </SheetContent>
          </Sheet>

          {/* Account Settings */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors active:bg-slate-100">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-violet-500" />
                  <span className="font-bold text-slate-900 text-sm">Account Settings</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl border-t-0 p-0 overflow-hidden flex flex-col bg-slate-50">
              <SheetHeader className="p-6 bg-white border-b border-slate-200 sticky top-0 z-10">
                <SheetTitle className="text-xl font-black text-slate-900 text-left">Account Info</SheetTitle>
                <p className="text-sm font-medium text-slate-500 text-left mt-1">Manage your personal details.</p>
              </SheetHeader>
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Display Name</label>
                    <input type="text" defaultValue={userName} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                    <input type="email" defaultValue="user@example.com" disabled className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed opacity-70" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                    <input type="tel" placeholder="+41 79 123 45 67" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Language</label>
                  <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 p-3 border-b border-slate-100">
                      <Globe className="w-5 h-5 text-slate-400" />
                      <select className="flex-1 bg-transparent text-sm font-bold text-slate-900 outline-none cursor-pointer">
                        <option>English</option>
                        <option>Deutsch (Schweiz)</option>
                        <option>Français</option>
                        <option>Italiano</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <button className="w-full py-3.5 bg-sky-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-600/20 hover:bg-sky-700 transition-colors active:scale-[0.98]">
                  Save Changes
                </button>

              </div>
            </SheetContent>
          </Sheet>

        </div>

        <div className="pt-6 border-t border-slate-200/50">
          <SignOutButton className="w-full flex items-center justify-center gap-2 p-4 bg-white border border-rose-200 text-rose-500 rounded-2xl font-bold hover:bg-rose-50 transition-colors shadow-sm active:scale-[0.98]">
            <LogOut className="w-5 h-5" />
            Sign Out
          </SignOutButton>
        </div>
      </main>
    </div>
  );
}
