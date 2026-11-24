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
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Calendar,
  Sparkles
} from "lucide-react";

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubModal, setActiveSubModal] = useState<"profile" | "consult" | "help" | null>(null);
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
        setActiveSubModal(null);
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
            <button
              onClick={() => {
                setActiveSubModal("profile");
                setIsOpen(false);
              }}
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
            </button>

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
            <button
              onClick={() => {
                setActiveSubModal("consult");
                setIsOpen(false);
              }}
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
            </button>

            {/* 5. Help */}
            <button
              onClick={() => {
                setActiveSubModal("help");
                setIsOpen(false);
              }}
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
            </button>

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

      {/* ========================================================== */}
      {/* SUB-MODALS                                                 */}
      {/* ========================================================== */}

      {/* 1. Profile Modal */}
      {activeSubModal === "profile" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl p-7 liquid-glass text-left space-y-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-300">Operator Profile</span>
              <button
                onClick={() => setActiveSubModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full liquid-glass flex items-center justify-center text-white border border-white/20 shadow-inner">
                <CircleUserRound className="w-9 h-9 stroke-[1.5] text-cyan-300" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Clinical Operator</h3>
                <span className="text-xs text-white/60">Neuro-Radiology Decision Support</span>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Licensed Medical User ID: #RAD-8824</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl liquid-glass flex justify-between items-center">
                <span className="text-white/60">Assigned Department:</span>
                <span className="text-white font-medium">Neuro-Oncology Imaging</span>
              </div>
              <div className="p-3 rounded-2xl liquid-glass flex justify-between items-center">
                <span className="text-white/60">Model Inference Core:</span>
                <span className="text-cyan-300 font-mono">EfficientNetB3 (96.24%)</span>
              </div>
              <div className="p-3 rounded-2xl liquid-glass flex justify-between items-center">
                <span className="text-white/60">Explainability Engine:</span>
                <span className="text-amber-300 font-mono">TensorFlow GradientTape</span>
              </div>
            </div>

            <button
              onClick={() => setActiveSubModal(null)}
              className="w-full py-3 rounded-full liquid-glass liquid-glass-interactive text-xs font-medium text-white hover:bg-white/15 cursor-pointer"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* 2. Consult Modal */}
      {activeSubModal === "consult" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl p-7 liquid-glass text-left space-y-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-mono uppercase tracking-widest text-violet-300">Clinical Consultation</span>
              <button
                onClick={() => setActiveSubModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-medium tracking-tight text-white">Tele-Radiology Second Opinion</h3>
              <p className="text-xs sm:text-sm font-light text-white/70 leading-relaxed">
                Connect your AI-analyzed MRI scan with a board-certified neuroradiologist for formal clinical correlation and histological assessment.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-2xl liquid-glass flex items-center gap-3">
                <Calendar className="w-4 h-4 text-cyan-300 shrink-0" />
                <div>
                  <span className="text-white font-medium block">Standard Tele-Radiology Review</span>
                  <span className="text-white/50 text-[11px]">Digital telemetry package dispatched within 24-48h</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl liquid-glass flex items-center gap-3">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-white font-medium block">Urgent Case Escalation</span>
                  <span className="text-white/50 text-[11px]">Priority on-call neuro-radiology board review</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl liquid-glass border border-white/10 text-xs text-white/70 space-y-1">
              <span className="text-white font-medium block">Diagnostic Protocol Notice:</span>
              <span className="text-[11px] leading-relaxed block">
                Predictions generated by this system are designed to assist diagnostic workflow and must be corroborated by biopsy or licensed radiology staff.
              </span>
            </div>

            <button
              onClick={() => setActiveSubModal(null)}
              className="w-full py-3.5 rounded-full liquid-glass liquid-glass-interactive text-xs font-medium text-white hover:bg-white/15 cursor-pointer"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

      {/* 3. Help Modal */}
      {activeSubModal === "help" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl p-7 liquid-glass text-left space-y-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-mono uppercase tracking-widest text-sky-300">System Documentation</span>
              <button
                onClick={() => setActiveSubModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-medium tracking-tight text-white">Help & User Guide</h3>
              <p className="text-xs sm:text-sm font-light text-white/70 leading-relaxed">
                Quick guide on navigating the Quantum Tumor Sensing Machine and interpreting neural telemetry.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-2xl liquid-glass space-y-1">
                <span className="text-white font-medium block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>How to Analyze an MRI Scan</span>
                </span>
                <p className="text-white/60 text-[11px] leading-relaxed">
                  Select a preloaded test sample from the left panel, or drag and drop a DICOM/JPG/PNG cranial slice into the ingestion dropzone, then click "Analyze MRI Scan".
                </p>
              </div>

              <div className="p-3.5 rounded-2xl liquid-glass space-y-1">
                <span className="text-white font-medium block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Interpreting Grad-CAM Heatmaps</span>
                </span>
                <p className="text-white/60 text-[11px] leading-relaxed">
                  Red and yellow hotspots indicate the spatial regions where the convolutional neural network detected high tumor gradient activations.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl liquid-glass space-y-1">
                <span className="text-white font-medium block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Downloading Clinical PDF Reports</span>
                </span>
                <p className="text-white/60 text-[11px] leading-relaxed">
                  Once inference completes, click "Download Clinical PDF Report" to export calibrated metrics, metadata, and the heatmap overlay.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveSubModal(null)}
              className="w-full py-3.5 rounded-full liquid-glass liquid-glass-interactive text-xs font-medium text-white hover:bg-white/15 cursor-pointer"
            >
              Close Help
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
