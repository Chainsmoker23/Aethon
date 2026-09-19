"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function AddCardButton() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSetup = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg(null);
      
      const res = await fetch("/api/setup-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      let data;
      try {
        data = await res.json();
      } catch (err) {
        throw new Error(`Server returned a non-JSON response (Status: ${res.status})`);
      }

      if (res.ok && data.url) {
        window.location.assign(data.url);
      } else {
        throw new Error(data.error || `Server Error ${res.status}: Failed to open setup`);
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message);
      alert("Error: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <button
        onClick={handleSetup}
        disabled={loading}
        className="w-full py-2.5 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-900 dark:text-white text-sm font-bold rounded-xl transition-colors border border-slate-200 dark:border-zinc-800 cursor-pointer flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Payment Method"}
      </button>
      {errorMsg && <p className="text-red-500 text-xs font-medium text-center">{errorMsg}</p>}
    </div>
  );
}
