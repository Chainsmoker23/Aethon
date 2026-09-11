import { Calendar, CheckCircle2, Star } from "lucide-react";

export function UpdatesFeed() {
  const visits = [
    { date: "Today, 10:15 AM", type: "Morning check", tasks: "Vitals, medication, breakfast" },
    { date: "Yesterday, 4:00 PM", type: "Evening round", tasks: "Medication, mobility exercise" },
    { date: "Monday", type: "GP visit", tasks: "Blood pressure review, medication adjustment" },
  ];

  const goals = [
    "Walk to the garden and back each morning",
    "Eat breakfast independently",
  ];

  return (
    <>
      <div className="bg-surface rounded-2xl p-5 shadow-sm border border-border/50 border-l-[6px] border-l-primary card-hover">
        <h2 className="text-lg font-bold text-navy">Recent visits</h2>
        <div className="mt-4 space-y-4">
          {visits.map((v, i) => (
            <div key={i} className="flex items-start gap-4 p-2 rounded-lg hover:bg-surface-alt transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-navy">{v.date}</span>
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">· {v.type}</span>
                </div>
                <p className="text-sm text-text-secondary mt-1">{v.tasks}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-2xl p-5 shadow-sm border border-border/50 border-l-[6px] border-l-warning card-hover mt-5">
        <h2 className="text-lg font-bold text-navy">What matters to Eleanor</h2>
        <div className="mt-4 space-y-3">
          {goals.map((g, i) => (
            <div key={i} className="flex items-start gap-3">
              <Star className="w-4 h-4 text-warning mt-0.5 shrink-0" fill="currentColor" />
              <p className="text-sm font-medium text-text-secondary leading-relaxed">{g}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
