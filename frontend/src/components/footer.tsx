import React from "react";
import Link from "next/link";
import { Atom, ShieldAlert, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#080B14] border-t border-white/[0.08] text-[#94A3B8] text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-1 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#22D3EE] flex items-center justify-center p-2 shadow-[0_0_15px_rgba(139,92,246,0.35)]">
                <Atom className="w-full h-full text-white" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">QUANTUM TUMOR</span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Intelligent Brain MRI Analysis & Tumor Classification Platform. Powered by validated 96.24% EfficientNetB3 neural architecture, true Grad-CAM explainability, and Quantum Machine Learning (QML) research.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-[#22C55E]">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block animate-pulse" />
              <span className="font-semibold text-[11px]">Neural Sensing Core Active (96.24%)</span>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-3">Platform Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Overview Dashboard</Link></li>
              <li><Link href="/analyze" className="hover:text-white transition-colors">New MRI Analysis</Link></li>
              <li><Link href="/history" className="hover:text-white transition-colors">Prediction History</Link></li>
              <li><Link href="/patients" className="hover:text-white transition-colors">Patient Management</Link></li>
              <li><Link href="/assistant" className="hover:text-white transition-colors">AI Medical Assistant</Link></li>
            </ul>
          </div>

          {/* Col 3: Research & Architecture */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-3">Research & Modules</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/analytics" className="hover:text-white transition-colors">Analytics & Reports</Link></li>
              <li><Link href="/performance" className="hover:text-white transition-colors">Model Performance (96.24%)</Link></li>
              <li><Link href="/performance" className="hover:text-white transition-colors">Quantum QML Architecture</Link></li>
              <li><Link href="/research" className="hover:text-white transition-colors">Brain Tumor Classification</Link></li>
              <li><Link href="/settings" className="hover:text-white transition-colors">System Settings</Link></li>
            </ul>
          </div>

          {/* Col 4: Evaluated Classes */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-3">Evaluated Subtypes</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                <span>Glioma Tumor</span>
              </li>
              <li className="flex items-center gap-1.5 text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE]" />
                <span>Meningioma Tumor</span>
              </li>
              <li className="flex items-center gap-1.5 text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                <span>Pituitary Tumor</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Medical Regulatory Notice */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#F59E0B] shrink-0" />
            <p>
              <b>Regulatory & Investigational Notice:</b> This platform provides AI-assisted decision-support telemetry for research and educational purposes. Not a replacement for formal radiology diagnosis or histological biopsy.
            </p>
          </div>
          <div className="text-[11px] text-[#64748B] shrink-0">
            © 2026 QUANTUM TUMOR SENSING MACHINE. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
