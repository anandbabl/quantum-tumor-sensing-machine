"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Atom,
  LayoutDashboard,
  UploadCloud,
  History,
  Users,
  Bot,
  BarChart3,
  Cpu,
  BookOpen,
  Settings,
  ShieldCheck
} from "lucide-react";

export default function DashboardSidebar() {
  const pathname = usePathname();

  // The 9 required navigation items (Login, Register & Logout completely removed)
  const navItems = [
    { label: "Overview Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "New MRI Analysis", href: "/analyze", icon: UploadCloud, badge: "AI Core" },
    { label: "Prediction History", href: "/history", icon: History },
    { label: "Patient Management", href: "/patients", icon: Users },
    { label: "AI Medical Assistant", href: "/assistant", icon: Bot, badge: "Groq" },
    { label: "Analytics & Reports", href: "/analytics", icon: BarChart3 },
    { label: "Model Performance", href: "/performance", icon: Cpu, badge: "QML" },
    { label: "Research & Information", href: "/research", icon: BookOpen },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#080B14] border-r border-white/[0.08] flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-30">
      {/* Top Branding */}
      <div>
        <div className="h-20 px-5 flex items-center gap-3 border-b border-white/[0.08] bg-[#080B14]">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] via-[#6366F1] to-[#22D3EE] flex items-center justify-center p-2 shadow-[0_0_20px_rgba(139,92,246,0.35)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] transition-all">
              <Atom className="w-full h-full text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[13px] tracking-tight text-[#F8FAFC]">QUANTUM TUMOR</span>
              </div>
              <p className="text-[9px] text-[#22D3EE] tracking-wider uppercase font-semibold">Sensing Machine</p>
            </div>
          </Link>
        </div>

        {/* 9 Navigation Items */}
        <div className="p-3.5 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
          <div className="px-3 pb-2 pt-1 text-[10px] font-bold text-[#64748B] tracking-wider uppercase">
            Platform Modules
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-[#8B5CF6] text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]"
                    : "text-[#94A3B8] hover:text-white hover:bg-[#101626]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-[#94A3B8] group-hover:text-[#22D3EE]"}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && !isActive && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#151D30] text-[#22D3EE] border border-[#22D3EE]/30 font-semibold shrink-0">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Platform & Clinical Operator Status */}
      <div className="p-3.5 border-t border-white/[0.08] bg-[#101626]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6] shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#22D3EE]" />
          </div>
          <div className="truncate min-w-0">
            <div className="text-xs font-semibold text-[#F8FAFC] truncate">Clinical Operator</div>
            <div className="text-[10px] text-[#22C55E] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              <span>Full System Unlocked</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
