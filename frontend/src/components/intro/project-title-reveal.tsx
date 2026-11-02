"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

interface ProjectTitleRevealProps {
  isVisible: boolean;
  onFinished?: () => void;
}

export default function ProjectTitleReveal({ isVisible, onFinished }: ProjectTitleRevealProps) {
  if (!isVisible) return null;

  const line1 = "QUANTUM TUMOR";
  const line2 = "SENSING MACHINE";

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.2,
      },
    },
  };

  const letterVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.9,
      filter: "blur(12px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center select-none px-6">
      {/* Volumetric Radial Glow Behind Title */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 0.8, scale: 1.2 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#8052ff]/30 via-[#22d3ee]/15 to-transparent blur-3xl pointer-events-none"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onAnimationComplete={onFinished}
        className="relative z-10 text-center space-y-1 sm:space-y-2"
      >
        {/* Line 1: QUANTUM TUMOR */}
        <div className="flex justify-center flex-wrap">
          {line1.split("").map((char, index) => (
            <motion.span
              key={`line1-${index}`}
              variants={letterVariants}
              className={`inline-block font-normal text-white text-[44px] sm:text-[72px] md:text-[90px] lg:text-[104px] tracking-[-0.04em] leading-[1.0] ${
                char === " " ? "w-4 sm:w-8" : ""
              }`}
              style={{
                textShadow: "0 0 35px rgba(128, 82, 255, 0.6), 0 0 70px rgba(34, 211, 238, 0.3)",
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>

        {/* Line 2: SENSING MACHINE */}
        <div className="flex justify-center flex-wrap">
          {line2.split("").map((char, index) => (
            <motion.span
              key={`line2-${index}`}
              variants={letterVariants}
              className={`inline-block font-normal bg-gradient-to-r from-[#ffffff] via-[#c084fc] to-[#22d3ee] bg-clip-text text-transparent text-[44px] sm:text-[72px] md:text-[90px] lg:text-[104px] tracking-[-0.04em] leading-[1.0] ${
                char === " " ? "w-4 sm:w-8" : ""
              }`}
              style={{
                textShadow: "0 0 40px rgba(34, 211, 238, 0.5)",
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>

        {/* Subtle Telemetry Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 0.9, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="pt-4 text-[13px] sm:text-[15px] font-extralight text-[#9a9a9a] uppercase tracking-[0.3em] font-mono"
        >
          Intelligent Brain MRI Analysis & Tumor Classification
        </motion.p>
      </motion.div>
    </div>
  );
}
