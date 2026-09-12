"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, AlertTriangle, Settings, LogOut } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function Sidebar() {
  const pathname = usePathname();
  const [escalationCount, setEscalationCount] = useState(0);
  const supabase = createClient();

  // Fetch real unread escalation count for the badge!
  useEffect(() => {
    async function fetchBadge() {
      const { count } = await supabase
        .from('escalations')
        .select('*', { count: 'exact', head: true })
        .eq('is_resolved', false);
      if (count !== null) setEscalationCount(count);
    }
    fetchBadge();
  }, []);

  const links = [
    { name: "Overview", href: "/management", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Clients", href: "/management/clients", icon: <Users className="w-5 h-5" /> },
    { name: "Escalations", href: "/management/escalations", icon: <AlertTriangle className="w-5 h-5" />, badge: escalationCount },
    { name: "Settings", href: "/management/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-72 bg-white/40 backdrop-blur-2xl border-r border-white/50 hidden lg:flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 relative">
      {/* Brand */}
      <div className="h-[88px] flex items-center px-8 border-b border-white/50 bg-white/20">
        <h1 className="text-3xl font-extrabold text-navy tracking-tight flex items-center gap-2">
          Aethon<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-indigo-500 font-light">Pro</span>
        </h1>
      </div>
      
      {/* Nav */}
      <nav className="flex-1 py-8 px-5 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                isActive 
                  ? "bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-lg shadow-indigo-500/25" 
                  : "text-text-secondary hover:bg-white/60 hover:text-navy hover:shadow-sm"
              }`}
            >
              {link.icon}
              <span className="flex-1">{link.name}</span>
              {link.badge && link.badge > 0 ? (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full min-w-[24px] text-center ${
                  isActive ? "bg-white/20 text-white" : "bg-gradient-to-r from-rose-500 to-orange-400 text-white shadow-sm shadow-rose-500/40 pulse-dot"
                }`}>
                  {link.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-5 border-t border-white/50 bg-white/30 m-5 rounded-3xl shadow-inner">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/30">
            AW
          </div>
          <div>
            <p className="font-extrabold text-sm text-navy">Dr. Anna Weber</p>
            <p className="text-text-secondary text-[11px] uppercase tracking-wider font-bold mt-0.5">Management</p>
          </div>
        </div>
        <SignOutButton className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold text-rose-600 bg-white/60 border border-white/80 hover:bg-rose-50 hover:border-rose-100 transition-all btn-press shadow-sm shadow-black/5">
          <LogOut className="w-4 h-4" />
          Secure Sign Out
        </SignOutButton>
      </div>
    </aside>
  );
}
