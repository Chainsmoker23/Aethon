"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ReactNode, useState } from "react";
import { Loader2 } from "lucide-react";

export function SignOutButton({ 
  children, 
  className 
}: { 
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh(); // Clear server cache state
  };

  return (
    <button onClick={handleSignOut} disabled={isSigningOut} className={className}>
      {isSigningOut ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : children}
    </button>
  );
}
