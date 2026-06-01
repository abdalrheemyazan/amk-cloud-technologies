"use client";

import {
  Cloud,
  Server,
  Shield,
  Database,
  Mail,
  Zap,
  Globe,
  Lock,
  ChevronRight,
  Headphones,
  CheckCircle2,
  PhoneCall,
  Monitor,
  Users,
  Download,
  Mail as MailIcon,
  X,
  Menu
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

function CountUp({ end, decimals = 0, suffix = "", className = "text-3xl lg:text-4xl font-black text-slate-900 leading-none" }: { end: number, decimals?: number, suffix?: string, className?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    let animationFrame: number;
    const duration = 1500;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(end * easeOut);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end]);

  return <div ref={ref} className={className}>
    {value.toFixed(decimals)}{value === end ? suffix : ""}
  </div>;
}

function RevealText({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="text-3xl lg:text-4xl font-black text-slate-900 leading-none"
    >
      {text}
    </motion.div>
  );
}

function SmoothRevealText({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center md:justify-start">
      <div className="relative inline-block">
        <motion.div
          initial={{ opacity: 0, y: 8, letterSpacing: "0.08em" }}
          whileInView={{ opacity: 1, y: 0, letterSpacing: "0.01em" }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-3xl lg:text-4xl font-black text-slate-900 leading-none relative z-10"
        >
          {text}
        </motion.div>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="absolute -bottom-1.5 right-0 w-full h-1.5 bg-gradient-to-l from-blue-500 to-indigo-400 rounded-full z-0"
          style={{ transformOrigin: "right" }}
        />
      </div>
    </div>
  );
}

function StatWrapper({ icon: Icon, label, children }: any) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 px-8 py-6 md:py-0 border-b md:border-b-0 md:border-r md:first:border-r-0 border-slate-100/80 last:border-0 w-full md:w-auto justify-center md:flex-1 group">
      <div className="text-center md:text-right w-full">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-1.5">
          {children}
          <div className="w-9 h-9 rounded-full bg-blue-50/80 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm shadow-blue-500/5">
            <Icon className="w-4.5 h-4.5" />
          </div>
        </div>
        <div className="text-xs text-slate-500 font-bold tracking-tight">{label}</div>
      </div>
    </div>
  );
}

function MainServiceCard({ icon: Icon, title, desc, onClick }: any) {
  return (
    <div 
      onClick={onClick} 
      className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-[2.2rem] p-8 md:p-9 flex flex-col items-start text-right shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.05)] hover:border-blue-200/80 hover:-translate-y-1 transition-all duration-500 group cursor-pointer relative overflow-hidden"
    >
      {/* Light sweep sweep effect */}
      <div className="absolute inset-0 z-0 overflow-hidden mix-blend-overlay">
        <div className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
      </div>

      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:-translate-y-1 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/20 transition-all duration-300 relative z-10">
        <Icon className="w-6.5 h-6.5" />
      </div>
      <h3 className="text-xl font-black mb-2 tracking-tight text-slate-900 relative z-10">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed font-semibold mb-6 flex-1 relative z-10">
        {desc}
      </p>
      <div className="mt-auto text-blue-600 font-bold flex items-center gap-2 group-hover:gap-3.5 transition-all text-sm relative z-10">
        לפרטים נוספים
        <ChevronRight className="w-4 h-4 rotate-180" />
      </div>
    </div>
  );
}

function ServicePill({ icon: Icon, title, onClick }: any) {
  return (
    <div 
      onClick={onClick} 
      className="bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-full px-6 py-3 flex items-center gap-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 hover:bg-white transition-all duration-300 cursor-pointer group whitespace-nowrap"
    >
      <Icon className="w-4.5 h-4.5 text-blue-500 group-hover:text-blue-600 group-hover:scale-110 transition-all" />
      <span className="font-bold text-slate-700 text-sm group-hover:text-blue-600 transition-colors">{title}</span>
    </div>
  );
}

