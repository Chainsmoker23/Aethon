import { CheckCircle2, Clock, XCircle } from "lucide-react";

export function ResidentOverview() {
  const medications = [
    { name: "Metformin", dose: "500mg", time: "08:00", status: "taken" },
    { name: "Lisinopril", dose: "10mg", time: "08:00", status: "taken" },
    { name: "Aspirin", dose: "100mg", time: "12:00", status: "due" },
    { name: "Simvastatin", dose: "20mg", time: "20:00", status: "due" },
  ];

  // 14-day wellbeing dots (mood 1-5, 0 = no entry)
  const wellbeing = [4, 5, 3, 4, 4, 5, 0, 4, 3, 5, 4, 4, 5, 4];
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S", "M", "T", "W", "T", "F", "S", "S"];

  const moodColor = (v: number) => {
    if (v === 0) return "bg-transparent border-2 border-border";
    if (v >= 4) return "bg-success shadow-sm shadow-success/30";
    if (v === 3) return "bg-warning shadow-sm shadow-warning/30";
    return "bg-danger shadow-sm shadow-danger/30";
  };

  const faces = ["", "😟", "😕", "😐", "🙂", "😊"];
  const todayMood = wellbeing[wellbeing.length - 1];

  return (
    <>
      <div className="bg-surface rounded-2xl p-5 shadow-sm border border-border/50 border-l-[6px] border-l-primary card-hover">
        <h2 className="text-lg font-bold text-navy">Medications today</h2>
        <div className="mt-4 space-y-3">
          {medications.map((m) => (
            <div key={m.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-alt transition-colors">
              <div>
                <span className="text-sm font-bold text-navy">{m.name}</span>
                <span className="text-sm font-medium text-text-muted ml-2">{m.dose}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {m.status === "taken" && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-xs font-bold text-success uppercase tracking-wider">Taken</span>
                  </>
                )}
                {m.status === "due" && (
                  <>
                    <Clock className="w-4 h-4 text-text-muted" />
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Due {m.time}</span>
                  </>
                )}
                {m.status === "missed" && (
                  <>
                    <XCircle className="w-4 h-4 text-danger" />
                    <span className="text-xs font-bold text-danger uppercase tracking-wider">Not taken</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs font-medium text-text-muted italic mt-4 px-2">
          Reference only. Not a medication administration record.
        </p>
      </div>

      <div className="bg-surface rounded-2xl p-5 shadow-sm border border-border/50 border-l-[6px] border-l-[#8b5cf6] card-hover mt-5">
        <h2 className="text-lg font-bold text-navy">Recent wellbeing</h2>
        {todayMood > 0 && (
          <div className="text-center my-6">
            <span className="text-6xl animate-fade-in-up drop-shadow-sm">{faces[todayMood]}</span>
          </div>
        )}
        <div className="flex items-end justify-between gap-1 mt-4 px-2">
          {wellbeing.map((v, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-3.5 h-3.5 rounded-full transition-transform hover:scale-125 ${moodColor(v)}`} />
              <span className="text-[10px] font-bold text-text-muted">{dayLabels[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
