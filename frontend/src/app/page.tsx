"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  CircleUserRound,
  Menu,
  X,
  ArrowDown,
  ShieldCheck,
  Brain,
  History,
  FileText,
  Settings
} from "lucide-react";
import MRIAnalysisSuite from "@/components/mri-analysis-suite";
import ProfileDropdown from "@/components/profile-dropdown";

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "diagnostic">("home");

  const suiteRef = useRef<HTMLDivElement | null>(null);

  const scrollToSuite = () => {
    setIsMobileMenuOpen(false);
    setActiveTab("diagnostic");
    suiteRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden flex flex-col text-white font-sans select-none bg-black">
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

      {/* Subtle Ambient Video Scrim for High-Contrast Readability */}
      <div className="fixed inset-0 bg-black/35 z-[1] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 z-[1] pointer-events-none" />

      {/* ========================================================== */}
      {/* 2. TOP HERO VIEWPORT (100vh Full Screen)                  */}
      {/* ========================================================== */}
      <div className="relative z-10 w-full min-h-[100vh] flex flex-col justify-between">
        {/* Top Navigation Bar */}
        <header className="relative z-20 w-full max-w-7xl mx-auto px-6 pt-6 sm:pt-8 flex items-center justify-between">
          {/* Left: Minimalist white custom SVG emblem + Name: Quantum Tumor Sensing Machine */}
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
              Quantum Tumor Sensing Machine
            </span>
          </Link>

          {/* Center (Desktop): Floating .liquid-glass pill with links */}
          <nav className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full liquid-glass liquid-glass-interactive">
            <button
              onClick={() => {
                setActiveTab("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-normal tracking-wide transition-colors cursor-pointer ${
                activeTab === "home" ? "text-white bg-white/10" : "text-white/70 hover:text-white"
              }`}
            >
              Home
            </button>
            <button
              onClick={scrollToSuite}
              className={`px-4 py-1.5 rounded-full text-xs font-normal tracking-wide transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "diagnostic" ? "text-white bg-white/15 shadow-sm" : "text-white/70 hover:text-white"
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-cyan-300" />
              <span>MRI Diagnostic</span>
            </button>
          </nav>

          {/* Right (Desktop): Profile dropdown menu */}
          <div className="hidden md:flex items-center">
            <ProfileDropdown />
          </div>

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
          className={`fixed inset-0 z-40 bg-black/85 backdrop-blur-xl md:hidden flex flex-col justify-center items-center gap-6 px-8 transition-all duration-300 ${
            isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            onClick={() => {
              setActiveTab("home");
              setIsMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-xl font-light text-white tracking-tight cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={scrollToSuite}
            className="text-xl font-light text-cyan-300 hover:text-cyan-200 tracking-tight cursor-pointer flex items-center gap-2"
          >
            <Brain className="w-5 h-5" />
            <span>MRI Diagnostic</span>
          </button>
          <Link
            href="/history"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-xl font-light text-white/80 hover:text-white tracking-tight"
          >
            History
          </Link>
          <Link
            href="/reports"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-xl font-light text-white/80 hover:text-white tracking-tight"
          >
            Reports
          </Link>
          <Link
            href="/settings"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-xl font-light text-white/80 hover:text-white tracking-tight"
          >
            Settings
          </Link>
        </div>

        {/* Hero Content */}
        <main className="relative z-10 w-full max-w-5xl mx-auto px-6 flex-1 flex flex-col items-center justify-center text-center my-auto py-8">
          {/* Headline: Quantum Tumor Sensing Machine in ultra-large, tight-tracking typography (-0.05em) */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[96px] xl:text-[108px] font-medium leading-[0.93] tracking-[-0.05em] text-white max-w-5xl mb-6">
            Quantum Tumor<br />Sensing Machine
          </h1>

          {/* Subtitle: "Holistic wellness. Transformative results." */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light text-white/80 max-w-xl mx-auto mb-8 sm:mb-10 tracking-tight">
            Holistic wellness. Transformative results.
          </p>

          {/* CTA: .liquid-glass rounded button reading "Begin Your Journey" */}
          <div className="flex items-center justify-center">
            <button
              onClick={scrollToSuite}
              className="px-8 py-3.5 sm:px-10 sm:py-4 rounded-full liquid-glass liquid-glass-interactive text-sm sm:text-base font-normal tracking-wide text-white hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg shadow-black/20 flex items-center gap-2"
            >
              <span>Begin Your Journey</span>
              <ArrowDown className="w-4 h-4 text-cyan-300" />
            </button>
          </div>
        </main>

        {/* Hero Bottom Footer Bar */}
        <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 pb-6 sm:pb-8 flex items-center justify-center text-xs tracking-tight text-white/90">
          {/* Downward prompt to scroll to attached diagnostic suite */}
          <button
            onClick={scrollToSuite}
            className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors cursor-pointer py-2 px-5 rounded-full liquid-glass liquid-glass-interactive"
          >
            <span>Scroll to MRI Diagnostic Suite</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce text-cyan-300" />
          </button>
        </footer>
      </div>

      {/* ========================================================== */}
      {/* 3. ATTACHED MRI DIAGNOSTIC & ANALYSIS SUITE ON FRONT PAGE  */}
      {/* ========================================================== */}
      <section
        ref={suiteRef}
        id="diagnostic-suite"
        className="relative z-20 w-full max-w-7xl mx-auto px-6 py-20 sm:py-28"
      >
        <div className="w-full rounded-3xl p-6 sm:p-10 liquid-glass shadow-2xl space-y-8">
          <MRIAnalysisSuite />
        </div>
      </section>

      {/* Bottom Credits */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 pb-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 border-t border-white/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-300/80" />
          <span>Neural Diagnostics • Decision-Support Telemetry</span>
        </div>
        <div>
          © 2026 Neural Diagnostic Suite. All rights reserved.
        </div>
      </div>
    </div>
  );
}