const servicesData: Record<string, any> = {
  "vps": {
    title: "שרתי VPS וירטואליים",
    icon: Server,
    desc: "ביצועים גבוהים, גמישות מלאה וניהול משאבים חכם.",
    fullDesc: "שרתים וירטואליים מהירים וגמישים לעסקים שצריכים ביצועים יציבים, שליטה מלאה וסביבת עבודה מאובטחת.",
    bullets: ["משאבים מותאמים לצרכי העסק", "ביצועים גבוהים וזמינות רציפה", "ניהול ותמיכה טכנית מקצועית"]
  },
  "dr": {
    title: "גיבוי והתאוששות מאסון",
    icon: Database,
    desc: "גיבוי אוטומטי, מאובטח ושחזור מהיר לכל סביבת עבודה.",
    fullDesc: "פתרונות גיבוי מתקדמים שמגנים על המידע העסקי ומאפשרים חזרה מהירה לפעילות במקרה של תקלה.",
    bullets: ["גיבויים אוטומטיים ומאובטחים", "שחזור מהיר של מידע קריטי", "התאמה לתרחישי DR עסקיים"]
  },
  "cloud": {
    title: "אחסון ענן מאובטח",
    icon: Cloud,
    desc: "פתרונות אחסון מאובטחים מבוססי טכנולוגיות הענן המתקדמות ביותר.",
    fullDesc: "אחסון ענן מאובטח ונגיש שמאפשר לשמור, לשתף ולנהל קבצים עסקיים בצורה נוחה ובטוחה.",
    bullets: ["גישה מאובטחת מכל מקום", "ניהול הרשאות משתמשים", "שמירה על מידע רגיש"]
  },
  "email": {
    title: "דוא״ל לעסקים",
    icon: Mail,
    desc: "פתרונות דואר אלקטרוני עסקי עם יציבות גבוהה, אבטحة וניהול מקצועי.",
    fullDesc: "פתרונות דואר אלקטרוני עסקי עם יציבות גבוהה, אבטحة וניהול מקצועי.",
    bullets: ["תיבות דואר עסקיות", "הגנה מספאם ואיומים", "תמיכה בהגדרות וסנכרון"]
  },
  "remote": {
    title: "תמיכה מרחוק",
    icon: Monitor,
    desc: "חיבור מהיר ומאובטח לתמיכה טכנית באמצעות TeamViewer ו-AnyDesk.",
    fullDesc: "חיבור מהיר ומאובטח לתמיכה טכנית באמצעות TeamViewer ו-AnyDesk.",
    bullets: ["פתרון תקלות מרחוק", "זמינות מהירה לצוותים", "חיבור מאובטח ונוח"]
  },
  "voip": {
    title: "VOIP",
    icon: PhoneCall,
    desc: "שירותי תקשורת טלפונית לעסקים עם ניהול מתקדם וגמישות גבוהה.",
    fullDesc: "שירותי תקשורת טלפונית לעסקים עם ניהול מתקדם וגמישות גבוהה.",
    bullets: ["שיחות עסקיות בענן", "ניהול שלוחות", "התאמה לצוותים ומוקדים"]
  },
  "helpdesk": {
    title: "Help Desk IT",
    icon: Headphones,
    desc: "מערך תמיכה טכנית שמרכז פניות, תקלות ופתרונות במקום אחד.",
    fullDesc: "מערך תמיכה טכנית שמרכז פניות, תקלות ופתרונות במקום אחד.",
    bullets: ["ניהול קריאות שירות", "מעקב אחרי טיפול בתקלות", "תמיכה מקצועית לעובדים"]
  },
  "dns": {
    title: "DNS",
    icon: Globe,
    desc: "ניהול DNS מקצועי לשמירה על זמינות, אבטחה וביצועים של נכסי האינטרנט של העסק.",
    fullDesc: "ניהול DNS מקצועי לשמירה על זמינות, אבטחה וביצועים של נכסי האינטרנט של העסק.",
    bullets: ["ניהול רשומות DNS", "הגדרות דומיינים", "תמיכה בתקלות זמינות"]
  }
};

