"use client";

import { UpdatesFeed } from "@/components/family/UpdatesFeed";
import { useFamilyResident } from "@/hooks/useFamilyResident";
import { Heart, MessageCircle, MapPin, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";

export default function FamilyDashboard() {
  const { residentInfo, loading } = useFamilyResident();
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  if (loading) return (
    <div className="relative min-h-full pb-6">
      <main className="px-5 py-6 space-y-6 animate-pulse">
        <div className="bg-white/50 rounded-3xl p-6 h-[140px]" />
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/50 rounded-3xl h-[100px]" />
          <div className="bg-white/50 rounded-3xl h-[100px]" />
        </div>
        <div className="bg-white/50 rounded-3xl h-[200px]" />
      </main>
    </div>
  );

  const firstName = residentInfo?.first_name || "your loved one";
  const initial = firstName.charAt(0);
  
  // Format care stage safely
  const formatCareStage = (stage?: string) => {
    if (!stage) return "Care Plan Active";
    return stage.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="relative min-h-full pb-6">
      <main className="px-5 py-6">

        {/* Premium iOS-style Header Card */}
        <div className="animate-fade-in-up bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-sm mb-6 relative overflow-hidden">
          
          {/* Subtle decorative gradient inside card */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sky-400/10 to-transparent rounded-bl-full" />
          
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-extrabold shadow-md shadow-sky-500/20">
              {initial}
            </div>
            <div>
              <h1 className="text-2xl font-black text-navy tracking-tight leading-tight">
                {firstName}&apos;s Day
              </h1>
              <p className="text-sm font-semibold text-text-muted mt-0.5">{today}</p>
            </div>
          </div>

          {/* Quick Status Pills */}
          <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-2.5 flex items-center gap-2 shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-700">
                {formatCareStage(residentInfo?.care_stage)}
              </span>
            </div>
            <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl px-4 py-2.5 flex items-center gap-2 shrink-0">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span className="text-sm font-bold text-sky-700">
                Room {residentInfo?.room_number || "TBD"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Tiles */}
        <div className="animate-fade-in-up delay-100 grid grid-cols-2 gap-4 mb-8">
          <Link 
            href="/family/messages" 
            className="group bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm hover:bg-white/80 active:scale-95 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-navy">Message Team</span>
          </Link>
          
          <Link 
            href="/family/vitals" 
            className="group bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm hover:bg-white/80 active:scale-95 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6 text-rose-600" />
            </div>
            <span className="text-sm font-bold text-navy">Health & Meds</span>
          </Link>
        </div>

        {/* Timeline Section */}
        <div className="animate-fade-in-up delay-200">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg font-extrabold text-navy">Today's Care Timeline</h2>
          </div>
          <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-2 border border-white/50 shadow-sm">
            <UpdatesFeed />
          </div>
        </div>
      </main>
    </div>
  );
}
