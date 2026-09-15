"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, X, Mail, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

export default function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Reset success state after a few seconds
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

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
            <Link href="/privacy" className="hover:text-navy transition-colors">Privacy</Link>
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
            <Link href="/privacy" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-text-secondary hover:text-navy transition-colors">Privacy</Link>
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

      {/* === Contact Content === */}
      <section className="flex-1 py-16 md:py-24 flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-6 w-full">
          <Reveal>
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
              
              {/* Left Column: Info */}
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-navy tracking-tight mb-4 leading-tight">
                    Get in touch <br/>with our team
                  </h1>
                  <p className="text-lg text-slate-500 font-medium">
                    Whether you have a question about features, pricing, or need a demo for your care facility, our team is ready to answer all your questions.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-navy">Email Us</h3>
                      <p className="text-slate-500 font-medium mb-1">Our friendly team is here to help.</p>
                      <a href="mailto:support@aethonhealth.com" className="text-primary font-bold hover:underline">support@aethonhealth.com</a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-navy">Office</h3>
                      <p className="text-slate-500 font-medium mb-1">Come say hello at our headquarters.</p>
                      <p className="text-navy font-bold">Zurich, Switzerland</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Form */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl shadow-slate-200/50 rounded-3xl p-8">
                {isSuccess ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4 animate-fade-in-up">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-black text-navy">Message Sent!</h3>
                    <p className="text-slate-500 font-medium">We'll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                      <input 
                        required
                        type="email" 
                        className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="jane@example.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</label>
                      <textarea 
                        required
                        rows={4}
                        className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" 
                        placeholder="How can we help you?"
                      />
                    </div>
                    <button 
                      disabled={isSubmitting}
                      className="w-full py-4 mt-2 bg-navy text-white rounded-xl text-sm font-bold shadow-lg shadow-navy/20 hover:bg-slate-800 transition-colors active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
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
            <Link href="/privacy" className="hover:text-navy transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-navy transition-colors">Terms</Link>
            <Link href="/contact" className="text-navy hover:text-sky-600 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
