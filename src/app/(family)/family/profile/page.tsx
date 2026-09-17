"use client";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { User, Settings, Shield, Bell, ChevronRight, LogOut, Loader2, ArrowLeft, Mail, Smartphone, Lock, Eye, EyeOff, Globe } from "lucide-react";
import { useFamilyResident } from "@/hooks/useFamilyResident";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const translations: Record<string, any> = {
  "English": {
    profileTitle: "Family Profile", connectedTo: "Connected to", resident: "Resident", notifications: "Notification Preferences",
    privacy: "Privacy & Security", account: "Account Settings", signOut: "Sign Out", displayName: "Display Name",
    email: "Email Address", language: "Language", save: "Save Changes", saving: "Saving...", saved: "Saved!",
    comingSoon: "Coming Soon", accountInfo: "Account Info", manageDetails: "Manage your personal details."
  },
  "German": {
    profileTitle: "Familienprofil", connectedTo: "Verbunden mit", resident: "Bewohner", notifications: "Benachrichtigungen",
    privacy: "Datenschutz & Sicherheit", account: "Kontoeinstellungen", signOut: "Abmelden", displayName: "Anzeigename",
    email: "E-Mail-Adresse", language: "Sprache", save: "Änderungen speichern", saving: "Speichern...", saved: "Gespeichert!",
    comingSoon: "Demnächst", accountInfo: "Kontoinformationen", manageDetails: "Verwalten Sie Ihre Daten."
  },
  "French": {
    profileTitle: "Profil Familial", connectedTo: "Connecté à", resident: "Résident", notifications: "Notifications",
    privacy: "Confidentialité et Sécurité", account: "Paramètres du Compte", signOut: "Se déconnecter", displayName: "Nom d'affichage",
    email: "Adresse e-mail", language: "Langue", save: "Enregistrer", saving: "Enregistrement...", saved: "Enregistré !",
    comingSoon: "Bientôt", accountInfo: "Infos du Compte", manageDetails: "Gérez vos informations."
  },
  "Italian": {
    profileTitle: "Profilo Famiglia", connectedTo: "Collegato a", resident: "Residente", notifications: "Notifiche",
    privacy: "Privacy e Sicurezza", account: "Impostazioni Account", signOut: "Disconnettersi", displayName: "Nome",
    email: "Indirizzo Email", language: "Lingua", save: "Salva modifiche", saving: "Salvataggio...", saved: "Salvato!",
    comingSoon: "Presto", accountInfo: "Info Account", manageDetails: "Gestisci i tuoi dettagli."
  }
};

export default function ProfilePage() {
  const { residentInfo, loading: residentLoading } = useFamilyResident();
  const [userName, setUserName] = useState("Family Member");
  const [userEmail, setUserEmail] = useState("");
  const [language, setLanguage] = useState("English");
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const supabase = createClient();
  const t = translations[language] || translations["English"];

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || "Family Member");
        setUserEmail(user.email || "");
      }
    }
    loadUser();
    
    // Load saved language
    const savedLang = localStorage.getItem("aethon_lang");
    if (savedLang) setLanguage(savedLang);
  }, []);

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("aethon_lang", lang);
    setIsLanguageOpen(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate updating Supabase profile
    if (userName) {
      await supabase.auth.updateUser({ data: { full_name: userName } });
    }
    await new Promise(r => setTimeout(r, 600));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 px-6 py-5 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <Link href="/family" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t.profileTitle}</h1>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
          <User className="w-5 h-5 text-sky-600" />
        </div>
      </div>
      
      <main className="flex-1 p-6 space-y-6 pb-32">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-black shadow-md shrink-0">
            {userName[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">{userName}</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-500 mt-0.5 truncate">
              {residentLoading ? <Loader2 className="w-3 h-3 animate-spin inline-block text-slate-400" /> : 
                `${t.connectedTo} ${residentInfo?.first_name || t.resident}`}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          
          {/* Notification Preferences */}
          <button disabled className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50/50 opacity-60 border-b border-slate-200 dark:border-slate-800 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-500 dark:text-slate-500" />
              <span className="font-bold text-slate-900 dark:text-white text-sm">{t.notifications}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800">{t.comingSoon}</span>
          </button>

          {/* Privacy & Security */}
          <button disabled className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50/50 opacity-60 border-b border-slate-200 dark:border-slate-800 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-500 dark:text-slate-500" />
              <span className="font-bold text-slate-900 dark:text-white text-sm">{t.privacy}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800">{t.comingSoon}</span>
          </button>

          {/* Account Settings */}
          <Sheet>
            <SheetTrigger className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-800/50 transition-colors active:bg-slate-100 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-violet-500" />
                <span className="font-bold text-slate-900 dark:text-white text-sm">{t.account}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl border-t-0 p-0 overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-800/50">
              <SheetHeader className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <SheetTitle className="text-xl font-black text-slate-900 dark:text-white text-left">{t.accountInfo}</SheetTitle>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-500 text-left mt-1">{t.manageDetails}</p>
              </SheetHeader>
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">{t.displayName}</label>
                    <input 
                      type="text" 
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">{t.email}</label>
                    <input type="email" value={userEmail || "Loading..."} readOnly className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-500 cursor-not-allowed opacity-70" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider pl-1">{t.language}</label>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <button 
                      onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                      className="w-full flex items-center justify-between p-4 outline-none hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-sky-500" />
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{language}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isLanguageOpen ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {isLanguageOpen && (
                      <div className="p-2 space-y-1 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800/50">
                        {["English", "German", "French", "Italian"].map(lang => (
                          <button
                            key={lang}
                            onClick={() => handleLanguageSelect(lang)}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                              language === lang 
                                ? 'bg-sky-100 text-sky-700' 
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-700/50 hover:text-slate-900 dark:text-white'
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={handleSave}
                  disabled={isSaving || saveSuccess}
                  className={`w-full py-3.5 text-white rounded-xl text-sm font-bold shadow-lg transition-colors active:scale-[0.98] ${
                    saveSuccess ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-sky-600 shadow-sky-600/20 hover:bg-sky-700'
                  }`}
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> {t.saving}
                    </span>
                  ) : saveSuccess ? (
                    t.saved
                  ) : (
                    t.save
                  )}
                </button>

              </div>
            </SheetContent>
          </Sheet>

        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/50">
          <SignOutButton className="w-full flex items-center justify-center gap-2 p-4 bg-white dark:bg-slate-900 border border-rose-200 text-rose-500 rounded-2xl font-bold hover:bg-rose-50 transition-colors shadow-sm active:scale-[0.98]">
            <LogOut className="w-5 h-5" />
            {t.signOut}
          </SignOutButton>
        </div>
      </main>
    </div>
  );
}
