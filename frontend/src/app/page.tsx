"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CircleUserRound, Menu, X, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, HeartPulse, Clock, Sparkle } from "lucide-react";

export default function VibrantWellnessPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "approach" | "methods">("home");
  const [activeModal, setActiveModal] = useState<"approach" | "methods" | "journey" | "account" | null>(null);

  return (
    <div className="relative w-full h-[100dvh] min-h-[100vh] overflow-hidden flex flex-col justify-between text-white font-sans select-none bg-black">
      {/* 1. Full-viewport Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260715_082433_69699cf8-444b-4484-93cc-053e57896dfd.mp4"
          type="video/mp4"
        />
      </video>

      {/* Subtle Ambient Video Scrim for High-Contrast Readability */}
      <div className="absolute inset-0 bg-black/25 z-[1] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/35 z-[1] pointer-events-none" />

      {/* 2. Top Navigation Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 pt-6 sm:pt-8 flex items-center justify-between">
        {/* Left: Minimalist white custom SVG emblem */}
        <div className="flex items-center gap-3">
          <svg
            className="w-7 h-7 sm:w-8 sm:h-8 text-white shrink-0"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="1.2" strokeOpacity="0.8" />
            <circle cx="16" cy="16" r="8.5" stroke="white" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="2 3" />
            <path
              d="M16 4C16 11.5 28 16 28 16C20.5 16 16 28 16 28C16 20.5 4 16 4 16C11.5 16 16 4 16 4Z"
              stroke="white"
              strokeWidth="1.4"
              fill="white"
              fillOpacity="0.12"
            />
            <circle cx="16" cy="16" r="2" fill="white" />
          </svg>
          <span className="text-base sm:text-lg font-medium tracking-tight text-white whitespace-nowrap">
            Vibrant Wellness
          </span>
        </div>

        {/* Center (Desktop): Floating .liquid-glass pill with links */}
        <nav className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full liquid-glass liquid-glass-interactive">
          <button
            onClick={() => {
              setActiveTab("home");
              setActiveModal(null);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-normal tracking-wide transition-colors cursor-pointer ${
              activeTab === "home" && !activeModal ? "text-white bg-white/10" : "text-white/70 hover:text-white"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => {
              setActiveTab("approach");
              setActiveModal("approach");
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-normal tracking-wide transition-colors cursor-pointer ${
              activeModal === "approach" ? "text-white bg-white/10" : "text-white/70 hover:text-white"
            }`}
          >
            Our Approach
          </button>
          <button
            onClick={() => {
              setActiveTab("methods");
              setActiveModal("methods");
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-normal tracking-wide transition-colors cursor-pointer ${
              activeModal === "methods" ? "text-white bg-white/10" : "text-white/70 hover:text-white"
            }`}
          >
            Healing Methods
          </button>
        </nav>

        {/* Right (Desktop): Round .liquid-glass user account button (CircleUserRound) */}
        <button
          onClick={() => setActiveModal("account")}
          aria-label="User Account"
          className="hidden md:flex w-10 h-10 rounded-full items-center justify-center liquid-glass liquid-glass-interactive text-white/90 hover:text-white transition-transform active:scale-95 cursor-pointer"
        >
          <CircleUserRound className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Mobile: Hamburger button with a 300ms rotate/scale swap between Menu and X */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          className="md:hidden w-10 h-10 rounded-full flex items-center justify-center liquid-glass liquid-glass-interactive text-white/90 z-50 relative cursor-pointer"
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            <Menu
              className={`w-5 h-5 absolute transition-all duration-300 ease-out transform ${
                isMobileMenuOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
              }`}
            />
            <X
              className={`w-5 h-5 absolute transition-all duration-300 ease-out transform ${
                isMobileMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
              }`}
            />
          </div>
        </button>
      </header>

      {/* Mobile Backdrop-blurred Overlay Menu */}
      <div
        className={`fixed inset-0 z-40 bg-black/75 backdrop-blur-xl md:hidden flex flex-col justify-center items-center gap-6 px-8 transition-all duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={() => {
            setActiveTab("home");
            setActiveModal(null);
            setIsMobileMenuOpen(false);
          }}
          className="text-xl font-light text-white tracking-tight cursor-pointer"
        >
          Home
        </button>
        <button
          onClick={() => {
            setActiveTab("approach");
            setActiveModal("approach");
            setIsMobileMenuOpen(false);
          }}
          className="text-xl font-light text-white/80 hover:text-white tracking-tight cursor-pointer"
        >
          Our Approach
        </button>
        <button
          onClick={() => {
            setActiveTab("methods");
            setActiveModal("methods");
            setIsMobileMenuOpen(false);
          }}
          className="text-xl font-light text-white/80 hover:text-white tracking-tight cursor-pointer"
        >
          Healing Methods
        </button>
        <button
          onClick={() => {
            setActiveModal("account");
            setIsMobileMenuOpen(false);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full liquid-glass text-sm text-white/90 mt-4 cursor-pointer"
        >
          <CircleUserRound className="w-4 h-4" />
          <span>My Wellness Account</span>
        </button>
      </div>

      {/* 3. Hero Content */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 flex-1 flex flex-col items-center justify-center text-center my-auto">
        {/* Badge: Pill containing 4 overlapping circular user avatars with "our path to natural wellness" */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full liquid-glass mb-6 sm:mb-8 shadow-sm">
          <div className="flex -space-x-2 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"
              alt="Member avatar 1"
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover ring-1 ring-white/50"
            />
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80"
              alt="Member avatar 2"
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover ring-1 ring-white/50"
            />
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80"
              alt="Member avatar 3"
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover ring-1 ring-white/50"
            />
            <img
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&h=80&q=80"
              alt="Member avatar 4"
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover ring-1 ring-white/50"
            />
          </div>
          <span className="text-xs sm:text-[13px] font-normal tracking-wide text-white/90">
            our path to natural wellness
          </span>
        </div>

        {/* Headline: <h1>Heal Your Body<br/>Naturally</h1> in ultra-large, tight-tracking typography (-0.05em) */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[104px] xl:text-[116px] font-medium leading-[0.93] tracking-[-0.05em] text-white max-w-5xl mb-6">
          Heal Your Body<br />Naturally
        </h1>

        {/* Subtitle: "Holistic wellness. Transformative results." */}
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light text-white/80 max-w-xl mx-auto mb-8 sm:mb-10 tracking-tight">
          Holistic wellness. Transformative results.
        </p>

        {/* CTA: .liquid-glass rounded button reading "Begin Your Journey" */}
        <button
          onClick={() => setActiveModal("journey")}
          className="px-8 py-3.5 sm:px-10 sm:py-4 rounded-full liquid-glass liquid-glass-interactive text-sm sm:text-base font-normal tracking-wide text-white hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg shadow-black/20"
        >
          Begin Your Journey
        </button>
      </main>

      {/* 4. Footer Metrics */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 pb-6 sm:pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs tracking-tight text-white/90">
        {/* Stat 1: 9-dot triangular pyramid icon, "48 Hours", "Initial Consultation" */}
        <div className="flex items-center gap-3.5 px-4 py-2.5 rounded-2xl liquid-glass w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.04] shrink-0">
            <svg className="w-5 h-5 text-white/90" viewBox="0 0 24 24" fill="currentColor">
              {/* 9-dot triangular pyramid */}
              <circle cx="12" cy="4" r="1.6" />
              <circle cx="8.5" cy="9.5" r="1.6" />
              <circle cx="15.5" cy="9.5" r="1.6" />
              <circle cx="5" cy="15" r="1.6" />
              <circle cx="12" cy="15" r="1.6" />
              <circle cx="19" cy="15" r="1.6" />
              <circle cx="7" cy="20.5" r="1.6" />
              <circle cx="12" cy="20.5" r="1.6" />
              <circle cx="17" cy="20.5" r="1.6" />
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-medium tracking-tight text-white">48 Hours</span>
            <span className="text-[11px] font-light text-white/70">Initial Consultation</span>
          </div>
        </div>

        {/* Stat 2: 3x3 checkerboard dot grid icon, "Initial Consultation", "Healing Sessions" */}
        <div className="flex items-center gap-3.5 px-4 py-2.5 rounded-2xl liquid-glass w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.04] shrink-0">
            <svg className="w-5 h-5 text-white/90" viewBox="0 0 24 24" fill="currentColor">
              {/* 3x3 checkerboard dot grid */}
              <circle cx="5" cy="5" r="1.8" className="opacity-100" />
              <circle cx="12" cy="5" r="1.8" className="opacity-35" />
              <circle cx="19" cy="5" r="1.8" className="opacity-100" />
              <circle cx="5" cy="12" r="1.8" className="opacity-35" />
              <circle cx="12" cy="12" r="1.8" className="opacity-100" />
              <circle cx="19" cy="12" r="1.8" className="opacity-35" />
              <circle cx="5" cy="19" r="1.8" className="opacity-100" />
              <circle cx="12" cy="19" r="1.8" className="opacity-35" />
              <circle cx="19" cy="19" r="1.8" className="opacity-100" />
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-medium tracking-tight text-white">Initial Consultation</span>
            <span className="text-[11px] font-light text-white/70">Healing Sessions</span>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      {/* 1. Our Approach Modal */}
      {activeModal === "approach" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl p-8 liquid-glass text-left space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-xs font-mono uppercase tracking-widest text-white/60">Holistic Philosophy</span>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-medium tracking-tight text-white">Our Holistic Approach</h2>
              <p className="text-sm font-light text-white/80 leading-relaxed">
                At Vibrant Wellness, we understand that true healing originates from harmonizing internal vitality with natural biological rhythms. We combine advanced biomimetic assessment with time-honored somatic practices.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-white/90">Comprehensive Cellular & Bio-field Assessment</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-white/90">Customized Botanical & Frequency Therapies</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-white/90">Sustained Natural Homeostasis Protocols</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveModal("journey")}
              className="w-full py-3.5 rounded-full liquid-glass liquid-glass-interactive text-sm font-medium text-white hover:bg-white/10 cursor-pointer"
            >
              Book an Initial Consultation
            </button>
          </div>
        </div>
      )}

      {/* 2. Healing Methods Modal */}
      {activeModal === "methods" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl p-8 liquid-glass text-left space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-xs font-mono uppercase tracking-widest text-white/60">Modalities & Sessions</span>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-medium tracking-tight text-white">Healing Methods</h2>
              <p className="text-sm font-light text-white/80 leading-relaxed">
                Personalized modalities designed to release somatic tension and stimulate innate regenerative recovery.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                <span className="text-xs font-medium text-white block">Acoustic Sound</span>
                <span className="text-[11px] text-white/60 font-light">432Hz harmonic cellular tuning</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                <span className="text-xs font-medium text-white block">Botanical Somatics</span>
                <span className="text-[11px] text-white/60 font-light">Plant medicine & adaptogens</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                <span className="text-xs font-medium text-white block">Somatic Breathwork</span>
                <span className="text-[11px] text-white/60 font-light">Vagus nerve nervous regulation</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                <span className="text-xs font-medium text-white block">Quantum Sensing</span>
                <span className="text-[11px] text-white/60 font-light">Deep neurological resonance</span>
              </div>
            </div>
            <button
              onClick={() => setActiveModal("journey")}
              className="w-full py-3.5 rounded-full liquid-glass liquid-glass-interactive text-sm font-medium text-white hover:bg-white/10 cursor-pointer"
            >
              Experience a Healing Session
            </button>
          </div>
        </div>
      )}

      {/* 3. Begin Your Journey Modal */}
      {activeModal === "journey" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl p-8 liquid-glass text-left space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-xs font-mono uppercase tracking-widest text-white/60">Begin Your Journey</span>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-medium tracking-tight text-white">Natural Healing Consultation</h2>
              <p className="text-sm font-light text-white/80 leading-relaxed">
                Connect with our dedicated practitioners within 48 hours to begin your personalized health recovery plan.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-300 shrink-0" />
              <div className="text-xs">
                <span className="font-medium text-white block">Guaranteed 48-Hour Response</span>
                <span className="text-white/60 font-light">One-on-one initial holistic assessment</span>
              </div>
            </div>
            <div className="space-y-3">
              <Link
                href="/analyze"
                className="w-full py-3.5 rounded-full liquid-glass liquid-glass-interactive text-sm font-medium text-white hover:bg-white/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Wellness & Diagnostic Suite</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 text-xs text-white/60 hover:text-white cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Account Modal */}
      {activeModal === "account" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl p-8 liquid-glass text-left space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-xs font-mono uppercase tracking-widest text-white/60">Member Account</span>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full liquid-glass flex items-center justify-center text-white">
                <CircleUserRound className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Vibrant Member</h3>
                <span className="text-xs text-white/60">Active Holistic Journey</span>
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex justify-between items-center text-xs">
                <span className="text-white/70">Next Consultation:</span>
                <span className="text-white font-medium">Within 48 Hours</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex justify-between items-center text-xs">
                <span className="text-white/70">Completed Sessions:</span>
                <span className="text-white font-medium">4 Healing Sessions</span>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                href="/analyze"
                className="w-full py-3 rounded-full liquid-glass liquid-glass-interactive text-xs font-medium text-white hover:bg-white/10 flex items-center justify-center gap-2"
              >
                <span>Open Diagnostic Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
