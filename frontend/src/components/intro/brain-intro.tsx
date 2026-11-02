"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InteractiveBrain from "./interactive-brain";
import ProjectTitleReveal from "./project-title-reveal";

interface BrainIntroProps {
  onComplete: () => void;
}

export default function BrainIntro({ onComplete }: BrainIntroProps) {
  const [showTitle, setShowTitle] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleStartBloom = () => {
    // Phase 1 initiated
  };

  const handleBloomPeak = () => {
    // Phase 3 reached -> trigger title reveal
    setShowTitle(true);
  };

  const handleCompleteSequence = () => {
    // Phase 5 reached -> fade out intro
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  // Keyboard shortcut: ESC to skip intro
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="brain-intro-root"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 bg-[#000000] overflow-hidden select-none cursor-default"
        >
          {/* Three.js Interactive 3D Brain & Particle Canvas */}
          <InteractiveBrain
            onStartBloom={handleStartBloom}
            onBloomPeak={handleBloomPeak}
            onComplete={handleCompleteSequence}
          />

          {/* Monumental Typographic Title Reveal */}
          <ProjectTitleReveal isVisible={showTitle} />

          {/* Accessible Skip Button (Bottom-Right) */}
          <button
            onClick={handleSkip}
            className="absolute bottom-6 right-6 z-40 text-[11px] font-mono text-[#555555] hover:text-[#ffffff] uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/5 hover:border-white/20 bg-black/40 backdrop-blur-md transition-all cursor-pointer"
            title="Skip directly to platform (or press ESC)"
          >
            Skip Intro [ESC]
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
