"use client";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { User, Settings, Shield, Bell, ChevronRight, LogOut, Loader2, ArrowLeft } from "lucide-react";
import { useFamilyResident } from "@/hooks/useFamilyResident";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const { residentInfo, loading: residentLoading } = useFamilyResident();
  const [userName, setUserName] = useState("Family Member");
  const supabase = createClient();

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
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-black shadow-md">
            {userName[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 truncate max-w-[200px]">{userName}</h2>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              {residentLoading ? <Loader2 className="w-3 h-3 animate-spin inline-block text-slate-400" /> : 
                `Connected to ${residentInfo?.first_name || 'Resident'}`}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <button disabled className="w-full flex items-center justify-between p-4 bg-slate-50/50 opacity-60 border-b border-slate-200 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="font-bold text-slate-900 text-sm">Notification Preferences</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">Coming Soon</span>
          </button>
          <button disabled className="w-full flex items-center justify-between p-4 bg-slate-50/50 opacity-60 border-b border-slate-200 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-500" />
              <span className="font-bold text-slate-900 text-sm">Privacy & Security</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">Coming Soon</span>
          </button>
          <button disabled className="w-full flex items-center justify-between p-4 bg-slate-50/50 opacity-60 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-slate-500" />
              <span className="font-bold text-slate-900 text-sm">Account Settings</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">Coming Soon</span>
          </button>
        </div>

        <div className="pt-6 border-t border-slate-200/50">
          <SignOutButton className="w-full flex items-center justify-center gap-2 p-4 bg-white border border-rose-200 text-rose-500 rounded-2xl font-bold hover:bg-rose-50 transition-colors shadow-sm btn-press">
            <LogOut className="w-5 h-5" />
            Sign Out
          </SignOutButton>
        </div>
      </main>
    </div>
  );
}
