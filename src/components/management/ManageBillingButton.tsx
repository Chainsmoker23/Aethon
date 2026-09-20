"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function ManageBillingButton({ label = "Manage Portal" }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleManage = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg(null);
      
      const res = await fetch("/api/customer-portal", {
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
        throw new Error(data.error || `Server Error ${res.status}: Failed to open portal`);
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message);
      alert("Error: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button 
        onClick={handleManage} 
        disabled={loading}
        className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2 cursor-pointer"
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {label}
      </button>
      {errorMsg && <p className="text-red-500 text-[10px]">{errorMsg}</p>}
    </div>
  );
}
