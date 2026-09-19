"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function AddCardButton() {
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/setup-card", {
        method: "POST",
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to open card setup");
      }
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSetup}
      disabled={loading}
      className="w-full py-2.5 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-900 dark:text-white text-sm font-bold rounded-xl transition-colors border border-slate-200 dark:border-zinc-800 cursor-pointer flex items-center justify-center gap-2"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Payment Method"}
    </button>
  );
}
