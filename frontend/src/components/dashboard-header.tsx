"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { NotificationItem } from "@/types";
import { Bell, UploadCloud, CheckCircle2, AlertCircle, Info, X, Atom } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  actionHref?: string;
}

export default function DashboardHeader({ title, subtitle, actionText, actionHref }: HeaderProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    apiRequest<NotificationItem[]>("/notifications")
      .then((items) => setNotifications(items || []))
      .catch(() => {});
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = () => {
    notifications.forEach((n) => {
      if (!n.is_read) {
        apiRequest(`/notifications/${n.id}/read`, { method: "PUT" }).catch(() => {});
      }
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <header className="h-20 border-b border-white/[0.08] bg-[#080B14]/80 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-bold text-[#F8FAFC] tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-[#94A3B8]">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3.5">
        {/* Model Live Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#151D30] border border-[#22D3EE]/30 text-xs shadow-[0_0_15px_rgba(34,211,238,0.15)]">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[#22D3EE] text-[11px] font-semibold flex items-center gap-1">
            <Atom className="w-3.5 h-3.5" />
            <span>EfficientNetB3 (96.24%) Active</span>
          </span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifs(!showNotifs);
              if (!showNotifs && unreadCount > 0) markAllRead();
            }}
            className="p-2.5 rounded-xl bg-[#151D30] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors relative border border-white/[0.08] cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#8B5CF6] ring-2 ring-[#080B14]" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifs && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#101626] border border-white/[0.1] shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                <span className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">System Notifications</span>
                <button onClick={() => setShowNotifs(false)} className="text-[#94A3B8] hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#94A3B8]">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        n.is_read
                          ? "bg-white/[0.02] border-white/[0.04] text-[#94A3B8]"
                          : "bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-[#F8FAFC]"
                      }`}
                    >
                      <div className="font-semibold flex items-center gap-1.5">
                        {n.notification_type === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />}
                        {n.notification_type === "warning" && <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B]" />}
                        {n.notification_type === "info" && <Info className="w-3.5 h-3.5 text-[#8B5CF6]" />}
                        <span>{n.title}</span>
                      </div>
                      <p className="text-[11px] text-[#94A3B8]">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action CTA */}
        {actionText && actionHref && (
          <Link
            href={actionHref}
            className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold transition-all shadow-[0_0_15px_rgba(139,92,246,0.35)] flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{actionText}</span>
          </Link>
        )}
      </div>
    </header>
  );
}
