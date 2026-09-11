import Link from "next/link";
import { Home, MessageSquare, Activity, User } from "lucide-react";

export function MobileNav() {
  const links = [
    { name: "Home", href: "/family", icon: <Home className="w-5 h-5" />, active: true },
    { name: "Vitals", href: "#", icon: <Activity className="w-5 h-5" />, active: false },
    { name: "Messages", href: "#", icon: <MessageSquare className="w-5 h-5" />, active: false },
    { name: "Profile", href: "#", icon: <User className="w-5 h-5" />, active: false },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-border/50 flex items-center justify-around py-2 z-50">
      {links.map((link) => (
        <Link 
          key={link.name}
          href={link.href}
          className={`flex flex-col items-center gap-1 p-2 min-w-[60px] rounded-xl transition-all ${
            link.active 
              ? "text-primary" 
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          {link.active ? (
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white shadow-sm shadow-primary/20">
              {link.icon}
            </div>
          ) : (
            link.icon
          )}
          <span className={`text-[10px] font-semibold ${link.active ? "text-primary" : ""}`}>{link.name}</span>
        </Link>
      ))}
    </nav>
  );
}
