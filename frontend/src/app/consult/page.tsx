"use client";

import React, { useState } from "react";
import WorkspaceLayout from "@/components/workspace-layout";
import {
  Stethoscope,
  Calendar,
  PhoneCall,
  ShieldAlert,
  CheckCircle2,
  Send,
  User,
  Clock,
  FileCheck
} from "lucide-react";

export default function ConsultPage() {
  const [patientId, setPatientId] = useState("CASE-2026-991");
  const [urgency, setUrgency] = useState<"standard" | "urgent">("standard");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setClinicalNotes("");
    }, 4000);
  };

  return (
    <WorkspaceLayout
      categoryLabel="Clinical Consultation"
      title="Tele-Radiology Second Opinion"
      subtitle="Corroborate AI inference predictions with licensed board-certified neuroradiologists through our tele-consultation network."
      actionText="Analyze Scan"
      actionHref="/analyze"
    >
      <div className="space-y-8 max-w-4xl">
        {/* Success Alert */}
        {isSubmitted && (
          <div className="p-4 sm:p-5 rounded-3xl liquid-glass border border-emerald-400/40 text-emerald-400 flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">
              Consultation request dispatched successfully to the on-call neuroradiology board. Reference #TLR-7821.
            </span>
          </div>
        )}

        {/* Options Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Standard Review */}
          <div
            onClick={() => setUrgency("standard")}
            className={`p-6 sm:p-7 rounded-3xl liquid-glass liquid-glass-interactive cursor-pointer space-y-4 shadow-xl border transition-all ${
              urgency === "standard"
                ? "border-cyan-400/40 bg-white/[0.04] ring-1 ring-cyan-400/30"
                : "border-transparent"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center text-cyan-300">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-300">
                Turnaround: 24h
              </span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Standard Tele-Radiology Review</h3>
              <p className="text-xs sm:text-sm font-light text-white/70 mt-1 leading-relaxed">
                Full comprehensive histological assessment, cross-sectional volumetric report, and signed electronic report.
              </p>
            </div>
          </div>

          {/* Card 2: Urgent Escalation */}
          <div
            onClick={() => setUrgency("urgent")}
            className={`p-6 sm:p-7 rounded-3xl liquid-glass liquid-glass-interactive cursor-pointer space-y-4 shadow-xl border transition-all ${
              urgency === "urgent"
                ? "border-amber-400/40 bg-white/[0.04] ring-1 ring-amber-400/30"
                : "border-transparent"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center text-amber-300">
                <PhoneCall className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300">
                Turnaround: &lt; 2h
              </span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Urgent Clinical Escalation</h3>
              <p className="text-xs sm:text-sm font-light text-white/70 mt-1 leading-relaxed">
                Direct on-call board consultation for critical midline shifts, high mass-effect edema, or pre-surgical evaluation.
              </p>
            </div>
          </div>
        </div>

        {/* Consultation Request Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl liquid-glass space-y-6 shadow-2xl">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 block">
              Case Submission
            </span>
            <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-white">
              Dispatch Consultation Request
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-light text-white/70 block mb-1.5">
                Case / Subject Identifier
              </label>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl liquid-glass text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-white/40 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-light text-white/70 block mb-1.5">
                Priority Tier
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-4 py-3 rounded-2xl liquid-glass text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-white/40 cursor-pointer bg-transparent"
              >
                <option value="standard" className="bg-black text-white">Standard (24h Window)</option>
                <option value="urgent" className="bg-black text-white">Urgent (&lt; 2h Priority Escalation)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-light text-white/70 block mb-1.5">
              Clinical Context / Question for Neuroradiologist
            </label>
            <textarea
              rows={4}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Provide relevant anamnesis, contrast administration status (Gd+), or specific questions regarding the Grad-CAM activation hotspot..."
              className="w-full px-4 py-3 rounded-2xl liquid-glass text-white placeholder-white/40 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-white/40 resize-none"
            />
          </div>

          <button
            type="submit"
            className="px-8 py-3.5 rounded-full liquid-glass liquid-glass-interactive text-xs sm:text-sm font-medium text-white hover:bg-white/15 cursor-pointer shadow-lg inline-flex items-center gap-2"
          >
            <Send className="w-4 h-4 text-cyan-300" />
            <span>Transmit Consultation Package</span>
          </button>
        </form>

        {/* Diagnostic Disclaimers */}
        <div className="p-5 rounded-3xl liquid-glass flex items-center gap-3.5 text-xs text-white/70 shadow-lg">
          <ShieldAlert className="w-5 h-5 text-amber-300 shrink-0" />
          <p className="text-[11px] leading-relaxed">
            Neural tele-consultation requests are routed through HIPAA-compliant encrypted channels. Final clinical diagnosis requires verification by licensed neurosurgeons or attending radiology physicians.
          </p>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
