"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  CircleUserRound,
  User,
  History,
  FileText,
  Stethoscope,
  HelpCircle,
  Settings,
  ExternalLink
} from "lucide-react";

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Top Right Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User Account Menu"
        className={`w-10 h-10 rounded-full flex items-center justify-center liquid-glass liquid-glass-interactive text-white/90 hover:text-white transition-all active:scale-95 cursor-pointer shadow-lg ${
          isOpen ? "bg-white/15 border-white/40 ring-2 ring-white/20" : ""
        }`}
      >
        <CircleUserRound className="w-5 h-5 stroke-[1.5]" />
      </button>

      {/* Floating .liquid-glass Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-12 mt-2 w-72 sm:w-80 rounded-3xl liquid-glass p-5 z-50 shadow-2xl space-y-4 animate-fadeIn border border-white/20 backdrop-blur-xl">
          {/* Header Profile Snippet */}
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-11 h-11 rounded-full liquid-glass flex items-center justify-center text-white border border-white/20 shrink-0">
              <CircleUserRound className="w-6 h-6 stroke-[1.5] text-cyan-300" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-white truncate">
                Clinical Operator
              </span>
              <span className="text-[11px] text-white/60 truncate font-light">
                neural.operator@diagnostics.ai
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                  Core Active (96.24%)
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links requested by user: profile, history, report, consult, help, settings */}
          <div className="space-y-1 text-xs">
            {/* 1. Profile */}
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl liquid-glass-interactive hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full liquid-glass flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-medium text-white block">Profile</span>
                  <span className="text-[10px] text-white/50 font-light">Practitioner details & credentials</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
            </Link>

            {/* 2. History */}
            <Link
              href="/history"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl liquid-glass-interactive hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full liquid-glass flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                  <History className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-medium text-white block">History</span>
                  <span className="text-[10px] text-white/50 font-light">Telemetry scans & case archive</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
            </Link>

            {/* 3. Report */}
            <Link
              href="/reports"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl liquid-glass-interactive hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full liquid-glass flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-medium text-white block">Report</span>
                  <span className="text-[10px] text-white/50 font-light">Clinical PDF documentation</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
            </Link>

            {/* 4. Consult */}
            <Link
              href="/consult"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl liquid-glass-interactive hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full liquid-glass flex items-center justify-center text-violet-300 group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-medium text-white block">Consult</span>
                  <span className="text-[10px] text-white/50 font-light">Tele-radiology second opinion</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
            </Link>

            {/* 5. Help */}
            <Link
              href="/help"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl liquid-glass-interactive hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full liquid-glass flex items-center justify-center text-sky-300 group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-medium text-white block">Help</span>
                  <span className="text-[10px] text-white/50 font-light">AI guide & Grad-CAM documentation</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
            </Link>

            {/* 6. Settings */}
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl liquid-glass-interactive hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full liquid-glass flex items-center justify-center text-rose-300 group-hover:scale-110 transition-transform">
                  <Settings className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-medium text-white block">Settings</span>
                  <span className="text-[10px] text-white/50 font-light">Model thresholds & API keys</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
