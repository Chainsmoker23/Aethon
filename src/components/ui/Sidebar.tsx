"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, AlertTriangle, Settings, LogOut, Menu, X } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function Sidebar() {
  const pathname = usePathname();
  const [escalationCount, setEscalationCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState("Staff User");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // Fetch escalation badge count
      const { count } = await supabase
        .from('escalations')
        .select('*', { count: 'exact', head: true })
        .eq('is_resolved', false);
      if (count !== null) setEscalationCount(count);

      // Fetch actual user name and avatar
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || "Staff User");
        if (user.user_metadata?.avatar_url) {
          setAvatarUrl(user.user_metadata.avatar_url);
        }
      }
    }
    fetchData();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const links = [
    { name: "Overview", href: "/management", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Clients", href: "/management/clients", icon: <Users className="w-5 h-5" /> },
    { name: "Escalations", href: "/management/escalations", icon: <AlertTriangle className="w-5 h-5" />, badge: escalationCount },
    { name: "Settings", href: "/management/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'S';

  const navContent = (
    <>
      {/* Brand */}
      <div className="h-14 lg:h-[88px] flex items-center justify-between px-4 lg:px-8 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] shrink-0">
        <div className="hidden lg:flex items-center gap-3">
          <img 
            src="/logo.jpg" 
            alt="Aethon Health Logo" 
            className="w-8 h-8 rounded-lg object-contain bg-white dark:bg-[#0a0a0a] shadow-sm border border-slate-200 dark:border-zinc-800" 
          />
          <span className="font-bold text-slate-900 dark:text-white tracking-tight">Management</span>
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden ml-auto w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors"
          aria-label="Close navigation menu"
        >
          <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>
      </div>
      
      {/* Nav */}
      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {links.map((link, i) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm transition-all ${
                isActive 
                  ? "bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md shadow-indigo-500/20" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:bg-zinc-900 dark:hover:bg-slate-800 dark:bg-zinc-900 hover:text-slate-900 dark:text-white"
              } ${mobileOpen ? `opacity-0 animate-slide-down stagger-${i + 1}` : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              {link.icon}
              <span className="flex-1">{link.name}</span>
              {link.badge && link.badge > 0 ? (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full min-w-[24px] text-center ${
                  isActive ? "bg-white dark:bg-[#0a0a0a]/20 text-white" : "bg-rose-500 text-white shadow-sm"
                }`}>
                  {link.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 m-4 rounded-2xl shrink-0 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={userName} className="w-9 h-9 rounded-xl object-cover shadow-sm shrink-0 border border-slate-200 dark:border-zinc-800" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0 pr-2">
            <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate leading-tight">{userName}</p>
            <p className="text-slate-500 dark:text-zinc-400 text-[9px] uppercase tracking-wider font-bold mt-0.5">Management</p>
          </div>
        </div>
        <SignOutButton className="w-8 h-8 rounded-full bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 dark:hover:text-rose-500 dark:hover:border-rose-900 transition-colors shadow-sm shrink-0 group">
          <LogOut className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        </SignOutButton>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-12 bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-zinc-800 z-50 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Aethon Health Logo" className="w-6 h-6 rounded-md object-contain border border-slate-200 dark:border-zinc-800" />
          <span className="font-bold text-slate-900 dark:text-white tracking-tight text-sm">Management</span>
        </div>
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt={userName} className="w-7 h-7 rounded-lg object-cover shadow-sm border border-slate-200 dark:border-zinc-800" />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-[10px] shadow-sm">
              {initials}
            </div>
          )}
          <SignOutButton className="w-7 h-7 rounded-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 hover:text-rose-600 transition-colors shadow-sm">
            <LogOut className="w-3.5 h-3.5" />
          </SignOutButton>
        </div>
      </div>

      {/* Mobile Bottom Nav — visible below lg */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#0a0a0a] border-t border-slate-200 dark:border-zinc-800 flex items-center justify-around pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`relative flex flex-col items-center justify-center w-full py-3 gap-1 transition-colors ${
                isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600 dark:text-slate-400"
              }`}
            >
              <div className="relative">
                {link.icon}
                {link.badge && link.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                    {link.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] font-bold ${isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-500 dark:text-zinc-400"}`}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Sidebar — desktop only */}
      <aside 
        className="hidden lg:flex static top-0 left-0 z-50 h-full w-56 bg-white dark:bg-[#0a0a0a] border-r border-slate-200 dark:border-zinc-800 flex-col"
        role="navigation"
        aria-label="Main navigation"
      >
        {navContent}
      </aside>
    </>
  );
}
