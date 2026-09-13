"use client";

import Link from "next/link";
import { User, Shield, ArrowRight, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Wrap in suspense since we use useSearchParams
function LoginForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleGoogleLogin = async (role: "family" | "staff") => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
      },
    });
  };

  return (
    <div className="w-full max-w-[480px] px-6 py-12 flex flex-col relative z-10">
      
      {/* Back Button */}
      <div className="absolute top-0 left-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-navy transition-colors bg-white/50 px-4 py-2 rounded-full border border-slate-200/50 backdrop-blur-sm">
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
        </Link>
      </div>

      {/* Brand */}
      <div className="animate-fade-in-up flex flex-col items-center mt-12">
        <h1 className="text-4xl font-bold text-navy tracking-tight">
          Aethon <span className="text-primary font-light">Health</span>
        </h1>
        <p className="text-lg text-text-muted mt-2">Choose your portal</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="mt-8 w-full bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl flex items-center gap-3 animate-fade-in text-sm font-bold shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error === "access_denied" ? "Authentication was cancelled or denied." : error}</p>
        </div>
      )}

      {/* Role Cards */}
      <div className="w-full mt-10 space-y-4">
        <button
          onClick={() => handleGoogleLogin("family")}
          className="group flex items-center gap-4 w-full bg-surface rounded-2xl p-5 card-hover animate-fade-in-up delay-100 text-left border border-border"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-text-primary">Family Portal</p>
            <p className="text-sm text-text-muted">Sign in with Google to see updates</p>
          </div>
          <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
        </button>

        <button
          onClick={() => handleGoogleLogin("staff")}
          className="group flex items-center gap-4 w-full bg-surface rounded-2xl p-5 card-hover animate-fade-in-up delay-200 text-left border border-border"
        >
          <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
            <Shield className="w-6 h-6 text-navy" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-text-primary">Facility Management</p>
            <p className="text-sm text-text-muted">Staff single sign-on (SSO)</p>
          </div>
          <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-navy group-hover:translate-x-1 transition-all shrink-0" />
        </button>
      </div>

      <p className="text-xs text-text-muted mt-12 animate-fade-in delay-300 text-center">
        By signing in, you agree to our Terms of Service.<br />
        All data hosted in EU (Frankfurt) · GDPR Compliant
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-alt relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-fade-in" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-success/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 animate-fade-in delay-200" />
      
      <Suspense fallback={<div className="animate-pulse w-full max-w-[480px] h-96 bg-surface rounded-3xl" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
