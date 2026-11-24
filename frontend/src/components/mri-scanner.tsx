"use client";

import React, { useState, useEffect } from "react";
import { Activity, ShieldCheck, Sparkles } from "lucide-react";

interface MRIScannerProps {
  imageUrl: string;
  onCancel?: () => void;
}

export default function MRIScanner({ imageUrl, onCancel }: MRIScannerProps) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Compute status message based on elapsed seconds
  const seconds = elapsedMs / 1000;
  let statusMessage = "Initializing Neural Analysis Engine...";
  let progressPercent = Math.min(100, (elapsedMs / 5000) * 100);

  if (seconds < 1.0) {
    statusMessage = "Initializing Neural Analysis Engine...";
  } else if (seconds < 2.0) {
    statusMessage = "Loading Cranial MRI Geometry...";
  } else if (seconds < 3.0) {
    statusMessage = "Extracting Deep Convolutional Features...";
  } else if (seconds < 4.0) {
    statusMessage = "Mapping Spatial Tumor Activation...";
  } else if (seconds < 5.0) {
    statusMessage = "Finalizing Grad-CAM Heatmap & Calibration...";
  } else {
    statusMessage = "Compiling Diagnostic Prediction...";
    progressPercent = 100;
  }

  return (
    <div className="w-full liquid-glass rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl animate-fadeIn">
      {/* Background Radial Luminescence */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-400/10 via-violet-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar of Scanner */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full liquid-glass border border-cyan-400/30 flex items-center justify-center">
            <Activity className="w-4 h-4 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-white tracking-wide flex items-center gap-2">
              <span>Deep Neural MRI Scanner</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </h3>
            <p className="text-[11px] font-light text-white/60">
              EfficientNetB3 (300×300×3 RGB) • TensorFlow GradientTape Grad-CAM
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block">
            Scan Timer
          </span>
          <span className="text-base sm:text-lg font-mono font-medium text-cyan-300">
            {seconds.toFixed(2)}s
          </span>
        </div>
      </div>

      {/* Central Visual Scanner Screen (Liquid Glass, NO black box) */}
      <div className="relative aspect-square max-w-[420px] mx-auto rounded-2xl overflow-hidden liquid-glass flex items-center justify-center p-3 shadow-2xl border border-white/10">
        {/* MRI Image with subtle illumination pulse */}
        <img
          src={imageUrl}
          alt="Brain MRI Scan Under Analysis"
          className="w-full h-full object-contain filter contrast-125 brightness-105 transition-all select-none rounded-xl"
        />

        {/* Animated Sweeping Cyan Laser Scanning Line */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          <div className="w-full h-[2.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee,0_0_35px_#8052ff] animate-mri-scan" />
        </div>

        {/* Medical Scanner Reticle & Radar Rings */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Outer Pulsing Ring */}
          <div className="w-[85%] h-[85%] rounded-full border border-cyan-400/20 animate-ping [animation-duration:3s]" />
          {/* Inner Rotating Dashed Reticle */}
          <div className="w-[65%] h-[65%] rounded-full border border-dashed border-white/30 animate-spin [animation-duration:12s]" />
          {/* Precision Center Crosshairs */}
          <div className="w-14 h-14 rounded-full border border-cyan-400/40 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee]" />
          </div>

          {/* Corner Framing Brackets */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60" />
        </div>

        {/* Live Scan Telemetry Coordinates Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-cyan-300/90 liquid-glass px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
          <span>X: {(Math.sin(seconds * 3) * 45 + 50).toFixed(1)}°</span>
          <span>Y: {(Math.cos(seconds * 2) * 45 + 50).toFixed(1)}°</span>
          <span className="text-amber-300">385 Layers Active</span>
        </div>
      </div>

      {/* Sequential Status Bar & Progress */}
      <div className="space-y-3 relative z-10 max-w-[420px] mx-auto">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-light text-white tracking-wide">
              {statusMessage}
            </span>
          </div>
          <span className="text-xs font-mono font-medium text-cyan-300">
            {Math.round(progressPercent)}%
          </span>
        </div>

        {/* Progress Bar with Liquid Glass */}
        <div className="w-full h-2 rounded-full liquid-glass overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-violet-400 via-cyan-400 to-amber-300 transition-all duration-100 ease-out shadow-[0_0_15px_rgba(34,211,238,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Stage Timeline Steps */}
        <div className="grid grid-cols-5 gap-1 pt-1 text-[10px] uppercase font-mono tracking-wider text-center text-white/40">
          <span className={seconds >= 0 ? "text-cyan-300 font-medium" : ""}>01. Init</span>
          <span className={seconds >= 1 ? "text-cyan-300 font-medium" : ""}>02. Load</span>
          <span className={seconds >= 2 ? "text-cyan-300 font-medium" : ""}>03. Features</span>
          <span className={seconds >= 3 ? "text-cyan-300 font-medium" : ""}>04. Classify</span>
          <span className={seconds >= 4 ? "text-cyan-300 font-medium" : ""}>05. Final</span>
        </div>
      </div>

      {/* Optional Cancel Action */}
      {onCancel && (
        <div className="text-center pt-1">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 rounded-full liquid-glass text-xs font-light text-white/60 hover:text-white transition-all cursor-pointer"
          >
            Cancel Scan
          </button>
        </div>
      )}
    </div>
  );
}
