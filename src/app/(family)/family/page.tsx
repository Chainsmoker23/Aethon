import { ResidentOverview } from "@/components/family/ResidentOverview";
import { UpdatesFeed } from "@/components/family/UpdatesFeed";
import { MessagingInterface } from "@/components/family/MessagingInterface";

export default function FamilyDashboard() {
  const firstName = "Eleanor";
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-screen bg-surface-alt relative overflow-hidden">
      {/* Decorative gradient blur in background */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-primary-light/50 to-transparent -z-10" />

      <main className="max-w-[640px] mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-navy tracking-tight">
            How {firstName} is doing
          </h1>
          <p className="text-sm font-medium text-text-muted mt-1.5">{today}</p>
        </div>

        <div className="mt-8 space-y-5">
          <div className="animate-fade-in-up delay-100">
            <ResidentOverview />
          </div>
          <div className="animate-fade-in-up delay-200">
            <UpdatesFeed />
          </div>
          <div className="animate-fade-in-up delay-300">
            <MessagingInterface />
          </div>
        </div>

        <div className="mt-10 text-center animate-fade-in delay-400">
          <button className="text-sm font-semibold text-text-muted hover:text-danger transition-colors">
            Sign out
          </button>
        </div>
      </main>
    </div>
  );
}
