'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  Mic,
  Video,
  LayoutDashboard,
  ShieldCheck,
  WifiOff,
  Zap,
  ArrowRight,
  HeartPulse,
  Users,
  BrainCircuit,
  Hospital,
} from 'lucide-react';

type Language = 'en' | 'hi';

const content = {
  en: {
    brandTitle: 'Arogya Sahayak',
    brandSubtitle: 'आरोग्य सहायक',
    nav: ['AI Screening', 'Dashboard', 'Teleconsult'],
    status: 'Offline PWA Ready',
    badge: 'Empowering ASHA & Rural Health Workers Across India',
    heroTitleLine1: 'Arogya Sahayak',
    heroTitleLine2: '(आरोग्य सहायक)',
    heroSubtitle: 'AI-Powered Early Disease Risk Prediction & Rural Health Access',
    heroDescription:
      'Delivering zero-latency, on-device AI diagnostic intelligence for frontline healthcare providers in remote and low-connectivity regions.',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    sectionTitle: 'Comprehensive Rural Health Intelligence',
    sectionDescription: 'Built for high impact, low connectivity, and effortless field adoption.',
    cards: [
      {
        title: 'AI Risk Screening',
        body: 'On-device neural network models predict cardiovascular, diabetes, & respiratory risk profiles instantly without internet.',
        linkText: 'Launch Screener →',
      },
      {
        title: 'Vernacular Voice Input',
        body: 'Speech-to-text symptom intake in regional dialects to streamline rapid patient registration during field visits.',
        linkText: 'Voice Assistant →',
      },
      {
        title: 'Teleconsultation',
        body: 'Connect rural field workers directly with district hospital doctors via low-bandwidth video & emergency messaging.',
        linkText: 'Connect Doctor →',
      },
      {
        title: 'Admin Dashboard',
        body: 'Real-time epidemiological heatmaps, village health statistics, risk distribution analytics, and field sync status.',
        linkText: 'View Analytics →',
      },
    ],
    highlights: [
      { value: '100% Offline', detail: 'ONNX Model + Dexie DB' },
      { value: '< 50ms', detail: 'Real-time AI Inference' },
      { value: 'HIPAA / ABDM', detail: 'Encrypted Local Storage' },
      { value: 'ASHA Ready', detail: 'Multi-lingual Interface' },
    ],
    footer: 'Arogya Sahayak — Rural Healthcare AI PWA Scaffold (IEMH4-HC-01)',
    footerLinks: ['Screening', 'Dashboard', 'Teleconsult'],
  },
  hi: {
    brandTitle: 'अरोग्य सहायक',
    brandSubtitle: 'आरोग्य सहायक',
    nav: ['एआई स्क्रीनिंग', 'डैशबोर्ड', 'टेलीकंसल्ट'],
    status: 'ऑफ़लाइन PWA तैयार',
    badge: 'भारत भर में ASHA और ग्रामीण स्वास्थ्य कार्यकर्ताओं को सशक्त बनाना',
    heroTitleLine1: 'अरोग्य सहायक',
    heroTitleLine2: '(आरोग्य सहायक)',
    heroSubtitle: 'एआई-संचालित प्रारंभिक रोग जोखिम पूर्वानुमान और ग्रामीण स्वास्थ्य पहुँच',
    heroDescription:
      'दूरदराज और कम कनेक्टिविटी वाले क्षेत्रों में frontline स्वास्थ्य प्रदाताओं के लिए शून्य-विलंब, ऑन-डिवाइस एआई निदान बौद्धिकता प्रदान करना।',
    signIn: 'साइन इन',
    signUp: 'साइन अप',
    sectionTitle: 'सम्पूर्ण ग्रामीण स्वास्थ्य बौद्धिकता',
    sectionDescription: 'उच्च प्रभाव, कम कनेक्टिविटी और सहज क्षेत्र उपयोग के लिए निर्मित।',
    cards: [
      {
        title: 'एआई जोखिम स्क्रीनिंग',
        body: 'ऑन-डिवाइस न्यूरल नेटवर्क मॉडल हृदय, मधुमेह और श्वसन जोखिम प्रोफाइल को इंटरनेट के बिना तुरंत पूर्वानुमानित करते हैं।',
        linkText: 'स्क्रीनर लॉन्च →',
      },
      {
        title: 'मूल भाषा आवाज़ इनपुट',
        body: 'क्षेत्रीय बोलियों में लक्षणों का स्पीच-टू-टेक्स्ट इनपुट खेत-visit के दौरान rapid पंजीकरण को सरल बनाता है।',
        linkText: 'वॉयस असिस्टेंट →',
      },
      {
        title: 'टेलीकंसल्टेशन',
        body: 'ग्रामीण कार्यकर्ताओं को जिला अस्पताल के डॉक्टरों से कम-बैंडविड्थ वीडियो और आपात संदेशों के जरिए जोड़ता है।',
        linkText: 'डॉक्टर से जुड़ें →',
      },
      {
        title: 'एडमिन डैशबोर्ड',
        body: 'रीयल-टाइम एपिडेमियोलॉजिकल हीटमैप, गाँव स्वास्थ्य आँकड़े, जोखिम वितरण विश्लेषण और फ़ील्ड सिंक स्थिति।',
        linkText: 'विश्लेषण देखें →',
      },
    ],
    highlights: [
      { value: '100% ऑफ़लाइन', detail: 'ONNX मॉडल + Dexie DB' },
      { value: '< 50ms', detail: 'रीयल-टाइम एआई इंफरेंस' },
      { value: 'HIPAA / ABDM', detail: 'एन्क्रिप्टेड लोकल स्टोरेज' },
      { value: 'ASHA तैयार', detail: 'बहु-भाषी इंटरफ़ेस' },
    ],
    footer: 'अरोग्य सहायक — ग्रामीण स्वास्थ्य एआई PWA स्कैफोल्ड (IEMH4-HC-01)',
    footerLinks: ['स्क्रीनिंग', 'डैशबोर्ड', 'टेलीकंसल्ट'],
  },
};

