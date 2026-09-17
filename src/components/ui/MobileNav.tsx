"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Activity, User } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/family", icon: <Home className="w-5 h-5" /> },
    { name: "Vitals", href: "/family/vitals", icon: <Activity className="w-5 h-5" /> },
    { name: "Messages", href: "/family/messages", icon: <MessageSquare className="w-5 h-5" /> },
    { name: "Profile", href: "/family/profile", icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav className="w-full max-w-[640px] bg-white dark:bg-[#0a0a0a] border-t border-slate-200 dark:border-zinc-800 flex items-center justify-around pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.02)] pointer-events-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          
          return (
            <Link 
              key={link.name}
              href={link.href}
              className={`relative flex flex-col items-center justify-center w-full py-3 gap-1 transition-colors active:scale-95 ${
                isActive ? "text-sky-600" : "text-slate-400 hover:text-slate-600 dark:text-slate-400"
              }`}
            >
              <div className="relative">
                {link.icon}
              </div>
              <span className={`text-[10px] font-bold ${isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-500 dark:text-zinc-400"}`}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
