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
      <nav className="w-full max-w-[640px] bg-surface/90 backdrop-blur-xl border-t border-border/50 flex items-center justify-around py-2 pointer-events-auto shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe">
        {links.map((link) => {
        const isActive = pathname === link.href;
        
        return (
          <Link 
            key={link.name}
            href={link.href}
            className={`flex flex-col items-center gap-1 p-2 min-w-[60px] rounded-xl transition-transform active:scale-90 ${
              isActive 
                ? "text-primary" 
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {isActive ? (
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/30 animate-spring-pop">
                {link.icon}
              </div>
            ) : (
              <div className="w-10 h-10 flex items-center justify-center">
                {link.icon}
              </div>
            )}
            <span className={`text-[10px] font-semibold mt-0.5 transition-colors ${isActive ? "text-primary" : ""}`}>{link.name}</span>
          </Link>
        );
      })}
      </nav>
    </div>
  );
}
