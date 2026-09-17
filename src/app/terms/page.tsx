"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

export default function TermsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-800/50/50 landing-grid-bg">
      
      {/* === Elegant Color-Shifting Siri Aura Background === */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[250px] h-[250px] md:w-[500px] md:h-[500px] rounded-full blur-[80px] md:blur-[120px] animate-blob-1" />
        <div className="absolute top-[20%] right-[-5%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full blur-[80px] md:blur-[120px] animate-blob-2" />
        <div className="absolute bottom-[-10%] left-[20%] w-[350px] h-[350px] md:w-[800px] md:h-[800px] rounded-full blur-[100px] md:blur-[150px] animate-blob-3" />
        <div className="absolute top-[50%] left-[50%] w-[200px] h-[200px] md:w-[400px] md:h-[400px] rounded-full blur-[60px] md:blur-[100px] animate-blob-4 -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* === Navigation === */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900/60 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <img 
              src="/logo.jpg" 
              alt="Aethon Health Logo" 
              className="w-10 h-10 rounded-xl object-contain bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800/50" 
            />
            <span className="text-xl font-extrabold text-navy tracking-tight">
              Aethon<span className="font-light text-primary ml-0.5">Health</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-text-secondary">
            <Link href="/team" className="hover:text-navy transition-colors">Team</Link>
            <Link href="/terms" className="text-navy transition-colors">Terms</Link>
          </div>

          <div className="hidden md:block">
            <Link
              href="/login"
              className="px-5 py-2.5 bg-navy text-white text-sm font-bold rounded-full hover:bg-slate-800 transition-all shadow-lg shadow-navy/20 hover:shadow-navy/30 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-navy hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-slate-900/95 backdrop-blur-3xl border-b border-slate-200 dark:border-slate-800/50 shadow-xl py-6 px-6 flex flex-col gap-4 text-center">
            <Link href="/team" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-text-secondary hover:text-navy transition-colors">Team</Link>
            <Link href="/terms" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-navy transition-colors">Terms</Link>
            <div className="h-px w-full bg-slate-200 dark:bg-slate-700/60 my-2" />
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-4 bg-navy text-white text-lg font-bold rounded-2xl hover:bg-slate-800 transition-all"
            >
              Sign In
            </Link>
          </div>
        )}
      </nav>

      {/* === Terms Content === */}
      <section className="flex-1 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <Reveal>
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 shadow-xl shadow-slate-200/50 rounded-3xl p-8 md:p-12 prose prose-slate max-w-none">
              <h1 className="text-3xl md:text-5xl font-black text-navy tracking-tight mb-4">Terms of Service</h1>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-8">Last Updated: September 15, 2026</p>
              
              <div className="space-y-8 text-slate-700 dark:text-slate-300">
                <section>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
                  <p>
                    By accessing and using Aethon Health ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service. The Service provides a platform for care facilities and family members to communicate, share updates, and manage care transparently.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3">2. Description of Service</h2>
                  <p>
                    Aethon Health provides healthcare management tools, including but not limited to real-time vitals tracking, family messaging, shift handovers, and AI-powered care summaries. We reserve the right to modify, suspend, or discontinue any part of the Service at any time without notice.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3">3. Privacy and Data Security (Swiss Compliance)</h2>
                  <p>
                    Your privacy is critical to us. We adhere to strict Swiss healthcare data regulations and the Swiss Federal Act on Data Protection (FADP). Patient and resident data is encrypted at rest and in transit. By using the Service, you also agree to our Privacy Policy, which outlines how we handle and protect sensitive health information.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3">4. User Responsibilities</h2>
                  <p>
                    Users must provide accurate and current information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Facility staff must ensure they only share authorized health information with verified family members.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3">5. Limitation of Liability</h2>
                  <p>
                    Aethon Health is a communication and management tool, not a substitute for professional medical advice, diagnosis, or treatment. In no event shall Aethon Health or its creators be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the Service.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3">6. Governing Law</h2>
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of Switzerland, without regard to its conflict of law provisions.
                  </p>
                </section>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* === Footer === */}
      <footer className="border-t border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/60 backdrop-blur-xl mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <img 
              src="/logo.jpg" 
              alt="Aethon Health Logo" 
              className="w-8 h-8 rounded-lg object-contain bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800/50" 
            />
            <span className="text-lg font-extrabold text-navy tracking-tight">
              Aethon<span className="font-light text-primary ml-0.5">Health</span>
            </span>
          </Link>
          <p className="text-sm font-bold text-slate-400">
            © {new Date().getFullYear()} Aethon Health. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm font-bold text-slate-500 dark:text-slate-500">
            <Link href="/team" className="hover:text-navy transition-colors">Team</Link>
            <Link href="/privacy" className="hover:text-navy transition-colors">Privacy</Link>
            <Link href="/terms" className="text-navy hover:text-sky-600 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-navy transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
