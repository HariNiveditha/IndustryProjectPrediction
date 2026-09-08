import { Link } from "react-router-dom";
import React from "react";
import {
  Eye,
  User,
  ArrowRight,
  Target,
  BarChart3,
  ShieldCheck,
  Users,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

const FEATURES = [
  {
    icon: Target,
    title: "Risk Prediction",
    description: "Identify cost and time risks before they escalate.",
  },
  {
    icon: BarChart3,
    title: "Data-Driven Insights",
    description: "Make informed decisions with real-time analytics.",
  },
  {
    icon: ShieldCheck,
    title: "Proactive Monitoring",
    description: "Stay ahead with early warning alerts.",
  },
  {
    icon: Users,
    title: "Better Outcomes",
    description:
      "Build a more efficient, transparent and accountable infrastructure ecosystem.",
  },
];

function FloatingCard({ className, children }) {
  return (
    <div
      className={`absolute bg-white rounded-2xl shadow-lg shadow-blue-100 p-4 ${className}`}
    >
      {children}
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="relative w-full h-[420px] md:h-[460px] select-none">
      {/* Soft background blob */}
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 overflow-hidden">
        {/* City skyline silhouette */}
        <svg
          viewBox="0 0 800 220"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 w-full h-40 opacity-70"
        >
          <path
            d="M0 220 L0 150 L40 150 L40 120 L80 120 L80 150 L120 150 L120 100 L140 100 L140 60 L160 60 L160 100 L180 100 L180 150 L230 150 L230 90 L250 90 L250 130 L270 130 L270 150 L320 150 L320 110 L350 110 L350 150 L400 150 L400 70 L420 40 L440 70 L440 150 L500 150 L500 120 L540 120 L540 150 L590 150 L590 90 L610 90 L610 150 L660 150 L660 110 L700 110 L700 150 L760 150 L760 130 L800 130 L800 220 Z"
            fill="#93c5fd"
          />
          <path
            d="M0 220 L0 180 Q200 140 400 175 T800 170 L800 220 Z"
            fill="#bfdbfe"
          />
        </svg>
        {/* Winding river/road */}
        <svg
          viewBox="0 0 800 220"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 w-full h-32"
        >
          <path
            d="M-20 200 C 150 160, 250 220, 400 180 S 650 140, 820 190"
            stroke="#e0edff"
            strokeWidth="22"
            fill="none"
          />
        </svg>
        {/* Connector dots/lines */}
        <div className="absolute top-10 right-24 w-2 h-2 rounded-full bg-blue-300" />
        <div className="absolute top-24 right-10 w-1.5 h-1.5 rounded-full bg-blue-300" />
        <div className="absolute top-16 left-1/3 w-1.5 h-1.5 rounded-full bg-blue-300" />
      </div>

      {/* Central eye emblem */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-56 h-32 md:w-64 md:h-36">
          <svg viewBox="0 0 200 110" className="w-full h-full drop-shadow-xl">
            <path
              d="M100 10 C 40 10, 5 55, 5 55 C 5 55, 40 100, 100 100 C 160 100, 195 55, 195 55 C 195 55, 160 10, 100 10 Z"
              fill="none"
              stroke="#1d4ed8"
              strokeWidth="12"
              strokeLinejoin="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center shadow-inner">
              <TrendingUp className="w-8 h-8 md:w-9 md:h-9 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating card: India map */}
      <FloatingCard className="top-6 left-2 md:left-6 w-40">
        <div className="flex flex-col gap-2">
          <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-600" fill="currentColor">
              <path d="M12 2c-1 3-4 4-4 8 0 3 2 5 2 8 0 1 .5 2 2 4 1.5-2 2-3 2-4 0-3 2-5 2-8 0-4-3-5-4-8z" />
            </svg>
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 w-16 bg-gray-200 rounded-full" />
            <div className="h-1.5 w-12 bg-gray-200 rounded-full" />
            <div className="h-1.5 w-14 bg-gray-200 rounded-full" />
          </div>
        </div>
      </FloatingCard>

      {/* Floating card: trend chart */}
      <FloatingCard className="top-2 right-0 md:right-4 w-44">
        <div className="h-1.5 w-16 bg-gray-200 rounded-full mb-3" />
        <svg viewBox="0 0 120 50" className="w-full h-12">
          <polyline
            points="0,45 20,35 40,38 60,20 80,25 100,8 120,5"
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </FloatingCard>

      {/* Floating card: percentage ring */}
      <FloatingCard className="bottom-8 left-0 md:left-4 w-48 flex items-center gap-3">
        <div className="relative w-14 h-14 shrink-0">
          <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#dbeafe" strokeWidth="4" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeDasharray="97.4"
              strokeDashoffset="21.4"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-blue-700">
            78%
          </span>
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="h-1.5 w-full bg-gray-200 rounded-full" />
          <div className="h-1.5 w-3/4 bg-gray-200 rounded-full" />
        </div>
      </FloatingCard>

      {/* Floating card: alert */}
      <FloatingCard className="bottom-4 right-0 md:right-6 w-44 flex items-start gap-3">
        <div className="w-8 h-8 rounded-md bg-red-50 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
        <div className="space-y-1.5 flex-1 pt-1">
          <div className="h-1.5 w-full bg-gray-200 rounded-full" />
          <div className="h-1.5 w-2/3 bg-gray-200 rounded-full" />
        </div>
      </FloatingCard>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">MARG</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#home" className="hover:text-blue-600">
            Home
          </a>

          <a href="#about" className="hover:text-blue-600">
            About
          </a>

          <a href="#features" className="hover:text-blue-600">
            Features
          </a>

          <a href="#contact" className="hover:text-blue-600">
            Contact
          </a>
        </nav>

        <Link
          to="/login"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition"
        >
          <User size={18} />
          Login
        </Link>
      </header>

      {/* Hero */}
      <section id="home" className="max-w-7xl mx-auto px-6 pt-8 pb-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-blue-600 text-sm font-semibold tracking-wide mb-4">
            Insights today, safer tomorrow
          </p>
          <h1 className="text-6xl md:text-7xl font-extrabold text-blue-900 leading-none mb-4">
            MARG
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug mb-4">
            AI-Powered Project Monitoring
            <br className="hidden md:block" /> for a Stronger Tomorrow
          </h2>
          <p className="text-slate-500 text-base leading-relaxed mb-8 max-w-md">
            Predict risks. Prevent delays. Ensure better project outcomes with
            intelligent analytics and real-time insights.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition"
          >
            Get Started
            <ArrowRight size={18} />
          </Link>
        </div>

        <HeroIllustration />
      </section>

      <section id="about" className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            About MARG
          </h2>

          <p className="text-slate-600 max-w-3xl mx-auto leading-relaxed">
            MARG is an AI-powered project monitoring and risk prediction platform
            designed to help organizations monitor project performance, identify
            potential risks, and make informed decisions before delays become
            critical.
          </p>
        </div>
      </section>

      {/* Feature strip */}
      <section id="features" className="bg-blue-50/60 border-t border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Contact Us
          </h2>

          <p className="text-slate-300 mb-6">
            Have questions about MARG? Get in touch with our team.
          </p>

          <a
            href="mailto:contact@marg.com"
            className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}