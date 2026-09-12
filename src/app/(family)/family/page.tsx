"use client";

import { UpdatesFeed } from "@/components/family/UpdatesFeed";
import { useFamilyResident } from "@/hooks/useFamilyResident";

export default function FamilyDashboard() {
  const { residentInfo, loading } = useFamilyResident();
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  if (loading) return <div className="min-h-screen bg-surface-alt" />;

  const firstName = residentInfo?.first_name || "your loved one";

  return (
    <div className="relative min-h-full">
      <main className="px-5 py-8 pb-8">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-navy tracking-tight">
            How {firstName} is doing
          </h1>
          <p className="text-sm font-medium text-text-muted mt-1.5">{today}</p>
        </div>

        <div className="mt-8 space-y-5">
          <div className="animate-fade-in-up delay-100">
            <UpdatesFeed />
          </div>
        </div>
      </main>
    </div>
  );
}
