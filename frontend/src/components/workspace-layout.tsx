"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ShieldCheck,
  Brain,
  History,
  FileText,
  Settings,
  ArrowRight
} from "lucide-react";
import ProfileDropdown from "@/components/profile-dropdown";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  categoryLabel?: string;
  actionText?: string;
  actionHref?: string;
  fluidWidth?: boolean;
  hideDefaultFooter?: boolean;
}

export default function WorkspaceLayout({
  children,
  title,
  subtitle,
  categoryLabel,
  actionText,
  actionHref,
  fluidWidth = false,
  hideDefaultFooter = false,
}: WorkspaceLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "MRI Diagnostic", href: "/analyze" },
    { label: "History", href: "/history" },
    { label: "Reports", href: "/reports" },
    { label: "Settings", href: "/settings" },
  ];

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
        {/* Left: Minimalist white custom SVG emblem + Name */}
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
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full text-xs font-normal tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? "bg-white/15 text-white font-medium shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Profile dropdown + Mobile Hamburger */}
        <div className="flex items-center gap-2.5">
          <ProfileDropdown />

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
        </div>
      </header>

      {/* Mobile Backdrop-blurred Overlay Menu */}
      <div
        className={`fixed inset-0 z-40 bg-black/85 backdrop-blur-xl md:hidden flex flex-col justify-center items-center gap-6 px-8 transition-all duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-xl font-light text-white/80 hover:text-white tracking-tight"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* 3. Main Workspace Content */}
      <main className="relative z-10 w-full flex-1">
        <div className={`mx-auto px-6 py-10 sm:py-16 ${fluidWidth ? "max-w-[1500px]" : "max-w-7xl"}`}>
          {/* Section Headline Block */}
          {title && (
            <div className="mb-10 sm:mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
              <div className="max-w-2xl space-y-2.5">
                {categoryLabel && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass text-xs font-normal tracking-wide text-cyan-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span>{categoryLabel}</span>
                  </div>
                )}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white leading-[1.1]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm sm:text-base font-light text-white/70 leading-relaxed pt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>

              {actionText && actionHref && (
                <div className="shrink-0">
                  <Link
                    href={actionHref}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full liquid-glass liquid-glass-interactive text-xs sm:text-sm font-medium text-white hover:bg-white/15 transition-all shadow-lg cursor-pointer"
                  >
                    <span>{actionText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Page Content Floating on Frosted Glass */}
          {children}
        </div>
      </main>

      {/* 4. Footer */}
      {!hideDefaultFooter && (
        <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 pb-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 border-t border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-300/80" />
            <span>Neural Diagnostics • Decision-Support Telemetry</span>
          </div>
          <div>
            © 2026 Neural Diagnostic Suite. All rights reserved.
          </div>
        </footer>
      )}
    </div>
  );
}
