"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button 
        onClick={handleCheckout} 
        disabled={loading}
        className="shrink-0 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm shadow-sm hover:scale-105 transition-transform cursor-pointer flex items-center justify-center min-w-[200px]"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Upgrade to Annual Plan"}
      </button>
      {errorMsg && <p className="text-red-300 text-xs font-medium max-w-xs text-right bg-black/20 p-2 rounded">{errorMsg}</p>}
    </div>
  );
}
