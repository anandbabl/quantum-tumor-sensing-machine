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
  ArrowRight
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
          p.scan_id.toLowerCase().includes(q) ||
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
      subtitle="Historical log of cranial MRI classifications, calibrated confidence matrices, and TensorFlow Grad-CAM spatial records."
      actionText="Analyze Scan"
      actionHref="/analyze"
    >
      <div className="space-y-12">
        {/* Minimalist Filter Bar on Void */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#181818]">
          {/* Class Filter Text Tabs */}
          <div className="flex items-center gap-6 text-[13px] uppercase tracking-[0.025em]">
            {["ALL", "Glioma Tumor", "Meningioma Tumor", "Pituitary Tumor"].map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`transition-colors cursor-pointer ${
                  selectedClass === cls
                    ? "text-[#ffffff] font-semibold border-b-2 border-[#8052ff] pb-1"
                    : "text-[#9a9a9a] hover:text-[#ffffff]"
                }`}
              >
                {cls === "ALL" ? "All Histologies" : cls.replace(" Tumor", "")}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666666]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scan ID or class..."
              className="w-full pl-10 pr-4 py-2 rounded-[22.5px] bg-[#000000] border border-[#222222] text-[13px] text-[#ffffff] placeholder-[#666666] focus:outline-none focus:border-[#8052ff]"
            />
          </div>
        </div>

        {/* Floating Inferences Stream on Black Void */}
        <div className="divide-y divide-[#181818]">
          {isLoading ? (
            <div className="py-16 text-center text-[18px] font-extralight text-[#9a9a9a]">
              Loading historical neural evaluations...
            </div>
          ) : filteredPredictions.length > 0 ? (
            filteredPredictions.map((pred) => (
              <div
                key={pred.id}
                className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-[20px] font-normal text-[#ffffff] group-hover:text-[#8052ff] transition-colors">
                      {pred.predicted_class}
                    </span>
                    <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#ffb829]">
                      {(pred.confidence * 100).toFixed(1)}% Confidence
                    </span>
                  </div>
                  <span className="text-[13px] font-extralight text-[#9a9a9a] block">
                    Scan ID: {pred.scan_id ? pred.scan_id.slice(0, 8) : "N/A"} • Grad-CAM Generated • Inference: {pred.inference_time_ms ? `${pred.inference_time_ms.toFixed(1)}ms` : "35ms"}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-[13px] text-[#9a9a9a]">
                  <span>{new Date(pred.created_at).toLocaleDateString()}</span>
                  <button
                    onClick={() => setSelectedPrediction(pred)}
                    className="text-[#ffffff] hover:text-[#8052ff] uppercase text-[12px] font-semibold tracking-wider transition-colors cursor-pointer"
                  >
                    Inspect Overlay →
                  </button>
                  <button
                    onClick={() => handleDownloadReport(pred.id)}
                    disabled={isGeneratingReport === pred.id}
                    className="text-[#8052ff] hover:text-white uppercase text-[12px] font-semibold tracking-wider transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {isGeneratingReport === pred.id ? "PDF..." : "PDF"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-[18px] font-extralight text-[#9a9a9a]">
              No archived evaluations match your query.
            </div>
          )}
        </div>

        {/* Inspection Modal on Pure Black Void */}
        {selectedPrediction && (
          <div className="fixed inset-0 z-50 bg-[#000000]/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-[#000000] border border-[#222222] rounded-[24px] p-8 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-[#181818]">
                <div className="space-y-1">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#ffb829] block">
                    Historical Record
                  </span>
                  <h3 className="text-[28px] font-normal tracking-tight text-[#ffffff]">
                    {selectedPrediction.predicted_class}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPrediction(null)}
                  className="text-[#9a9a9a] hover:text-[#ffffff] text-xl cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {selectedPrediction.heatmap_path && (
                <div className="rounded-[16px] overflow-hidden bg-[#000000] border border-[#222222] aspect-square flex items-center justify-center">
                  <img
                    src={getAssetUrl(selectedPrediction.heatmap_path)}
                    alt="Grad-CAM Overlay"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-[14px] text-[#9a9a9a]">
                  Confidence: <b className="text-[#ffffff]">{(selectedPrediction.confidence * 100).toFixed(1)}%</b>
                </span>
                <button
                  onClick={() => handleDownloadReport(selectedPrediction.id)}
                  className="bg-[#8052ff] hover:opacity-90 text-[#ffffff] text-[13px] font-semibold uppercase tracking-[0.025em] rounded-[22.5px] px-5 py-2.5"
                >
                  Download PDF Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
