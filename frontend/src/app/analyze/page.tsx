"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CircleUserRound,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  Brain,
  Clock,
  HeartPulse
} from "lucide-react";
import MRIAnalysisSuite from "@/components/mri-analysis-suite";

export default function AnalyzePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"approach" | "methods" | "account" | null>(null);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden flex flex-col justify-between text-white font-sans select-none bg-black">
      {/* 1. Full-viewport Fixed Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260715_082433_69699cf8-444b-4484-93cc-053e57896dfd.mp4"
          type="video/mp4"
        />
      </video>

      {/* Subtle Ambient Video Scrim */}
      <div className="fixed inset-0 bg-black/40 z-[1] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 z-[1] pointer-events-none" />

      {/* 2. Top Navigation Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 pt-6 sm:pt-8 flex items-center justify-between">
        {/* Left: Minimalist white custom SVG emblem */}
        <Link href="/" className="flex items-center gap-3 group">
          <svg
            className="w-7 h-7 sm:w-8 sm:h-8 text-white shrink-0 transition-transform duration-300 group-hover:scale-105"
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
        </Link>

        {/* Center (Desktop): Floating .liquid-glass pill with links */}
        <nav className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full liquid-glass liquid-glass-interactive">
          <Link
            href="/"
            className="px-4 py-1.5 rounded-full text-xs font-normal tracking-wide text-white/70 hover:text-white transition-colors"
          >
            Home
          </Link>
          <button
            onClick={() => setActiveModal("approach")}
            className="px-4 py-1.5 rounded-full text-xs font-normal tracking-wide text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            Our Approach
          </button>
          <button
            onClick={() => setActiveModal("methods")}
            className="px-4 py-1.5 rounded-full text-xs font-normal tracking-wide text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            Healing Methods
          </button>
          <div className="px-4 py-1.5 rounded-full text-xs font-medium tracking-wide text-white bg-white/15 flex items-center gap-1.5 shadow-sm">
            <Brain className="w-3.5 h-3.5 text-cyan-300" />
            <span>Diagnostic Suite</span>
          </div>
        </nav>

        {/* Right (Desktop): Round .liquid-glass user account button */}
        <button
          onClick={() => setActiveModal("account")}
          aria-label="User Account"
          className="hidden md:flex w-10 h-10 rounded-full items-center justify-center liquid-glass liquid-glass-interactive text-white/90 hover:text-white transition-transform active:scale-95 cursor-pointer"
        >
          <CircleUserRound className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Mobile Hamburger button */}
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
        className={`fixed inset-0 z-40 bg-black/85 backdrop-blur-xl md:hidden flex flex-col justify-center items-center gap-6 px-8 transition-all duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <Link
          href="/"
          className="text-xl font-light text-white/80 hover:text-white tracking-tight"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Home
        </Link>
        <button
          onClick={() => {
            setActiveModal("approach");
            setIsMobileMenuOpen(false);
          }}
          className="text-xl font-light text-white/80 hover:text-white tracking-tight cursor-pointer"
        >
          Our Approach
        </button>
        <button
          onClick={() => {
            setActiveModal("methods");
            setIsMobileMenuOpen(false);
          }}
          className="text-xl font-light text-white/80 hover:text-white tracking-tight cursor-pointer"
        >
          Healing Methods
        </button>
        <div className="text-xl font-medium text-cyan-300 tracking-tight flex items-center gap-2">
          <Brain className="w-5 h-5" />
          <span>Diagnostic Suite</span>
        </div>
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

      {/* 3. Main Clinical Analysis Workspace */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-10 sm:py-16 flex-1">
        <div className="w-full rounded-3xl p-6 sm:p-10 liquid-glass shadow-2xl">
          <MRIAnalysisSuite />
        </div>
      </main>

      {/* 4. Footer */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 pb-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 border-t border-white/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-300/80" />
          <span>Vibrant Wellness Neural Diagnostics • Decision-Support Telemetry</span>
        </div>
        <div>
          © 2026 Vibrant Wellness. All rights reserved.
        </div>
      </footer>

      {/* ========================================================== */}
      {/* MODALS                                                     */}
      {/* ========================================================== */}
      {/* 1. Our Approach Modal */}
      {activeModal === "approach" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl p-8 liquid-glass text-left space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-xs font-mono uppercase tracking-widest text-white/60">Philosophy & Care</span>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-medium tracking-tight text-white">Our Approach</h2>
              <p className="text-sm font-light text-white/80 leading-relaxed">
                At Vibrant Wellness, we harmonize biological precision with holistic restorative therapies. Our personalized clinical pathways restore vitality through whole-body alignment.
              </p>
            </div>
            <div className="space-y-2.5 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
                <HeartPulse className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs text-white/90">Deep Cellular Rest & Nervous System Reset</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
                <Brain className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className="text-xs text-white/90">AI-Assisted Neural Wellness Diagnostics</span>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3.5 rounded-full liquid-glass liquid-glass-interactive text-sm font-medium text-white hover:bg-white/10 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue Diagnostic Analysis</span>
              <ArrowRight className="w-4 h-4" />
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
              onClick={() => setActiveModal(null)}
              className="w-full py-3.5 rounded-full liquid-glass liquid-glass-interactive text-sm font-medium text-white hover:bg-white/10 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Back to Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Account Modal */}
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
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-3 rounded-full liquid-glass liquid-glass-interactive text-xs font-medium text-white hover:bg-white/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Close Window</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
