"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import WorkspaceLayout from "@/components/workspace-layout";
import { apiRequest, getAssetUrl, getApiUrl } from "@/lib/api";
import { Prediction } from "@/types";
import {
  Search,
  Download,
  X,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  Activity,
  FileText
} from "lucide-react";

export default function HistoryPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [filteredPredictions, setFilteredPredictions] = useState<Prediction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [sortBy, setSortBy] = useState<"date" | "confidence">("date");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setIsLoading(true);
    apiRequest<Prediction[]>("/predictions/history")
      .then((data) => {
        setPredictions(data || []);
        setFilteredPredictions(data || []);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    let result = [...predictions];
    if (selectedClass !== "ALL") {
      result = result.filter((p) => p.predicted_class === selectedClass);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          (p.scan_id && p.scan_id.toLowerCase().includes(q)) ||
          p.predicted_class.toLowerCase().includes(q)
      );
    }
    if (sortBy === "confidence") {
      result.sort((a, b) => b.confidence - a.confidence);
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    setFilteredPredictions(result);
  }, [searchQuery, selectedClass, sortBy, predictions]);

  const handleDownloadReport = async (predictionId: string) => {
    setIsGeneratingReport(predictionId);
    try {
      const res = await apiRequest<{ download_url: string }>(`/reports/generate/${predictionId}`, {
        method: "POST",
      });
      window.open(getApiUrl(res.download_url), "_blank");
    } catch (err: any) {
      alert("Failed to generate report: " + err.message);
    } finally {
      setIsGeneratingReport(null);
    }
  };

  return (
    <WorkspaceLayout
      categoryLabel="Neural Database"
      title="Prediction Archive"
      subtitle="Historical telemetry log of cranial MRI classifications, calibrated confidence matrices, and TensorFlow Grad-CAM spatial activation records."
      actionText="Analyze Scan"
      actionHref="/analyze"
    >
      <div className="space-y-8">
        {/* Floating Filter Bar */}
        <div className="p-4 sm:p-5 rounded-3xl liquid-glass flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          {/* Class Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "ALL", label: "All Histologies" },
              { id: "Glioma Tumor", label: "Glioma" },
              { id: "Meningioma Tumor", label: "Meningioma" },
              { id: "Pituitary Tumor", label: "Pituitary" },
            ].map((cls) => {
              const isActive = selectedClass === cls.id;
              return (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls.id)}
                  className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all cursor-pointer liquid-glass-interactive ${
                    isActive
                      ? "bg-white/20 text-white shadow-md ring-1 ring-white/30"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {cls.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scan ID or histology..."
              className="w-full pl-10 pr-4 py-2 rounded-full liquid-glass text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
            />
          </div>
        </div>

        {/* Floating Inferences Stream on Liquid Glass */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-20 rounded-3xl liquid-glass text-center text-sm font-light text-white/60">
              Loading historical neural evaluations...
            </div>
          ) : filteredPredictions.length > 0 ? (
            filteredPredictions.map((pred) => (
              <div
                key={pred.id}
                className="p-5 sm:p-6 rounded-3xl liquid-glass liquid-glass-interactive flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-lg sm:text-xl font-medium text-white group-hover:text-cyan-300 transition-colors">
                      {pred.predicted_class}
                    </span>
                    <span className="px-3 py-1 rounded-full liquid-glass text-[11px] font-mono uppercase tracking-wider text-amber-300 border border-amber-300/20">
                      {(pred.confidence * 100).toFixed(1)}% Confidence
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-light text-white/60">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Layers className="w-3.5 h-3.5 text-cyan-300" />
                      Scan: {pred.scan_id ? pred.scan_id.slice(0, 10) : "N/A"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      Latency: {pred.inference_time_ms ? `${pred.inference_time_ms.toFixed(1)}ms` : "35ms"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-white/40" />
                      {new Date(pred.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => setSelectedPrediction(pred)}
                    className="px-4 py-2 rounded-full liquid-glass liquid-glass-interactive text-xs font-medium text-white/90 hover:text-white cursor-pointer"
                  >
                    Inspect Overlay →
                  </button>
                  <button
                    onClick={() => handleDownloadReport(pred.id)}
                    disabled={isGeneratingReport === pred.id}
                    className="px-4 py-2 rounded-full liquid-glass liquid-glass-interactive text-xs font-medium text-cyan-300 hover:text-white cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isGeneratingReport === pred.id ? "Generating..." : "PDF Report"}</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 rounded-3xl liquid-glass text-center text-sm font-light text-white/60">
              No archived evaluations match your query.
            </div>
          )}
        </div>

        {/* Inspection Modal on Liquid Glass */}
        {selectedPrediction && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-3xl liquid-glass p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 block">
                    Telemetry Spatial Record
                  </span>
                  <h3 className="text-2xl font-medium tracking-tight text-white">
                    {selectedPrediction.predicted_class}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPrediction(null)}
                  className="w-9 h-9 rounded-full liquid-glass flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedPrediction.heatmap_path && (
                <div className="rounded-2xl overflow-hidden liquid-glass aspect-square flex items-center justify-center p-3 border border-white/10">
                  <img
                    src={getAssetUrl(selectedPrediction.heatmap_path)}
                    alt="Grad-CAM Overlay"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="text-xs text-white/70">
                  Calibrated Confidence: <b className="text-white font-mono text-sm">{(selectedPrediction.confidence * 100).toFixed(1)}%</b>
                </div>
                <button
                  onClick={() => handleDownloadReport(selectedPrediction.id)}
                  className="px-6 py-3 rounded-full liquid-glass liquid-glass-interactive text-xs font-medium text-white hover:bg-white/15 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-cyan-300" />
                  <span>Download Clinical PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
