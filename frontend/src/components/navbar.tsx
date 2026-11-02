"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, Sparkles } from "lucide-react";
import AISearchModal from "@/components/ai-search-modal";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAiSearchOpen, setIsAiSearchOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Overview", href: "/" },
    { label: "Analyze", href: "/analyze" },
    { label: "History", href: "/history" },
    { label: "Patients", href: "/patients" },
    { label: "Assistant", href: "/assistant" },
    { label: "Analytics", href: "/analytics" },
    { label: "Performance", href: "/performance" },
    { label: "Research", href: "/research" },
    { label: "Settings", href: "/settings" },
  ];

  return (
    <>
      <nav className="w-full bg-[#000000] relative z-40 border-b border-[#141414]">
        <div className="max-w-[1280px] mx-auto px-6 h-[76px] flex items-center justify-between">
          {/* Logo Lockup: QUANTUM TUMOR */}
          <Link href="/" className="flex items-center gap-3 group">
            <svg
              className="w-6 h-6 shrink-0 transition-transform duration-300 group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="dalaLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8052ff" />
                  <stop offset="100%" stopColor="#15846e" />
                </linearGradient>
              </defs>
              <path
                d="M12 2L22 20H2L12 2Z"
                stroke="url(#dalaLogoGrad)"
                strokeWidth="2.5"
                strokeLinejoin="round"
                fill="url(#dalaLogoGrad)"
                fillOpacity="0.15"
              />
            </svg>
            <div className="flex items-center gap-2">
              <span className="font-normal text-[14px] uppercase tracking-[0.025em] text-[#ffffff] whitespace-nowrap">
                QUANTUM TUMOR
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links + AI Search Button beside Settings */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-[14px] font-semibold uppercase tracking-[0.025em] transition-colors duration-150 ${
                    isActive ? "text-[#ffffff]" : "text-[#9a9a9a] hover:text-[#ffffff]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* 3D Brain Intro Experience Button */}
            <Link
              href="/?intro=true"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold uppercase tracking-[0.025em] text-[#ffb829] bg-[#0d0d0d] border border-[#ffb829]/30 hover:border-[#ffb829] hover:shadow-[0_0_15px_rgba(255,184,41,0.25)] transition-all duration-200 cursor-pointer group"
              title="Replay 3D Brain Intro Animation"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ffb829] group-hover:rotate-12 transition-transform" />
              <span>3D Intro</span>
            </Link>

            {/* AI Search Button — Immediately beside Settings */}
            <button
              onClick={() => setIsAiSearchOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold uppercase tracking-[0.025em] text-[#ffffff] bg-[#0d0d0d] border border-[#8052ff]/40 hover:border-[#22d3ee] hover:shadow-[0_0_15px_rgba(34,211,238,0.25)] transition-all duration-200 cursor-pointer group"
              title="Open AI Medical Search Assistant"
            >
              <Search className="w-3.5 h-3.5 text-[#22d3ee] group-hover:scale-110 transition-transform" />
              <span className="bg-gradient-to-r from-[#ffffff] via-[#dcd2ff] to-[#22d3ee] bg-clip-text text-transparent">
                AI Search
              </span>
            </button>
          </div>

          {/* Dala Primary Action Button: Filled Violet Pill */}
          <div className="hidden lg:flex items-center">
            <Link
              href="/analyze"
              className="bg-[#8052ff] hover:opacity-90 active:scale-95 text-[#ffffff] text-[14px] font-semibold uppercase tracking-[0.025em] rounded-[22.5px] px-[18px] py-[12px] transition-all duration-200"
            >
              Analyze Scan
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#9a9a9a] hover:text-[#ffffff] focus:outline-none cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu on Black Void */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#000000] border-t border-[#222222] px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-[13px] font-semibold uppercase tracking-[0.025em] py-2 transition-colors ${
                      isActive ? "text-[#ffffff]" : "text-[#9a9a9a] hover:text-[#ffffff]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile AI Search Button */}
            <div className="pt-2 border-t border-[#1a1a1a] flex gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAiSearchOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[22.5px] bg-[#0d0d0d] border border-[#8052ff]/40 text-[#ffffff] text-[13px] font-semibold uppercase tracking-[0.025em]"
              >
                <Search className="w-4 h-4 text-[#22d3ee]" />
                <span>AI Search</span>
              </button>
              <Link
                href="/analyze"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center bg-[#8052ff] text-[#ffffff] text-[13px] font-semibold uppercase tracking-[0.025em] rounded-[22.5px] py-2.5"
              >
                Analyze Scan
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Interactive AI Search Modal */}
      <AISearchModal
        isOpen={isAiSearchOpen}
        onClose={() => setIsAiSearchOpen(false)}
      />
    </>
  );
}
