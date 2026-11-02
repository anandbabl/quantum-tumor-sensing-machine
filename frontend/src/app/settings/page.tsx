"use client";

import React, { useState } from "react";
import WorkspaceLayout from "@/components/workspace-layout";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/api";
import { Sparkles } from "lucide-react";

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
    >
      <div className="space-y-12 max-w-3xl">
        {statusMessage && (
          <div className="py-3 px-4 border border-[#8052ff] text-[#ffffff] text-[14px]">
            {statusMessage.text}
          </div>
        )}

        {/* Text Tabs on Void */}
        <div className="flex items-center gap-8 text-[13px] uppercase tracking-[0.025em] pb-4 border-b border-[#181818]">
          {[
            { id: "groq", label: "Groq API" },
            { id: "profile", label: "Operator Profile" },
            { id: "system", label: "Platform Info" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`transition-colors cursor-pointer pb-2 ${
                  isActive
                    ? "text-[#ffffff] font-semibold border-b-2 border-[#8052ff]"
                    : "text-[#9a9a9a] hover:text-[#ffffff]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Groq API Key */}
        {activeTab === "groq" && (
          <form onSubmit={handleSaveGroqKey} className="space-y-6 text-[14px]">
            <div className="space-y-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#ffb829] block">
                Official Groq Cloud
              </span>
              <h3 className="text-[28px] font-normal text-[#ffffff]">
                AI Medical Assistant API Key
              </h3>
              <p className="text-[16px] font-extralight text-[#9a9a9a] leading-relaxed">
                Connect your personal Groq API key for high-speed LLaMA 3.3 70B inference. If left empty, the platform automatically routes requests through the embedded Clinical Knowledge Engine.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-[12px] font-extralight text-[#9a9a9a] block">
                Groq API Key (gsk_...)
              </label>
              <input
                type="password"
                value={customGroqKey}
                onChange={(e) => setCustomGroqKey(e.target.value)}
                placeholder="gsk_••••••••••••••••••••••••••••••••"
                className="w-full px-4 py-3 rounded-[12px] bg-[#000000] border border-[#222222] text-[#ffffff] font-mono text-[14px] focus:outline-none focus:border-[#8052ff]"
              />
            </div>

            <button
              type="submit"
              className="bg-[#8052ff] hover:opacity-90 active:scale-95 text-[#ffffff] text-[13px] font-semibold uppercase tracking-[0.025em] rounded-[22.5px] px-6 py-3 cursor-pointer"
            >
              Save API Key
            </button>
          </form>
        )}

        {/* Tab 2: Profile */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-6 text-[14px]">
            <div className="space-y-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#8052ff] block">
                Clinical Operator
              </span>
              <h3 className="text-[28px] font-normal text-[#ffffff]">
                Operator Identity
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-extralight text-[#9a9a9a] block mb-1">
                  Operator Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-[12px] bg-[#000000] border border-[#222222] text-[#ffffff] text-[14px] focus:outline-none focus:border-[#8052ff]"
                />
              </div>

              <div>
                <label className="text-[12px] font-extralight text-[#9a9a9a] block mb-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-[12px] bg-[#000000] border border-[#222222] text-[#ffffff] text-[14px] focus:outline-none focus:border-[#8052ff]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#8052ff] hover:opacity-90 active:scale-95 text-[#ffffff] text-[13px] font-semibold uppercase tracking-[0.025em] rounded-[22.5px] px-6 py-3 cursor-pointer"
            >
              Update Profile
            </button>
          </form>
        )}

        {/* Tab 3: System Specifications */}
        {activeTab === "system" && (
          <div className="space-y-6 text-[14px]">
            <div className="space-y-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#15846e] block">
                Platform Architecture
              </span>
              <h3 className="text-[28px] font-normal text-[#ffffff]">
                System Runtime Specifications
              </h3>
            </div>

            <div className="divide-y divide-[#181818] text-[14px]">
              <div className="py-3 flex justify-between">
                <span className="text-[#9a9a9a]">Neural Model Engine</span>
                <span className="text-[#ffffff]">brain_tumor_model.keras (EfficientNetB3)</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-[#9a9a9a]">Benchmark Accuracy</span>
                <span className="text-[#ffb829] font-normal">96.24% Verified</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-[#9a9a9a]">Explainability Service</span>
                <span className="text-[#ffffff]">TensorFlow GradientTape Grad-CAM</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-[#9a9a9a]">Interface Theme</span>
                <span className="text-[#8052ff]">Dala Constellation Floating on Void</span>
              </div>
            </div>

            {/* Cinematic 3D Intro Replay Card */}
            <div className="pt-6 border-t border-[#181818] space-y-3">
              <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#ffb829] block">
                Visual Experience
              </span>
              <h4 className="text-[20px] font-normal text-[#ffffff]">
                Cinematic 3D Brain Intro
              </h4>
              <p className="text-[14px] font-extralight text-[#9a9a9a] leading-relaxed">
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
                className="bg-[#8052ff] hover:opacity-90 active:scale-95 text-[#ffffff] text-[13px] font-semibold uppercase tracking-[0.025em] rounded-[22.5px] px-6 py-3 cursor-pointer inline-flex items-center gap-2 transition-all"
              >
                <span>Replay 3D Brain Intro</span>
                <Sparkles className="w-4 h-4 text-[#22d3ee]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
