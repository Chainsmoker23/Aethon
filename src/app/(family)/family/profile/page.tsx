import { SignOutButton } from "@/components/auth/SignOutButton";
import { User, Settings, Shield, Bell, ChevronRight, LogOut } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-20 px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-navy tracking-tight">Family Profile</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
      </div>
      
      <main className="flex-1 p-6 space-y-6 pb-32">
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-black shadow-md">
            S
          </div>
          <div>
            <h2 className="text-xl font-bold text-navy">Sarah Smith</h2>
            <p className="text-sm font-medium text-text-secondary mt-0.5">Daughter of Eleanor</p>
          </div>
        </div>

        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 hover:bg-surface-alt transition-colors border-b border-border/50">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-text-muted" />
              <span className="font-bold text-navy text-sm">Notification Preferences</span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-surface-alt transition-colors border-b border-border/50">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-text-muted" />
              <span className="font-bold text-navy text-sm">Privacy & Security</span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-surface-alt transition-colors">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-text-muted" />
              <span className="font-bold text-navy text-sm">Account Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        <div className="pt-6 border-t border-border/50">
          <SignOutButton className="w-full flex items-center justify-center gap-2 p-4 bg-white border border-danger/20 text-danger rounded-2xl font-bold hover:bg-danger/5 transition-colors shadow-sm btn-press">
            <LogOut className="w-5 h-5" />
            Sign Out
          </SignOutButton>
        </div>
      </main>
    </div>
  );
}