function ServiceModal({ activeModal, onClose, onSelectService }: any) {
  if (!activeModal) return null;

  const isAll = activeModal === "all";
  const service = !isAll ? servicesData[activeModal] : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              {isAll ? "כל השירותים של AMK" : service?.title}
            </h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 overflow-y-auto">
            {isAll ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(servicesData).map(([key, data]) => (
                  <div
                    key={key}
                    onClick={() => onSelectService(key)}
                    className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-white hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                      <data.icon className="w-5.5 h-5.5" />
                    </div>
                    <div className="font-bold text-slate-800 text-sm md:text-base group-hover:text-blue-600 transition-colors">{data.title}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                  <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/5">
                    {service && <service.icon className="w-10 h-10" />}
                  </div>
                  <div className="space-y-4">
                    <p className="text-slate-600 font-semibold text-lg leading-relaxed">
                      {service?.fullDesc}
                    </p>
                    <div className="space-y-3 pt-2">
                      <div className="font-black text-slate-900 mb-4 text-lg">מה מקבלים?</div>
                      {service?.bullets.map((bullet: string, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                          <span className="text-slate-700 font-semibold text-base">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-4">
            <button onClick={onClose} className="px-7 py-3 bg-white border border-slate-200 text-slate-700 rounded-full font-bold text-sm hover:bg-slate-50 transition-all text-center shadow-sm">
              חזרה לדף הראשי
            </button>
            {!isAll && (
              <a href="#contact" onClick={onClose} className="px-7 py-3 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all text-center">
                דברו עם מומחה
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function LandingPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveModal(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sticky Navbar Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lag-free mouse parallax handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX - window.innerWidth / 2) / 65;
      const y = (clientY - window.innerHeight / 2) / 65;
      setMousePosition({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen font-heebo overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {activeModal && (
        <ServiceModal activeModal={activeModal} onClose={() => setActiveModal(null)} onSelectService={setActiveModal} />
      )}

      {/* --- EXTRA STYLES FOR SEAMLESS INF MARQUEE --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee-loop {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.333333%, 0, 0); }
        }
        .animate-marquee-custom {
          display: flex;
          width: max-content;
          animation: marquee-loop 48s linear infinite;
        }
        @keyframes subtle-glow-pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.28; transform: scale(1.08); }
        }
        .animate-glow-pulse {
          animation: subtle-glow-pulse 6s ease-in-out infinite;
        }
        @keyframes cyber-light-sweep {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        .animate-sweep-dark {
          animation: cyber-light-sweep 4s ease-in-out infinite;
        }
        @keyframes particle-float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
          50% { transform: translateY(-30px) scale(1.2); opacity: 0.6; }
        }
        .animate-particle-1 { animation: particle-float 7s ease-in-out infinite; }
        .animate-particle-2 { animation: particle-float 9s ease-in-out infinite 1.5s; }
        .animate-particle-3 { animation: particle-float 11s ease-in-out infinite 3s; }
        .animate-particle-4 { animation: particle-float 8s ease-in-out infinite 4.5s; }
      `}} />

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-[100] px-4 md:px-8 py-3 flex justify-between items-center transition-all duration-500 ${
        isScrolled 
          ? "bg-white/80 border-b border-slate-200/40 backdrop-blur-md shadow-[0_1px_15px_-4px_rgba(37,99,235,0.06)] py-2.5" 
          : "bg-white/40 border-b border-transparent backdrop-blur-[2px]"
      }`}>
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <Link href="/" className="transition-all duration-300 shrink-0">
            <Image
              src="/images/logo.png"
              alt="AMK Cloud Technologies"
              width={195}
              height={65}
              unoptimized
              priority
              className="h-auto object-contain transition-all duration-300 opacity-95 hover:opacity-100 hover:drop-shadow-[0_0_15px_rgba(37,99,235,0.22)]"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-8 bg-slate-100/50 backdrop-blur-md px-6 py-2.5 rounded-full border border-slate-200/30 shadow-inner shadow-slate-200/5">
            <Link href="#" className="text-sm font-black text-blue-600 relative after:absolute after:-bottom-1 after:right-0 after:w-full after:h-[2px] after:bg-blue-600 after:rounded-full">בית</Link>
            <Link href="#services" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors relative after:absolute after:-bottom-1 after:right-0 after:w-0 after:h-[2px] after:bg-blue-600 after:rounded-full after:transition-all hover:after:w-full">שירותים</Link>
            <Link href="#monitoring" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors relative after:absolute after:-bottom-1 after:right-0 after:w-0 after:h-[2px] after:bg-blue-600 after:rounded-full after:transition-all hover:after:w-full">פתרונות</Link>
            <Link href="#testimonials" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors relative after:absolute after:-bottom-1 after:right-0 after:w-0 after:h-[2px] after:bg-blue-600 after:rounded-full after:transition-all hover:after:w-full">תמיכה</Link>
            <Link href="#contact" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors relative after:absolute after:-bottom-1 after:right-0 after:w-0 after:h-[2px] after:bg-blue-600 after:rounded-full after:transition-all hover:after:w-full">צור קשר</Link>
          </div>

          <div className="flex items-center gap-3">
            <a href="#contact" className="hidden md:flex items-center gap-2 px-5 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-full text-xs font-black hover:bg-slate-100 hover:border-slate-300 active:scale-[0.97] transition-all">
              <Headphones className="w-3.5 h-3.5 text-blue-600" />
              דברו עם מומחה
            </a>
            <Link href="/login" className="px-5 py-2.5 bg-blue-600 text-white rounded-full text-xs font-black hover:bg-blue-700 hover:shadow-[0_6px_20px_rgba(37,99,235,0.22)] active:scale-[0.97] transition-all shadow-md">
              כניסה למערכת
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-all active:scale-[0.92]"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Elegant Native Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/30 backdrop-blur-sm z-[150]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-[160] shadow-2xl p-6 flex flex-col justify-between border-l border-slate-100/50"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <Image
                    src="/images/logo.png"
                    alt="AMK"
                    width={130}
                    height={40}
                    unoptimized
                    className="object-contain"
                  />
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-full transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-5 pt-8 text-right">
                  <Link href="#" onClick={() => setMobileMenuOpen(false)} className="text-base font-black text-blue-600">בית</Link>
                  <Link href="#services" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold text-slate-700 hover:text-blue-600 transition-colors">שירותים</Link>
                  <Link href="#monitoring" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold text-slate-700 hover:text-blue-600 transition-colors">פתרונות</Link>
                  <Link href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold text-slate-700 hover:text-blue-600 transition-colors">תמיכה</Link>
                  <Link href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold text-slate-700 hover:text-blue-600 transition-colors">צור קשר</Link>
                </div>
              </div>

              <div className="space-y-4">
                <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-full text-sm font-black hover:bg-slate-100 transition-all">
                  <Headphones className="w-4 h-4 text-blue-600" />
                  דברו עם מומחה
                </a>
                <p className="text-[10px] text-slate-400 text-center font-bold">© AMK Cloud Technologies</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="pt-28 pb-10 md:pt-36 md:pb-14 overflow-hidden relative min-h-[85vh] flex items-center z-10">
        {/* Soft grid inside hero */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.008)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.008)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        
        {/* Localized Cinematic Glow pulse behind hero visual */}
        <div className="absolute -left-[10%] top-[20%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-glow-pulse" />

        {/* Minimal Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute w-2 h-2 rounded-full bg-blue-400/20 top-1/4 right-1/3 animate-particle-1" />
          <div className="absolute w-3 h-3 rounded-full bg-indigo-400/15 top-1/2 left-1/4 animate-particle-2" />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-blue-500/30 bottom-1/4 right-1/4 animate-particle-3" />
          <div className="absolute w-2.5 h-2.5 rounded-full bg-indigo-500/20 top-2/3 right-1/2 animate-particle-4" />
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          
          {/* Text Content (Right side in RTL) */}
          <div className="space-y-6 lg:col-span-6 text-center lg:text-right order-2 lg:order-1">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-50/80 border border-blue-100/50 text-blue-600 text-[10px] font-black uppercase tracking-widest shadow-sm shadow-blue-500/5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
              NEXT GENERATION CLOUD COMPUTING
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.15] tracking-tight text-slate-900">
              העתיד של <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 filter drop-shadow-sm">הענן כבר כאן.</span>
            </h1>
            
            <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-semibold">
              תשתית ענן מתקדמת מבית AMK Cloud Technologies. עוצמתית, מאובטחת, גמישה. נבנית כדי להאיץ את העסק שלך קדימה.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link href="/login" className="px-8 py-4 bg-blue-600 text-white rounded-full font-black text-base hover:bg-blue-700 hover:shadow-[0_8px_30px_rgba(37,99,235,0.25)] active:scale-[0.98] hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-3">
                התחל עכשיו
                <ChevronRight className="w-4.5 h-4.5 rotate-180" />
              </Link>
              <a href="#contact" className="px-8 py-4 bg-white border border-slate-200/80 text-slate-700 rounded-full font-black text-base hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-3 shadow-sm">
                צור קשר עם מומחה
                <ChevronRight className="w-4.5 h-4.5 rotate-180" />
              </a>
            </div>
          </div>

          {/* Hero Image (Left side in RTL) */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end order-1 lg:order-2">
            <motion.div 
              style={{
                transform: `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0)`,
                transition: "transform 0.4s cubic-bezier(0.1, 0.8, 0.2, 1)"
              }}
              className="relative w-full max-w-[550px] md:max-w-[620px] aspect-square flex items-center justify-center"
            >
              {/* Pulsing cyan highlight bloom directly behind image */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-indigo-500/10 rounded-full blur-[80px] scale-90 pointer-events-none animate-glow-pulse" />

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full relative"
              >
                <Image
                  src="/images/cloud2.png"
                  alt="AMK Cloud Infrastructure"
                  fill
                  priority
                  quality={100}
                  unoptimized
                  className="object-contain drop-shadow-[0_12px_40px_rgba(37,99,235,0.06)] relative z-10"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mb-20 relative z-20">
        <div className="bg-white/80 backdrop-blur-md rounded-[2.2rem] border border-slate-200/40 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.02)] flex flex-col md:flex-row justify-between items-center divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-100/80">
          <StatWrapper icon={Users} label="לקוחות מרוצים">
            <CountUp end={500} suffix="+" className="text-3xl font-black text-slate-900 leading-none tracking-tight" />
          </StatWrapper>
          <StatWrapper icon={Shield} label="אבטחת שירות">
            <CountUp end={99.99} decimals={2} suffix="%" className="text-3xl font-black text-slate-900 leading-none tracking-tight" />
          </StatWrapper>
          <StatWrapper icon={Headphones} label="תמיכה טכנית">
            <RevealText text="24/7" />
          </StatWrapper>
          <StatWrapper icon={Globe} label="תשתית מקומית">
            <SmoothRevealText text="ישראל" />
          </StatWrapper>
        </div>
      </div>

      {/* Services Section */}
      <section id="services" className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center space-y-4 mb-16">
            <div className="text-blue-600 font-extrabold text-xs tracking-[0.12em] uppercase">כל השירותים במקום אחד</div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">פתרונות ענן מתקדמים לעסק שלך</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-base font-semibold leading-relaxed">חבילת שירותים מקיפה המספקת לעסק שלך את כל מה שצריך כדי לצמוח בביטחון מלא.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <MainServiceCard onClick={() => setActiveModal("vps")} icon={Server} title="שרתי VPS וירטואליים" desc="ביצועים גבוהים, גמישות מלאה וניהול משאבים חכם." />
            <MainServiceCard onClick={() => setActiveModal("dr")} icon={Database} title="גיבוי והתאוששות מאסון" desc="גיבוי אוטומטי, מאובטח ושחזור מהיר לכל סביבת עבודה." />
            <MainServiceCard onClick={() => setActiveModal("cloud")} icon={Cloud} title="אחסון ענן מאובטח" desc="פתרונות אחסון מאובטחים מבוססי טכנולוגיות הענן המתקדמות ביותר." />
          </div>

          {/* Secondary Services Pills */}
          <div className="flex flex-wrap items-center justify-center gap-4.5 max-w-4xl mx-auto pt-6">
            <ServicePill onClick={() => setActiveModal("email")} icon={Mail} title="דוא״ל לעסקים" />
            <ServicePill onClick={() => setActiveModal("remote")} icon={Monitor} title="תמיכה מרחוק" />
            <ServicePill onClick={() => setActiveModal("voip")} icon={PhoneCall} title="VOIP" />
            <ServicePill onClick={() => setActiveModal("helpdesk")} icon={Headphones} title="Help Desk IT" />
            <ServicePill onClick={() => setActiveModal("dns")} icon={Globe} title="DNS" />
          </div>

          <div className="mt-14 text-center">
            <button onClick={() => setActiveModal("all")} className="px-8 py-3.5 bg-white border border-slate-200/80 text-slate-700 rounded-full font-black text-sm hover:border-blue-500/40 hover:text-blue-600 transition-all flex items-center justify-center gap-2 mx-auto shadow-sm hover:shadow active:scale-[0.98]">
              צפה בכל השירותים
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </section>

      {/* About + System Status Section (Dark Infrastructure) */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        id="monitoring"
        className="py-24 bg-slate-900 text-white relative overflow-hidden z-10"
      >
        {/* Cinematic micro cyber lines grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* Slow background rotating cinematic orbs */}
        <div className="absolute -top-[10%] left-1/4 w-[450px] h-[450px] bg-blue-600/15 rounded-full blur-[110px] pointer-events-none animate-glow-pulse" />
        <div className="absolute -bottom-[10%] right-1/4 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[110px] pointer-events-none animate-glow-pulse" style={{ animationDelay: '3s' }} />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

            {/* Right Side: About Content */}
            <div className="space-y-7 lg:col-span-7 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700/80 text-blue-400 text-xs font-black uppercase tracking-wider shadow-inner">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                מי אנחנו
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                AMK Cloud Technologies
              </h2>
              <h3 className="text-xl md:text-2xl font-black text-blue-400">
                פתרונות ענן חכמים לעסקים
              </h3>
              <p className="text-slate-300 text-base md:text-lg leading-relaxed font-semibold max-w-2xl">
                אנחנו מספקים פתרונות ענן ותשתיות IT מתקדמים לחברות ועסקים בישראל. עם ניסיון מקצועי, שירות אישי ותמיכה טכנית זמינה, אנחנו עוזרים לעסקים לעבוד בצורה יציבה, מאובטחת ומהירה.
              </p>

              <div className="space-y-4 pt-4 border-t border-slate-800/80 max-w-xl">
                {[
                  "גיבוי יומי אוטומטי — הכל שמור תמיד",
                  "אבטחה ברמה גבוהה",
                  "תמיכה טכנית 24/7 כולל סופי שבוע",
                  "התאוששות מאסון בזמן קצר"
                ].map((bullet, idx) => (
                  <div key={idx} className="flex items-center gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="text-slate-200 font-bold text-sm md:text-base">{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Left Side: System Status Card */}
            <div className="lg:col-span-5 order-1 lg:order-2 w-full max-w-md mx-auto lg:mr-auto">
              <div className="bg-slate-950/60 backdrop-blur-md border border-slate-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                {/* Micro reflected sweep light */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-overlay">
                  <div className="absolute top-0 bottom-0 w-[40%] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-sweep-dark" />
                </div>
                
                {/* Background glow decoration */}
                <div className="absolute -top-12 -left-12 w-28 h-28 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/50">
                  <h3 className="text-xl font-black text-white tracking-tight">סטטוס מערכות</h3>
                  <div className="px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-3.5 h-3.5 bg-emerald-400/30 blur-[4px] rounded-full animate-ping" />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 relative z-10" />
                    </div>
                    <span className="text-emerald-400 text-xs font-black">הכל פעיל</span>
                  </div>
                </div>

                {/* Status Rows */}
                <div className="space-y-4 mb-8">
                  {[
                    "שרתי VPS",
                    "גיבויים אוטומטיים",
                    "שרת דואר",
                    "VOIP ענן",
                    "Firewall"
                  ].map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-800/40 last:border-0">
                      <span className="text-slate-300 font-bold text-sm">{service}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-xs font-bold">פעיל</span>
                        <div className="relative flex items-center justify-center">
                          <div className="absolute w-3.5 h-3.5 bg-emerald-400/20 blur-[3px] rounded-full animate-pulse" />
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 relative z-10 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Bar Bottom */}
                <div className="pt-6 border-t border-slate-800/60">
                  <div className="flex justify-between items-end mb-2.5">
                    <div className="text-slate-400 font-bold text-xs">זמינות חודשית</div>
                    <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 font-bold">
                      <CountUp className="text-2xl font-black leading-none" end={99.97} decimals={2} suffix="%" />
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden p-[1px] border border-slate-800/30">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "99.97%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.section>

      {/* Feature Sections (Split) */}
      <section className="py-20 bg-transparent z-10 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* AI Section */}
          <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-10 md:p-14 border border-slate-200/50 flex flex-col justify-between overflow-hidden relative min-h-[460px] shadow-[0_8px_30px_rgba(0,0,0,0.01)] hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-500 group">
            {/* Background cinematic mesh glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="relative z-10 space-y-5 max-w-md">
              <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-blue-50 border border-blue-100/50 text-blue-600 text-[10px] font-black uppercase tracking-widest shadow-sm">
                AI POWERED SUPPORT
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">תמיכה חכמה עם AI</h3>
              <p className="text-base text-slate-500 font-semibold leading-relaxed">מערכת AI מתקדמת שזמינה לשאלות, מדריכה ומספקת פתרונות מיידיים 24/7.</p>
              <ul className="space-y-3 pt-2">
                {["תשובות מדוייקות", "פתרונות מיידיים", "מעקב ושחזור אוטומטי"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3.5 text-slate-700 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              
              <button onClick={() => setActiveModal("remote")} className="mt-4 px-7 py-3.5 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center gap-2.5 text-sm w-fit shadow-md">
                מערך תמיכה
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
            
            {/* Bot Image Container */}
            <div className="absolute bottom-[-10px] left-[-20px] md:bottom-0 md:left-0 w-[240px] h-[240px] md:w-[320px] md:h-[300px] z-10">
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full relative"
              >
                <Image
                  src="/images/ai-assistant-bot.png"
                  alt="AI Assistant Bot"
                  fill
                  className="object-contain object-bottom group-hover:scale-[1.03] transition-transform duration-500"
                  sizes="(max-width: 768px) 240px, 320px"
                  unoptimized={true}
                />

                {/* Typing Dots Bubble */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: [0, 1, 1, 0], scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 3.5, ease: "easeInOut", delay: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  className="absolute top-[20%] right-10 md:right-14 bg-white shadow-xl border border-slate-100/80 rounded-2xl rounded-br-sm px-4 py-3 flex gap-1 z-20 shadow-blue-500/5"
                >
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </motion.div>

                {/* Chat bubble chip */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="absolute top-[35%] left-6 md:left-10 bg-blue-600/10 backdrop-blur-sm border border-blue-200 text-blue-700 rounded-xl px-3 py-1.5 text-xs font-black shadow-sm z-20"
                >
                  Online
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Monitoring Section */}
          <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-10 md:p-14 border border-slate-200/50 flex flex-col justify-between overflow-hidden relative min-h-[460px] shadow-[0_8px_30px_rgba(0,0,0,0.01)] hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-500 group">
            {/* Background glow mesh */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="relative z-10 space-y-5 max-w-md">
              <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-blue-50 border border-blue-100/50 text-blue-600 text-[10px] font-black uppercase tracking-widest shadow-sm">
                ניהול חכם בטוח ואמין
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">ניהול חכם<br />ושקט נפשי</h3>
              <p className="text-base text-slate-500 font-semibold leading-relaxed">מערכת ניהול מתקדמת לעסק שלך, עם התראות בזמן אמת וניטור 24/7.</p>
              <ul className="space-y-3 pt-2">
                {["ניטור שרתים חכם", "התראות בזמן אמת", "דוחות מפורטים"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3.5 text-slate-700 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              
              <button onClick={() => setActiveModal("helpdesk")} className="mt-4 px-7 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-black hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all flex items-center gap-2.5 text-sm w-fit shadow-sm">
                לוח בקרה
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
            
            {/* Monitoring Dashboard Image */}
            <div className="absolute bottom-[-10px] left-[-20px] md:bottom-0 md:left-0 w-[300px] h-[250px] md:w-[380px] md:h-[300px] group">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full relative"
              >
                <Image
                  src="/images/dashboard-analytics-laptop.png"
                  alt="Dashboard Analytics"
                  fill
                  className="object-contain object-bottom group-hover:scale-[1.02] transition-transform duration-500 relative z-10"
                  sizes="(max-width: 768px) 300px, 380px"
                  unoptimized={true}
                />

                {/* Light Sweep Effect */}
                <div className="absolute inset-0 z-20 overflow-hidden mix-blend-overlay">
                  <motion.div
                    initial={{ x: '-100%' }}
                    whileInView={{ x: '200%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, ease: "easeInOut", delay: 0.3 }}
                    className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12 opacity-40"
                  />
                </div>

                {/* Progress Ring Overlay */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="absolute top-[35%] right-[20%] z-30 bg-white/95 backdrop-blur-sm border border-slate-100 rounded-full p-1.5 shadow-xl flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-500"
                >
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3.5" fill="none" className="text-slate-100" />
                    <motion.circle
                      initial={{ strokeDashoffset: 100 }}
                      whileInView={{ strokeDashoffset: 2 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 1.2 }}
                      cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3.5" fill="none" className="text-blue-600"
                      strokeDasharray="100" strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[9px] font-black text-slate-800">98%</span>
                </motion.div>

                {/* Data Chip 1 */}
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="absolute top-[20%] left-[15%] z-30 bg-white border border-slate-100 shadow-lg rounded-lg px-2.5 py-1.5 flex items-center gap-2 group-hover:-translate-y-1 transition-transform duration-500"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-slate-600">All Systems</span>
                </motion.div>

                {/* Data Chip 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="absolute bottom-[20%] left-[5%] z-30 bg-blue-600 text-white shadow-xl shadow-blue-600/20 rounded-lg px-3 py-1.5 flex flex-col group-hover:translate-y-1 transition-transform duration-500"
                >
                  <span className="text-[7px] opacity-80 uppercase tracking-widest mb-0.5">Uptime</span>
                  <span className="text-xs font-black leading-none">24/7</span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Why AMK Infrastructure Section */}
      <section className="py-24 relative overflow-hidden bg-white/40 backdrop-blur-[1px] border-t border-slate-100/50">
        {/* Soft radial background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50/40 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100/50 text-blue-600 text-[11px] font-black uppercase tracking-widest shadow-sm shadow-blue-500/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-duration-1000"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              AMK Infrastructure
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">תשתית ענן ברמה ארגונית</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-base md:text-lg font-semibold leading-relaxed">
              פתרונות מתקדמים עם ביצועים גבוהים, אבטחה חכמה וזמינות מלאה לעסקים.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { t: "תשתית בישראל", d: "חוות שרתים מקומיות עם ביצועים מעולים", i: Globe, m: "99.99% Uptime" },
              { t: "אבטחה ברמה גבוהה", d: "הגנה מתקדמת וניטור איומים רציף", i: Lock, m: "Enterprise Grade" },
              { t: "ביצועים ללא פשרות", d: "חומרה מתקדמת ורשת מהירה במיוחד", i: Zap, m: "Next-Gen Hardware" },
              { t: "צוות מומחים", d: "ליווי מקצועי וניטור מערכות 24/7", i: Users, m: "24/7 Monitoring" },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group p-8 bg-white/70 backdrop-blur-md border border-slate-200/50 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.01)] hover:shadow-2xl hover:shadow-blue-600/5 hover:border-blue-200/80 transition-all duration-500 flex flex-col items-center text-center md:items-start md:text-right"
              >
                <div className="relative w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:rotate-1 transition-transform duration-500 shadow-sm shadow-blue-500/5">
                  <div className="absolute inset-0 bg-blue-600/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <item.i className="w-6 h-6 relative z-10" />
                </div>

                <div className="space-y-2.5">
                  <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{item.m}</div>
                  <h4 className="text-xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{item.t}</h4>
                  <p className="text-slate-500 font-semibold text-sm leading-relaxed">{item.d}</p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100/80 w-full flex items-center justify-between text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-[10px] font-black uppercase tracking-tighter">Learn More</span>
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section id="testimonials" className="py-24 bg-slate-50/50 relative border-t border-b border-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center mb-20">
          <div className="text-blue-600 font-extrabold text-xs tracking-widest uppercase mb-2">לקוחות מספרים</div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            עסקים שבחרו ב-AMK
          </h2>
          <p className="text-slate-500 font-semibold text-base">משתפים מהניסיון שלהם איתנו.</p>
        </div>

        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-center gap-16 md:gap-8 lg:gap-12">
          {[
            {
              name: "דניאל כהן",
              role: "מנהל מערכות מידע · NovaTech",
              body: "מאז שעברנו ל-AMK השירות הפך יציב, מהיר ומקצועי יותר. הצוות תמיד זמין ונותן מענה ברור.",
              image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=faces&q=80"
            },
            {
              name: "רועי לוי",
              role: "בעל עסק · CloudNet",
              body: "פתרונות ה-VPS והגיבוי של AMK נתנו לנו שקט נפשי אמיתי וניהול הרבה יותר פשוט.",
              image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces&q=80"
            },
            {
              name: "מאיה ישראלי",
              role: "מנהלת תפעול · Orion Labs",
              body: "התמיכה הטכנית מהירה מאוד, והמערכת החכמה עוזרת לנו לפתור תקלות בלי לבזבז זמן.",
              image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces&q=80"
            }
          ].map((review, i) => (
            <div 
              key={i} 
              className="group relative w-full max-w-[325px] mx-auto bg-white border border-slate-200/50 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.01)] hover:shadow-2xl hover:shadow-blue-600/5 hover:-translate-y-1 transition-all duration-500 px-6 pb-8 pt-16 flex flex-col items-center text-center"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[90px] h-[90px] rounded-full border-[5px] border-slate-50/50 shadow-md overflow-hidden bg-slate-100 group-hover:scale-105 transition-transform duration-500">
                <Image src={review.image} alt={review.name} fill className="object-cover" unoptimized={true} />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">{review.name}</h3>
              <p className="text-xs font-bold text-slate-400 mb-4">{review.role}</p>
              <p className="text-slate-600 text-sm font-semibold leading-relaxed flex-1">"{review.body}"</p>
              
              <div className="flex gap-1 mt-6 text-[#fbbf24] drop-shadow-sm group-hover:scale-105 transition-transform duration-300">
                {[...Array(5)].map((_, index) => (
                  <svg key={index} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partners Ecosystem Strip */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[300px] bg-blue-400/5 blur-[120px] pointer-events-none" />

        <div className="text-center mb-10 relative z-10">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            שותפים וטכנולוגיות מובילות
          </h2>
          <p className="text-slate-500 font-semibold text-sm">
            AMK עובדת עם פתרונות ותשתיות מהמובילים בעולם.
          </p>
        </div>

        <div className="relative w-full overflow-hidden flex flex-col items-center">
          {/* Fading Edges */}
          <div className="absolute top-0 left-0 w-16 md:w-56 h-full bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
          <div className="absolute top-0 right-0 w-16 md:w-56 h-full bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />

          {/* Continuous Loop Marquee Container */}
          <div className="relative w-full overflow-hidden flex items-center py-2 z-10">
            {(() => {
              const partners = [
                "Veeam Software",
                "Microsoft Cloud",
                "VMware",
                "Cisco Systems",
                "Dell Technologies",
                "Intel",
                "HP Enterprise",
                "RedHat Linux",
                "Lenovo Group"
              ];
              const repeatedPartners = [...partners, ...partners, ...partners];
              return (
                <div className="animate-marquee-custom flex hover:[animation-play-state:paused]" dir="ltr">
                  {repeatedPartners.map((logo, idx) => (
                    <div
                      key={idx}
                      className="group bg-white border border-slate-200/50 rounded-[1.8rem] px-8 py-5 md:px-10 md:py-6 shadow-[0_4px_12px_rgba(0,0,0,0.005)] hover:shadow-[0_0_20px_rgba(37,99,235,0.12)] hover:-translate-y-0.5 hover:border-blue-300 transition-all duration-300 flex items-center justify-center min-w-[160px] md:min-w-[210px] cursor-default shrink-0 mr-6 md:mr-8"
                    >
                      <span className="text-base md:text-lg font-black text-slate-400 group-hover:text-blue-600 transition-colors duration-300 tracking-tight filter grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100">
                        {logo}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white relative overflow-hidden z-10 border-t border-slate-100/80">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">נשמח לשמוע ממך</h2>
          <p className="text-slate-500 font-semibold text-base mb-12">צוות AMK זמין עבורך 24/7</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="mailto:info@amk.systems" className="bg-slate-50/50 backdrop-blur-md rounded-2xl p-6 border border-slate-100 flex items-center gap-4 justify-center md:justify-start hover:shadow-[0_12px_30px_rgba(37,99,235,0.12)] hover:-translate-y-1 hover:border-blue-300/85 hover:bg-white transition-all duration-300 group">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-blue-600 shadow-sm border border-slate-100/80 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <MailIcon className="w-5 h-5" />
              </div>
              <div className="text-right">
                <div className="font-black text-slate-900 text-sm transition-colors">אימייל</div>
                <div className="text-slate-500 font-semibold text-sm">info@amk.systems</div>
              </div>
            </a>

            <a href="tel:0779903638" className="bg-slate-50/50 backdrop-blur-md rounded-2xl p-6 border border-slate-100 flex items-center gap-4 justify-center md:justify-start hover:shadow-[0_12px_30px_rgba(37,99,235,0.12)] hover:-translate-y-1 hover:border-blue-300/85 hover:bg-white transition-all duration-300 group">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-blue-600 shadow-sm border border-slate-100/80 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div className="text-right">
                <div className="font-black text-slate-900 text-sm transition-colors">טלפון</div>
                <div className="text-slate-500 font-semibold text-sm">077-990-3638</div>
              </div>
            </a>

            <a href="https://amk.systems" target="_blank" rel="noopener noreferrer" className="bg-slate-50/50 backdrop-blur-md rounded-2xl p-6 border border-slate-100 flex items-center gap-4 justify-center md:justify-start hover:shadow-[0_12px_30px_rgba(37,99,235,0.12)] hover:-translate-y-1 hover:border-blue-300/85 hover:bg-white transition-all duration-300 group">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-blue-600 shadow-sm border border-slate-100/80 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Globe className="w-5 h-5" />
              </div>
              <div className="text-right">
                <div className="font-black text-slate-900 text-sm transition-colors">אתר אינטרנט</div>
                <div className="text-slate-500 font-semibold text-sm">amk.systems</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Remote Support & Footer */}
      <footer className="py-20 bg-slate-50/50 border-t border-slate-200/60 relative overflow-hidden z-10">
        {/* Soft background blue glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] bg-blue-500/5 blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 relative z-10 flex flex-col items-center">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-3">תמיכה מרחוק</h2>
            <p className="text-slate-500 font-semibold max-w-lg mx-auto text-sm md:text-base leading-relaxed">
              לחצו להורדת האפליקציה המתאימה, כדי שצוות התמיכה של AMK יוכל להתחבר ולעזור לכם במהירות ובאופן מאובטח.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mb-10">
            {/* TeamViewer Card */}
            <a
              href="https://download.teamviewer.com/download/TeamViewer_Setup_x64.exe"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white border border-slate-200/60 rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-2xl hover:shadow-blue-600/8 hover:-translate-y-1.5 hover:border-blue-200/80 transition-all duration-500 flex flex-col items-center text-center h-full"
            >
              <div className="relative w-[150px] h-[70px] md:w-[180px] md:h-[80px] mb-4 transition-all duration-300 group-hover:scale-[1.05] flex items-center justify-center">
                {/* Soft glow behind logo */}
                <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Image
                  src="/images/teamviewer.png"
                  alt="TeamViewer"
                  width={180}
                  height={80}
                  className="object-contain relative z-10 w-full h-full filter brightness-105"
                />
              </div>
              <p className="text-slate-500 text-xs md:text-sm font-bold mb-6 leading-relaxed">התוכנה המומלצת לחיבור מרחוק</p>
              <div className="mt-auto flex items-center gap-2 text-blue-600 font-black text-xs md:text-sm bg-blue-50/80 px-6 py-3 rounded-full group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/30 transition-all duration-300 shadow-sm border border-blue-100/30">
                <Download className="w-4 h-4" />
                הורדת TeamViewer
              </div>
            </a>

            {/* AnyDesk Card */}
            <a
              href="https://download.anydesk.com/AnyDesk.exe"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white border border-slate-200/60 rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-2xl hover:shadow-red-600/8 hover:-translate-y-1.5 hover:border-red-200/80 transition-all duration-500 flex flex-col items-center text-center h-full"
            >
              <div className="relative w-[150px] h-[70px] md:w-[180px] md:h-[80px] mb-4 transition-all duration-300 group-hover:scale-[1.05] flex items-center justify-center">
                {/* Soft glow behind logo */}
                <div className="absolute inset-0 bg-red-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Image
                  src="/images/anydesk.png"
                  alt="AnyDesk"
                  width={180}
                  height={80}
                  className="object-contain relative z-10 w-full h-full filter brightness-105"
                />
              </div>
              <p className="text-slate-500 text-xs md:text-sm font-bold mb-6 leading-relaxed">אפליקציה קלה ומהירה במיוחד</p>
              <div className="mt-auto flex items-center gap-2 text-red-500 font-black text-xs md:text-sm bg-red-50/80 px-6 py-3 rounded-full group-hover:bg-red-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-red-600/30 transition-all duration-300 shadow-sm border border-red-100/30">
                <Download className="w-4 h-4" />
                הורדת AnyDesk
              </div>
            </a>
          </div>

          <p className="text-slate-455 text-xs font-bold mb-16 text-center max-w-sm">
            לאחר ההורדה, פתחו את האפליקציה ומסרו לנציג התמיכה את קוד החיבור שמופיע במסך.
          </p>

          <div className="w-full h-px bg-slate-200/80 mb-8" />

          <p className="text-slate-400 text-xs font-bold">
            © {new Date().getFullYear()} AMK Cloud Technologies. כל הזכויות שמורות.
          </p>
        </div>
      </footer>
    </div>
  );
}
