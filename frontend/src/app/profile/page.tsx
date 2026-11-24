"use client";

import React from "react";
import WorkspaceLayout from "@/components/workspace-layout";
import {
  CircleUserRound,
  ShieldCheck,
  CheckCircle2,
  Award,
  Activity,
  Cpu,
  Lock,
  Mail,
  Building,
  Calendar
} from "lucide-react";

export default function ProfilePage() {
  return (
    <WorkspaceLayout
      categoryLabel="Practitioner Authentication"
      title="Operator Profile"
      subtitle="Authorized clinical practitioner credentials, radiological telemetry permissions, and neural core allocation."
      actionText="Analyze Scan"
      actionHref="/analyze"
    >
      <div className="space-y-8 max-w-4xl">
        {/* Main Profile Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl liquid-glass shadow-2xl flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full liquid-glass flex items-center justify-center text-white border border-white/20 shadow-inner shrink-0">
            <CircleUserRound className="w-14 h-14 sm:w-16 sm:h-16 stroke-[1.5] text-cyan-300" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
                Clinical Operator
              </h2>
              <span className="px-3 py-1 rounded-full liquid-glass text-xs font-mono text-emerald-400 border border-emerald-400/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Specialist</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm font-light text-white/70">
              Department of Neuro-Oncology & Computational Radiology
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-mono text-white/60 pt-1">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-300" />
                neural.operator@diagnostics.ai
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                ID: #RAD-8824
              </span>
            </div>
          </div>
        </div>

        {/* Credentials & System Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Medical Permissions */}
          <div className="p-6 sm:p-7 rounded-3xl liquid-glass space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <ShieldCheck className="w-5 h-5 text-cyan-300" />
              <h3 className="text-base font-medium text-white">Radiology Privileges</h3>
            </div>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-white/60">Institutional Role:</span>
                <span className="text-white font-medium">Attending Neuroradiologist</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-white/60">Clearance Level:</span>
                <span className="text-emerald-400 font-mono font-medium">Tier-3 Clinical Access</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-white/60">DICOM Export:</span>
                <span className="text-white font-medium">Enabled (Lossless 16-bit)</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-white/60">PDF Sign-Off:</span>
                <span className="text-cyan-300 font-medium">Cryptographic Key Active</span>
              </div>
            </div>
          </div>

          {/* Card 2: Neural Core Allocation */}
          <div className="p-6 sm:p-7 rounded-3xl liquid-glass space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <Cpu className="w-5 h-5 text-amber-300" />
              <h3 className="text-base font-medium text-white">Neural Processing Core</h3>
            </div>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-white/60">Active Model:</span>
                <span className="text-white font-mono">EfficientNetB3 Deep CNN</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-white/60">Accuracy Baseline:</span>
                <span className="text-amber-300 font-mono font-medium">96.24% Verified</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-white/60">Grad-CAM Method:</span>
                <span className="text-white font-mono">GradientTape Activation</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-white/60">Inference Latency:</span>
                <span className="text-emerald-400 font-mono">~32ms GPU / ~65ms CPU</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Activity Card */}
        <div className="p-6 sm:p-7 rounded-3xl liquid-glass space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-medium text-white">Security & Active Session</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-2xl liquid-glass space-y-1">
              <span className="text-[11px] text-white/50 block">Session Status</span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Encrypted Session
              </span>
            </div>
            <div className="p-4 rounded-2xl liquid-glass space-y-1">
              <span className="text-[11px] text-white/50 block">Audit Log Compliance</span>
              <span className="text-xs font-mono text-white">HIPAA & GDPR Compliant</span>
            </div>
            <div className="p-4 rounded-2xl liquid-glass space-y-1">
              <span className="text-[11px] text-white/50 block">Tele-Radiology Node</span>
              <span className="text-xs font-mono text-cyan-300">Cluster US-EAST-01</span>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
