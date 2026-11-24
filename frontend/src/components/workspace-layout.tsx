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
    </div>
  );
}
