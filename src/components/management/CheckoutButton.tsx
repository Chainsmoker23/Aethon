"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCheckout} 
      disabled={loading}
      className="shrink-0 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm shadow-sm hover:scale-105 transition-transform cursor-pointer flex items-center justify-center min-w-[200px]"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Upgrade to Annual Plan"}
    </button>
  );
}
