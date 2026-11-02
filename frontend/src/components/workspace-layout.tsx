"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  categoryLabel?: string;
  actionText?: string;
  actionHref?: string;
  fluidWidth?: boolean;
  hideDefaultFooter?: boolean;
}

export default function WorkspaceLayout({
  children,
  title,
  subtitle,
  categoryLabel,
  actionText,
  actionHref,
  fluidWidth = false,
  hideDefaultFooter = false,
}: WorkspaceLayoutProps) {
  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff] flex flex-col selection:bg-[#8052ff] selection:text-white">
      {/* Dala Transparent Top Navigation Bar */}
      <Navbar />

      {/* Main Workspace Canvas floating on Black Void */}
      <main className="flex-1 w-full">
        <div className={`mx-auto px-6 py-10 md:py-16 ${fluidWidth ? "max-w-[1500px]" : "max-w-[1280px]"}`}>
          {/* Optional Dala Section Headline Block */}
          {title && (
            <div className="mb-14 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl space-y-3">
                {categoryLabel && (
                  <span className="text-[14px] font-semibold uppercase tracking-[0.025em] text-[#ffb829] block">
                    {categoryLabel}
                  </span>
                )}
                <h1 className="text-[38px] sm:text-[48px] md:text-[54px] font-normal tracking-[-1.68px] text-[#ffffff] leading-[1.1]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-[18px] font-extralight text-[#bdbdbd] leading-relaxed pt-1">
                    {subtitle}
                  </p>
                )}
              </div>

              {actionText && actionHref && (
                <div className="shrink-0">
                  <Link
                    href={actionHref}
                    className="inline-flex items-center gap-2 bg-[#8052ff] hover:opacity-90 active:scale-95 text-[#ffffff] text-[14px] font-semibold uppercase tracking-[0.025em] rounded-[22.5px] px-[20px] py-[13px] transition-all"
                  >
                    {actionText}
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Page Content Floating on Void */}
          {children}
        </div>
      </main>

      {/* Dala Minimalist Void Footer */}
      {!hideDefaultFooter && (
        <footer className="w-full bg-[#000000] border-t border-[#141414] py-12 text-[#9a9a9a] text-[14px]">
          <div className="max-w-[1280px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="text-[#ffffff] font-normal uppercase tracking-[0.025em]">
                QUANTUM TUMOR SENSING MACHINE
              </span>
              <span className="text-[#ffb829] text-[12px] uppercase tracking-wider font-semibold">
                EFFICIENTNETB3 • 96.24%
              </span>
            </div>

            <div className="flex items-center gap-8 text-[13px] uppercase tracking-[0.025em]">
              <Link href="/research" className="hover:text-[#ffffff] transition-colors">
                Research
              </Link>
              <Link href="/performance" className="hover:text-[#ffffff] transition-colors">
                Benchmark
              </Link>
              <Link href="/analyze" className="hover:text-[#ffffff] transition-colors">
                Analyze
              </Link>
              <span className="text-[#666666]">2026 Medical AI</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
