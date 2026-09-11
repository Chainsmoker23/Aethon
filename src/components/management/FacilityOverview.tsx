import { Users, Eye, AlertTriangle, FileText } from "lucide-react";

export function FacilityOverview() {
  const stats = [
    { label: "Total clients", value: "42", icon: <Users className="w-5 h-5 text-white" />, gradient: "from-blue-500 to-cyan-400", shadow: "shadow-cyan-500/30", delay: "delay-100" },
    { label: "Seen today", value: "38", icon: <Eye className="w-5 h-5 text-white" />, gradient: "from-emerald-400 to-teal-500", shadow: "shadow-emerald-500/30", delay: "delay-200" },
    { label: "Open escalations", value: "2", icon: <AlertTriangle className="w-5 h-5 text-white" />, gradient: "from-rose-500 to-orange-400", shadow: "shadow-rose-500/30", delay: "delay-300" },
    { label: "Notes this week", value: "127", icon: <FileText className="w-5 h-5 text-white" />, gradient: "from-indigo-500 to-purple-500", shadow: "shadow-indigo-500/30", delay: "delay-400" },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 relative z-10">
      {stats.map((stat) => (
        <div 
          key={stat.label} 
          className={`glass-panel rounded-3xl p-6 card-hover animate-fade-in-up ${stat.delay} overflow-hidden relative`}
        >
          {/* Subtle internal gradient glow */}
          <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 blur-2xl rounded-full`} />
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">{stat.label}</span>
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.shadow}`}>
              {stat.icon}
            </div>
          </div>
          <p className="text-4xl font-black text-navy tracking-tight relative z-10 drop-shadow-sm">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