export default function HomePage() {
  const [language, setLanguage] = useState<Language>('en');
  const copy = language === 'hi' ? content.hi : content.en;

  useEffect(() => {
    document.documentElement.lang = language === 'hi' ? 'hi' : 'en';
  }, [language]);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      <header className="sticky top-0 z-50 glass border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                {copy.brandTitle}
              </span>
              <span className="text-xs block text-slate-400 font-sans">
                {copy.brandSubtitle}
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-300">
            <Link href="/screening" className="hover:text-indigo-400 transition-colors">
              {copy.nav[0]}
            </Link>
            <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">
              {copy.nav[1]}
            </Link>
            <Link href="/teleconsult" className="hover:text-indigo-400 transition-colors">
              {copy.nav[2]}
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <select
              className="bg-slate-900/50 border border-slate-700 text-slate-300 text-sm rounded-lg py-1 px-2 focus:outline-none focus:border-indigo-500"
              value={language}
              aria-label="Select language"
              onChange={(event) => setLanguage(event.target.value as Language)}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <WifiOff className="w-3.5 h-3.5" />
              {copy.status}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
        <section className="text-center py-12 md:py-20 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-md animate-fade-in">
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
            {copy.badge}
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
            {copy.heroTitleLine1} <br />
            <span className="text-3xl sm:text-5xl font-semibold bg-gradient-to-r from-indigo-400 via-violet-300 to-emerald-400 bg-clip-text text-transparent font-sans">
              {copy.heroTitleLine2}
            </span>
          </h1>

          <p className="text-xl sm:text-2xl font-medium text-indigo-200/90 mb-4">
            {copy.heroSubtitle}
          </p>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {copy.heroDescription}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Link
              href="/auth/login?role=patient"
              className="group relative flex flex-col items-center justify-center gap-3 px-6 py-8 rounded-2xl glass-card border border-indigo-500/20 hover:border-indigo-500/60 transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-500/10 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
            >
              <div className="w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-indigo-400" />
              </div>
              <span className="font-semibold text-lg text-white">Patient Mode</span>
            </Link>

            <Link
              href="/auth/login?role=asha"
              className="group relative flex flex-col items-center justify-center gap-3 px-6 py-8 rounded-2xl glass-card border border-emerald-500/20 hover:border-emerald-500/60 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-500/10 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HeartPulse className="w-7 h-7 text-emerald-400" />
              </div>
              <span className="font-semibold text-lg text-white">ASHA Worker</span>
            </Link>

            <Link
              href="/auth/login?role=phc"
              className="group relative flex flex-col items-center justify-center gap-3 px-6 py-8 rounded-2xl glass-card border border-amber-500/20 hover:border-amber-500/60 transition-all duration-300 hover:-translate-y-1 hover:bg-amber-500/10 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Hospital className="w-7 h-7 text-amber-400" />
              </div>
              <span className="font-semibold text-lg text-white">PHC Center</span>
            </Link>

            <Link
              href="/auth/login?role=admin"
              className="group relative flex flex-col items-center justify-center gap-3 px-6 py-8 rounded-2xl glass-card border border-rose-500/20 hover:border-rose-500/60 transition-all duration-300 hover:-translate-y-1 hover:bg-rose-500/10 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]"
            >
              <div className="w-14 h-14 rounded-full bg-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7 text-rose-400" />
              </div>
              <span className="font-semibold text-lg text-white">App Admin</span>
            </Link>
          </div>
        </section>

        <section className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              {copy.sectionTitle}
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              {copy.sectionDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {copy.cards.map((card, index) => {
              const cardStyles = [
                'bg-indigo-600/20 text-indigo-400',
                'bg-violet-600/20 text-violet-400',
                'bg-emerald-600/20 text-emerald-400',
                'bg-amber-600/20 text-amber-400',
              ];
              const linkStyles = [
                'text-indigo-400 hover:text-indigo-300',
                'text-violet-400 hover:text-violet-300',
                'text-emerald-400 hover:text-emerald-300',
                'text-amber-400 hover:text-amber-300',
              ];
              const hrefs = ['/screening', '/screening', '/teleconsult', '/dashboard'];
              const icons = [Stethoscope, Mic, Video, LayoutDashboard];

              const Icon = icons[index];

              return (
                <div key={card.title} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                  <div className={`w-12 h-12 rounded-xl ${cardStyles[index]} flex items-center justify-center mb-5 group-hover:bg-slate-900/70 transition-colors duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{card.body}</p>
                  <Link href={hrefs[index]} className={`inline-flex items-center text-xs font-semibold ${linkStyles[index]} group-hover:translate-x-1 transition-transform`}>
                    {card.linkText}
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-20 glass p-8 rounded-3xl border border-slate-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {copy.highlights.map((item, index) => {
              const iconStyles = [
                'bg-indigo-500/10 text-indigo-400',
                'bg-emerald-500/10 text-emerald-400',
                'bg-violet-500/10 text-violet-400',
                'bg-amber-500/10 text-amber-400',
              ];
              const icons = [WifiOff, Zap, ShieldCheck, Users];
              const Icon = icons[index];

              return (
                <div key={item.value} className="p-4">
                  <div className={`inline-flex p-3 rounded-xl ${iconStyles[index]} mb-3`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">{item.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{item.detail}</div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900 glass py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>{copy.footer}</div>
          <div className="flex items-center space-x-4 text-slate-400">
            <Link href="/screening" className="hover:text-indigo-400">{copy.footerLinks[0]}</Link>
            <Link href="/dashboard" className="hover:text-indigo-400">{copy.footerLinks[1]}</Link>
            <Link href="/teleconsult" className="hover:text-indigo-400">{copy.footerLinks[2]}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
