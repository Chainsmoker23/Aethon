"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

export default function PrivacyPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-slate-50/50 landing-grid-bg">
      
      {/* === Elegant Color-Shifting Siri Aura Background === */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[250px] h-[250px] md:w-[500px] md:h-[500px] rounded-full blur-[80px] md:blur-[120px] animate-blob-1" />
        <div className="absolute top-[20%] right-[-5%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full blur-[80px] md:blur-[120px] animate-blob-2" />
        <div className="absolute bottom-[-10%] left-[20%] w-[350px] h-[350px] md:w-[800px] md:h-[800px] rounded-full blur-[100px] md:blur-[150px] animate-blob-3" />
        <div className="absolute top-[50%] left-[50%] w-[200px] h-[200px] md:w-[400px] md:h-[400px] rounded-full blur-[60px] md:blur-[100px] animate-blob-4 -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* === Navigation === */}
      <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-2xl border-b border-slate-200/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <img 
              src="/logo.jpg" 
              alt="Aethon Health Logo" 
              className="w-10 h-10 rounded-xl object-contain bg-white shadow-sm border border-slate-200/50" 
            />
            <span className="text-xl font-extrabold text-navy tracking-tight">
              Aethon<span className="font-light text-primary ml-0.5">Health</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-text-secondary">
            <Link href="/team" className="hover:text-navy transition-colors">Team</Link>
            <Link href="/privacy" className="text-navy transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-navy transition-colors">Terms</Link>
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
            className="md:hidden w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-navy hover:bg-slate-200 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white/95 backdrop-blur-3xl border-b border-slate-200/50 shadow-xl py-6 px-6 flex flex-col gap-4 text-center">
            <Link href="/team" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-text-secondary hover:text-navy transition-colors">Team</Link>
            <Link href="/privacy" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-navy transition-colors">Privacy</Link>
            <Link href="/terms" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-text-secondary hover:text-navy transition-colors">Terms</Link>
            <div className="h-px w-full bg-slate-200/60 my-2" />
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

      {/* === Privacy Policy Content === */}
      <section className="flex-1 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <Reveal>
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl shadow-slate-200/50 rounded-3xl p-8 md:p-12 prose prose-slate max-w-none">
              <h1 className="text-3xl md:text-5xl font-black text-navy tracking-tight mb-4">Privacy Policy</h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-8">Last Updated: September 15, 2026</p>
              
              <div className="space-y-8 text-slate-700">
                <section>
                  <h2 className="text-xl font-extrabold text-slate-900 mb-3">1. Introduction</h2>
                  <p>
                    Aethon Health is committed to protecting the privacy and security of your data. This Privacy Policy explains how we collect, use, and protect your personal information when you use our care management platform. Our practices comply with the Swiss Federal Act on Data Protection (FADP).
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-extrabold text-slate-900 mb-3">2. Information We Collect</h2>
                  <p>
                    We collect information that you provide directly to us, including:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Account Information:</strong> Name, email address, and role (e.g., family member, care staff).</li>
                    <li><strong>Health Data:</strong> Care updates, vitals, medication schedules, and clinical notes entered by authorized staff regarding residents.</li>
                    <li><strong>Communications:</strong> Messages exchanged between care facilities and family members within the app.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-extrabold text-slate-900 mb-3">3. How We Use Your Information</h2>
                  <p>
                    Your data is used exclusively to provide and improve the Aethon Health service. Specifically, we use the information to:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Facilitate secure communication between care providers and family members.</li>
                    <li>Maintain accurate health records and care summaries.</li>
                    <li>Send important notifications regarding resident updates or account security.</li>
                    <li>Ensure the technical functionality and security of the platform.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-extrabold text-slate-900 mb-3">4. Data Security & Storage</h2>
                  <p>
                    We implement industry-leading security measures to protect your data. All sensitive health information is encrypted both in transit (via TLS) and at rest. Access to patient records is strictly governed by Role-Based Access Control (RBAC), ensuring that only verified staff and explicitly authorized family members can view specific resident data.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-extrabold text-slate-900 mb-3">5. Data Sharing</h2>
                  <p>
                    <strong>We do not sell your personal data.</strong> Information is only shared within the platform according to the permissions set by the care facility (e.g., sharing a resident's daily update with their connected family members). We may only disclose data to third parties if required by law or valid legal process.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-xl font-extrabold text-slate-900 mb-3">6. Your Rights</h2>
                  <p>
                    Under the FADP, you have the right to access, correct, or request the deletion of your personal data. Family members can revoke their own access at any time, and facility administrators can instantly revoke family access to resident records. To exercise these rights, please contact your care facility administrator or reach out to our support team.
                  </p>
                </section>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* === Footer === */}
      <footer className="border-t border-slate-200/60 bg-white/60 backdrop-blur-xl mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <img 
              src="/logo.jpg" 
              alt="Aethon Health Logo" 
              className="w-8 h-8 rounded-lg object-contain bg-white shadow-sm border border-slate-200/50" 
            />
            <span className="text-lg font-extrabold text-navy tracking-tight">
              Aethon<span className="font-light text-primary ml-0.5">Health</span>
            </span>
          </Link>
          <p className="text-sm font-bold text-slate-400">
            © {new Date().getFullYear()} Aethon Health. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm font-bold text-slate-500">
            <Link href="/team" className="hover:text-navy transition-colors">Team</Link>
            <Link href="/privacy" className="text-navy hover:text-sky-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-navy transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-navy transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
