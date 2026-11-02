"use client";

import React, { useState, useEffect } from "react";
import { Activity, ShieldCheck, Atom } from "lucide-react";

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
  let statusMessage = "Initializing MRI Analysis Engine...";
  let progressPercent = Math.min(100, (elapsedMs / 5000) * 100);

  if (seconds < 1.0) {
    statusMessage = "Initializing MRI Analysis Engine...";
  } else if (seconds < 2.0) {
    statusMessage = "Loading Brain MRI Scan...";
  } else if (seconds < 3.0) {
    statusMessage = "Extracting Neural Features...";
  } else if (seconds < 4.0) {
    statusMessage = "Analyzing Tumor Classification...";
  } else if (seconds < 5.0) {
    statusMessage = "Finalizing AI Prediction...";
  } else {
    statusMessage = "Awaiting Deep Convolutional Tensor Response...";
    progressPercent = 100;
  }

  return (
    <div className="w-full bg-[#000000] border border-[#222222] rounded-[24px] p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-[0_0_60px_rgba(34,211,238,0.12)] animate-fadeIn">
      {/* Background Violet/Cyan Radial Luminescence */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#8052ff]/10 via-[#22d3ee]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar of Scanner */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1a] relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0d0d0d] border border-[#22d3ee]/40 flex items-center justify-center">
            <Activity className="w-4 h-4 text-[#22d3ee] animate-pulse" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-[#ffffff] uppercase tracking-[0.025em] flex items-center gap-2">
              <span>Deep Neural MRI Scanner</span>
              <span className="w-2 h-2 rounded-full bg-[#22d3ee] animate-ping" />
            </h3>
            <p className="text-[11px] font-extralight text-[#9a9a9a]">
              EfficientNetB3 (300×300×3 RGB) • TensorFlow GradientTape Grad-CAM
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold text-[#ffb829] uppercase tracking-wider block">
            Scan Timer
          </span>
          <span className="text-[18px] font-mono font-normal text-[#ffffff]">
            {seconds.toFixed(2)}s
          </span>
        </div>
      </div>

      {/* Central Visual Scanner Screen */}
      <div className="relative aspect-square max-w-[440px] mx-auto rounded-[20px] overflow-hidden bg-[#030303] border border-[#2a2a2a] flex items-center justify-center shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
        {/* MRI Image with subtle illumination pulse */}
        <img
          src={imageUrl}
          alt="Brain MRI Scan Under Analysis"
          className="w-full h-full object-contain filter contrast-125 brightness-105 transition-all select-none"
        />

        {/* Animated Sweeping Cyan Laser Scanning Line */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="w-full h-[3px] bg-gradient-to-r from-transparent via-[#22d3ee] to-transparent shadow-[0_0_20px_#22d3ee,0_0_35px_#8052ff] animate-mri-scan" />
        </div>

        {/* Medical Scanner Reticle & Radar Rings */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Outer Pulsing Ring */}
          <div className="w-[85%] h-[85%] rounded-full border border-[#22d3ee]/20 animate-ping [animation-duration:3s]" />
          {/* Inner Rotating Dashed Reticle */}
          <div className="w-[65%] h-[65%] rounded-full border border-dashed border-[#8052ff]/30 animate-spin [animation-duration:12s]" />
          {/* Precision Center Crosshairs */}
          <div className="w-16 h-16 rounded-full border border-[#22d3ee]/40 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#22d3ee] shadow-[0_0_10px_#22d3ee]" />
          </div>

          {/* Corner Framing Brackets */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#22d3ee]/60" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#22d3ee]/60" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#22d3ee]/60" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#22d3ee]/60" />
        </div>

        {/* Live Scan Telemetry Coordinates Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-[#22d3ee]/80 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-[#222222]">
          <span>X: {(Math.sin(seconds * 3) * 45 + 50).toFixed(1)}°</span>
          <span>Y: {(Math.cos(seconds * 2) * 45 + 50).toFixed(1)}°</span>
          <span className="text-[#ffb829]">CH: 385 Sublayers</span>
        </div>
      </div>

      {/* Sequential Status Bar & Progress */}
      <div className="space-y-3 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22d3ee] animate-pulse" />
            <span className="text-[15px] font-normal text-[#ffffff] tracking-tight">
              {statusMessage}
            </span>
          </div>
          <span className="text-[12px] font-mono text-[#ffb829]">
            {Math.round(progressPercent)}%
          </span>
        </div>

        {/* Progress Bar with Cyan/Violet Glow */}
        <div className="w-full h-2 bg-[#141414] rounded-full overflow-hidden border border-[#222222]">
          <div
            className="h-full bg-gradient-to-r from-[#8052ff] via-[#22d3ee] to-[#ffb829] transition-all duration-100 ease-out shadow-[0_0_15px_rgba(34,211,238,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Stage Timeline Steps */}
        <div className="grid grid-cols-5 gap-1 pt-1 text-[10px] uppercase font-semibold tracking-wider text-center text-[#666666]">
          <span className={seconds >= 0 ? "text-[#22d3ee]" : ""}>01. Init</span>
          <span className={seconds >= 1 ? "text-[#22d3ee]" : ""}>02. Load</span>
          <span className={seconds >= 2 ? "text-[#22d3ee]" : ""}>03. Features</span>
          <span className={seconds >= 3 ? "text-[#22d3ee]" : ""}>04. Classify</span>
          <span className={seconds >= 4 ? "text-[#22d3ee]" : ""}>05. Finalize</span>
        </div>
      </div>

      {/* Optional Cancel Action */}
      {onCancel && (
        <div className="text-center pt-2">
          <button
            onClick={onCancel}
            className="text-[12px] uppercase font-semibold tracking-[0.025em] text-[#9a9a9a] hover:text-[#ffffff] transition-colors cursor-pointer"
          >
            Cancel Ingestion
          </button>
        </div>
      )}
    </div>
  );
}
