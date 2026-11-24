"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  ShieldCheck,
  Brain
} from "lucide-react";
import MRIAnalysisSuite from "@/components/mri-analysis-suite";
import ProfileDropdown from "@/components/profile-dropdown";

export default function AnalyzePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <Link
            href="/"
            className="px-4 py-1.5 rounded-full text-xs font-normal tracking-wide text-white/70 hover:text-white transition-colors"
          >
            Home
          </Link>
          <div className="px-4 py-1.5 rounded-full text-xs font-medium tracking-wide text-white bg-white/15 flex items-center gap-1.5 shadow-sm">
            <Brain className="w-3.5 h-3.5 text-cyan-300" />
            <span>Diagnostic Suite</span>
          </div>
        </nav>

        {/* Right (Desktop): Profile dropdown menu */}
        <div className="hidden md:flex items-center">
          <ProfileDropdown />
        </div>

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
        <div className="text-xl font-medium text-cyan-300 tracking-tight flex items-center gap-2">
          <Brain className="w-5 h-5" />
          <span>Diagnostic Suite</span>
        </div>
        <Link
          href="/history"
          className="text-xl font-light text-white/80 hover:text-white tracking-tight"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          History
        </Link>
        <Link
          href="/reports"
          className="text-xl font-light text-white/80 hover:text-white tracking-tight"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Reports
        </Link>
        <Link
          href="/settings"
          className="text-xl font-light text-white/80 hover:text-white tracking-tight"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Settings
        </Link>
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
          <ShieldCheck className="w-4 h-4 text-cyan-300/80" />
          <span>Neural Diagnostics • Decision-Support Telemetry</span>
        </div>
        <div>
          © 2026 Neural Diagnostic Suite. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
