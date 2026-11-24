"use client";

import React from "react";
import WorkspaceLayout from "@/components/workspace-layout";
import {
  HelpCircle,
  Sparkles,
  Layers,
  Brain,
  FileText,
  Activity,
  Cpu,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function HelpPage() {
  return (
    <WorkspaceLayout
      categoryLabel="Platform Documentation"
      title="System Help & User Guide"
      subtitle="Comprehensive guide on utilizing the Quantum Tumor Sensing Machine, interpreting neural telemetry, and reading Grad-CAM spatial activation maps."
      actionText="Analyze Scan"
      actionHref="/analyze"
    >
      <div className="space-y-8 max-w-4xl">
        {/* Quick Start Guide */}
        <div className="p-6 sm:p-8 rounded-3xl liquid-glass space-y-6 shadow-2xl">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <Sparkles className="w-6 h-6 text-cyan-300" />
            <div>
              <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-white">
                How to Analyze an MRI Scan
              </h3>
              <p className="text-xs text-white/60 font-light">
                Follow these 3 simple steps to execute an end-to-end neural diagnostic workflow.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="p-5 rounded-2xl liquid-glass space-y-2">
              <span className="w-7 h-7 rounded-full liquid-glass flex items-center justify-center font-mono font-medium text-cyan-300">
                1
              </span>
              <h4 className="font-medium text-white">Select or Upload Scan</h4>
              <p className="text-white/60 text-xs font-light leading-relaxed">
                Choose one of the verified clinical samples (Glioma, Meningioma, Pituitary) or upload a local cranial MRI scan.
              </p>
            </div>

            <div className="p-5 rounded-2xl liquid-glass space-y-2">
              <span className="w-7 h-7 rounded-full liquid-glass flex items-center justify-center font-mono font-medium text-amber-300">
                2
              </span>
              <h4 className="font-medium text-white">Trigger Neural Engine</h4>
              <p className="text-white/60 text-xs font-light leading-relaxed">
                Click "Analyze MRI Scan". The EfficientNetB3 deep CNN executes in &lt;50ms and computes the full confidence probability matrix.
              </p>
            </div>

            <div className="p-5 rounded-2xl liquid-glass space-y-2">
              <span className="w-7 h-7 rounded-full liquid-glass flex items-center justify-center font-mono font-medium text-emerald-400">
                3
              </span>
              <h4 className="font-medium text-white">Inspect & Download</h4>
              <p className="text-white/60 text-xs font-light leading-relaxed">
                Toggle the Grad-CAM heatmap overlay to view feature activation hotspots and export a formal PDF clinical report.
              </p>
            </div>
          </div>
        </div>

        {/* Grad-CAM & AI Assistant Deep Dives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Grad-CAM */}
          <div className="p-6 sm:p-7 rounded-3xl liquid-glass space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <Layers className="w-5 h-5 text-amber-300" />
              <h3 className="text-base font-medium text-white">Grad-CAM Spatial Explainability</h3>
            </div>
            <p className="text-xs sm:text-sm font-light text-white/70 leading-relaxed">
              Gradient-weighted Class Activation Mapping computes gradients with respect to the final convolutional feature layer of EfficientNetB3.
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl liquid-glass flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
                <span className="text-white/80">Red/Orange: Peak activation tumor tissue</span>
              </div>
              <div className="p-3 rounded-2xl liquid-glass flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-yellow-400 shrink-0" />
                <span className="text-white/80">Yellow: Intermediate boundary zones</span>
              </div>
              <div className="p-3 rounded-2xl liquid-glass flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
                <span className="text-white/80">Blue: Normal parenchyma (zero activation)</span>
              </div>
            </div>
          </div>

          {/* Card 2: AI Clinical Assistant */}
          <div className="p-6 sm:p-7 rounded-3xl liquid-glass space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <Brain className="w-5 h-5 text-cyan-300" />
              <h3 className="text-base font-medium text-white">Groq LLaMA 3.3 Clinical Assistant</h3>
            </div>
            <p className="text-xs sm:text-sm font-light text-white/70 leading-relaxed">
              When an MRI is loaded, telemetry findings (classification class, confidence percentage, gradient layer) are passed as verified context into the assistant.
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl liquid-glass">
                <span className="text-cyan-300 font-mono block">"Explain my prediction"</span>
                <span className="text-white/60 text-[11px]">Generates radiological histological justification</span>
              </div>
              <div className="p-3 rounded-2xl liquid-glass">
                <span className="text-cyan-300 font-mono block">"What is a glioma?"</span>
                <span className="text-white/60 text-[11px]">Provides clinical definitions and grading standards</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Architecture Specs */}
        <div className="p-6 sm:p-7 rounded-3xl liquid-glass space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-medium text-white">Model Specs & Limitations</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
            <div className="p-4 rounded-2xl liquid-glass space-y-1">
              <span className="text-white/50 block">Architecture</span>
              <span className="text-white font-mono font-medium">EfficientNetB3 (385 Layers)</span>
            </div>
            <div className="p-4 rounded-2xl liquid-glass space-y-1">
              <span className="text-white/50 block">Accuracy</span>
              <span className="text-amber-300 font-mono font-medium">96.24% Test Benchmark</span>
            </div>
            <div className="p-4 rounded-2xl liquid-glass space-y-1">
              <span className="text-white/50 block">Input Dimensions</span>
              <span className="text-cyan-300 font-mono font-medium">300 x 300 x 3 Cranial Slices</span>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
