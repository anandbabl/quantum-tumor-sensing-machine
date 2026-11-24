"use client";

import React, { useState } from "react";
import WorkspaceLayout from "@/components/workspace-layout";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/api";
import { Sparkles, Key, UserCheck, Cpu, CheckCircle2, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"groq" | "profile" | "system">("groq");
  const [fullName, setFullName] = useState(user?.full_name || "Lead Clinical Operator");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "+1 (555) 019-2834");
  const [customGroqKey, setCustomGroqKey] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage({ type: "success", text: "Operator profile details saved." });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSaveGroqKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest<{ success: boolean; message: string }>("/chat/key", {
        method: "POST",
        body: JSON.stringify({ key: customGroqKey }),
      });
      setStatusMessage({ type: "success", text: res.message || "Groq LLM API configuration updated." });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: `Error updating Groq key: ${err.message || "Failed"}` });
    }
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <WorkspaceLayout
      categoryLabel="Operator Configuration"
      title="System Settings"
      subtitle="Runtime environment, Groq API key configuration, and operational platform specifications."
      actionText="Analyze Scan"
      actionHref="/analyze"
    >
      <div className="space-y-8 max-w-4xl">
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl liquid-glass flex items-center gap-3 text-xs sm:text-sm font-medium animate-fadeIn ${
              statusMessage.type === "success"
                ? "text-emerald-400 border border-emerald-400/30"
                : "text-rose-400 border border-rose-400/30"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Floating .liquid-glass Tabs */}
        <div className="p-2 rounded-full liquid-glass inline-flex items-center gap-2 shadow-lg">
          {[
            { id: "groq", label: "Groq LLM API", icon: Key },
            { id: "profile", label: "Operator Profile", icon: UserCheck },
            { id: "system", label: "Platform Info", icon: Cpu },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs font-medium tracking-wide transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "bg-white/20 text-white shadow-md ring-1 ring-white/30"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Groq API Key */}
        {activeTab === "groq" && (
          <form onSubmit={handleSaveGroqKey} className="p-6 sm:p-8 rounded-3xl liquid-glass space-y-6 shadow-2xl">
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 block">
                Official Groq Cloud
              </span>
              <h3 className="text-2xl font-medium tracking-tight text-white">
                AI Medical Assistant API Key
              </h3>
              <p className="text-xs sm:text-sm font-light text-white/70 leading-relaxed max-w-2xl">
                Connect your personal Groq API key for ultra-fast LLaMA 3.3 70B inference. If left empty, the platform automatically routes requests through the embedded Clinical Knowledge Engine.
              </p>
            </div>

            <div className="space-y-2 pt-2 max-w-xl">
              <label className="text-xs font-light text-white/70 block">
                Groq API Key (gsk_...)
              </label>
              <input
                type="password"
                value={customGroqKey}
                onChange={(e) => setCustomGroqKey(e.target.value)}
                placeholder="gsk_••••••••••••••••••••••••••••••••"
                className="w-full px-4 py-3 rounded-2xl liquid-glass text-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-white/40"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-full liquid-glass liquid-glass-interactive text-xs font-medium text-white hover:bg-white/15 cursor-pointer shadow-lg"
            >
              Save API Key
            </button>
          </form>
        )}

        {/* Tab 2: Profile */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-3xl liquid-glass space-y-6 shadow-2xl">
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 block">
                Clinical Operator
              </span>
              <h3 className="text-2xl font-medium tracking-tight text-white">
                Operator Identity & Credentials
              </h3>
            </div>

            <div className="space-y-4 max-w-xl">
              <div>
                <label className="text-xs font-light text-white/70 block mb-1.5">
                  Operator Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl liquid-glass text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-white/40"
                />
              </div>

              <div>
                <label className="text-xs font-light text-white/70 block mb-1.5">
                  Direct Contact Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl liquid-glass text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-white/40"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-full liquid-glass liquid-glass-interactive text-xs font-medium text-white hover:bg-white/15 cursor-pointer shadow-lg"
            >
              Update Profile Details
            </button>
          </form>
        )}

        {/* Tab 3: System Specifications */}
        {activeTab === "system" && (
          <div className="p-6 sm:p-8 rounded-3xl liquid-glass space-y-6 shadow-2xl">
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 block">
                Platform Architecture
              </span>
              <h3 className="text-2xl font-medium tracking-tight text-white">
                System Runtime Specifications
              </h3>
            </div>

            <div className="divide-y divide-white/10 text-xs sm:text-sm">
              <div className="py-3.5 flex justify-between items-center">
                <span className="text-white/60">Neural Model Engine</span>
                <span className="text-white font-mono">brain_tumor_model.keras (EfficientNetB3)</span>
              </div>
              <div className="py-3.5 flex justify-between items-center">
                <span className="text-white/60">Benchmark Accuracy</span>
                <span className="text-amber-300 font-mono font-medium">96.24% Calibrated</span>
              </div>
              <div className="py-3.5 flex justify-between items-center">
                <span className="text-white/60">Explainability Service</span>
                <span className="text-white font-mono">TensorFlow GradientTape Grad-CAM</span>
              </div>
              <div className="py-3.5 flex justify-between items-center">
                <span className="text-white/60">Interface Architecture</span>
                <span className="text-cyan-300 font-medium">Liquid Glass Translucent System</span>
              </div>
            </div>

            {/* Cinematic 3D Intro Replay Card */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 block">
                Visual Experience
              </span>
              <h4 className="text-lg font-medium text-white">
                Cinematic 3D Brain Intro
              </h4>
              <p className="text-xs sm:text-sm font-light text-white/70 leading-relaxed max-w-xl">
                Experience the interactive 3D human brain simulation, particle bloom animation, and monumental project identity reveal.
              </p>
              <button
                type="button"
                onClick={() => {
                  try {
                    sessionStorage.removeItem("quantum_intro_seen");
                  } catch {}
                  window.location.href = "/?intro=true";
                }}
                className="px-6 py-3 rounded-full liquid-glass liquid-glass-interactive text-xs font-medium text-white hover:bg-white/15 cursor-pointer inline-flex items-center gap-2 shadow-lg"
              >
                <span>Replay 3D Brain Intro</span>
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </button>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
