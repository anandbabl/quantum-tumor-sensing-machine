"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import WorkspaceLayout from "@/components/workspace-layout";
import { apiRequest, getAssetUrl } from "@/lib/api";
import { MRIScan, Prediction } from "@/types";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sliders,
  RefreshCw,
  Eye,
  Maximize2,
  Minimize2,
  SplitSquareVertical,
  Brain,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";

function ViewerContent() {
  const searchParams = useSearchParams();
  const initialScanId = searchParams.get("scan_id");

  const [scans, setScans] = useState<MRIScan[]>([]);
  const [selectedScanId, setSelectedScanId] = useState<string>(initialScanId || "");
  const [currentScan, setCurrentScan] = useState<MRIScan | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Visualizer Controls State
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.5);
  const [isSplitView, setIsSplitView] = useState(false);

  useEffect(() => {
    apiRequest<MRIScan[]>("/mri/scans")
      .then((data) => {
        setScans(data || []);
        if (!selectedScanId && data && data.length > 0) {
          setSelectedScanId(data[0].id);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (selectedScanId) {
      const found = scans.find((s) => s.id === selectedScanId);
      if (found) setCurrentScan(found);

      apiRequest<Prediction>(`/predictions/scan/${selectedScanId}`)
        .then((p) => setPrediction(p))
        .catch(() => setPrediction(null));
    }
  }, [selectedScanId, scans]);

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setHeatmapOpacity(0.5);
  };

  const imageFilterStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
    transform: `scale(${zoom}) rotate(${rotation}deg)`,
    transition: "transform 0.15s ease-out",
  };

  return (
    <WorkspaceLayout
      title="Advanced Medical Image Visualization Workspace"
      subtitle="Multi-scale zoom, contrast filtering, and True Grad-CAM salience opacity controls"
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="p-4 rounded-2xl bg-[#0A0A0E] border border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
          
          {/* Scan Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#9A9A9A]">Active MRI:</span>
            <select
              value={selectedScanId}
              onChange={(e) => setSelectedScanId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#8052FF]"
            >
              {scans.length === 0 && <option value="">No scans uploaded</option>}
              {scans.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0A0A0E] text-white">
                  {s.original_filename} ({s.id.slice(0, 8)})
                </option>
              ))}
            </select>
          </div>

          {/* Viewer Tools Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center bg-white/[0.04] rounded-xl border border-white/[0.08] p-1">
              <button
                onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.25))}
                className="p-1.5 hover:bg-white/10 rounded-lg text-[#9A9A9A] hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono px-2 text-white">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((prev) => Math.min(4, prev + 0.25))}
                className="p-1.5 hover:bg-white/10 rounded-lg text-[#9A9A9A] hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Rotate */}
            <button
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#9A9A9A] hover:text-white text-xs flex items-center gap-1.5"
              title="Rotate 90°"
            >
              <RotateCw className="w-4 h-4" />
              <span>{rotation}°</span>
            </button>

            {/* Split Screen View Toggle */}
            <button
              onClick={() => setIsSplitView(!isSplitView)}
              className={`p-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
                isSplitView
                  ? "bg-[#8052FF] border-[#8052FF] text-white shadow-[0_0_15px_rgba(128,82,255,0.4)]"
                  : "bg-white/[0.04] border-white/[0.08] text-[#9A9A9A] hover:text-white"
              }`}
            >
              <SplitSquareVertical className="w-4 h-4" />
              <span>{isSplitView ? "Overlaid" : "Side-by-Side"}</span>
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#9A9A9A] hover:text-white"
              title="Reset Controls"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sliders Control Panel */}
        <div className="p-4 rounded-2xl bg-[#0A0A0E] border border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Heatmap Opacity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#9A9A9A]">Grad-CAM Opacity</span>
              <span className="text-white font-mono">{Math.round(heatmapOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={heatmapOpacity}
              onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
              className="w-full accent-[#8052FF]"
            />
          </div>

          {/* Brightness */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#9A9A9A]">Brightness</span>
              <span className="text-white font-mono">{brightness}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="180"
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              className="w-full accent-[#FFB829]"
            />
          </div>

          {/* Contrast */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#9A9A9A]">Contrast</span>
              <span className="text-white font-mono">{contrast}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="200"
              value={contrast}
              onChange={(e) => setContrast(parseInt(e.target.value))}
              className="w-full accent-[#15846E]"
            />
          </div>
        </div>

        {/* Visualizer Canvas Area */}
        <div className="p-6 rounded-3xl bg-[#050508] border border-white/[0.08] min-h-[520px] flex items-center justify-center overflow-hidden relative">
          {!currentScan ? (
            <div className="text-center space-y-3">
              <Brain className="w-10 h-10 text-[#666666] mx-auto" />
              <p className="text-xs text-[#9A9A9A]">No MRI Scan selected for visualization.</p>
            </div>
          ) : isSplitView ? (
            /* Side-by-Side Comparison View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              {/* Original Scan */}
              <div className="space-y-2 text-center">
                <span className="text-xs font-semibold text-[#9A9A9A] uppercase tracking-wider block">Original MRI Scan</span>
                <div className="aspect-square rounded-2xl bg-black border border-white/10 overflow-hidden flex items-center justify-center">
                  <img
                    src={getAssetUrl(currentScan.file_path)}
                    alt="Original MRI"
                    style={imageFilterStyle}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>

              {/* Grad-CAM Heatmap */}
              <div className="space-y-2 text-center">
                <span className="text-xs font-semibold text-[#8052FF] uppercase tracking-wider block">Grad-CAM Salience Map</span>
                <div className="aspect-square rounded-2xl bg-black border border-white/10 overflow-hidden flex items-center justify-center">
                  {prediction?.heatmap_path ? (
                    <img
                      src={getAssetUrl(prediction.heatmap_path)}
                      alt="Grad-CAM Heatmap"
                      style={imageFilterStyle}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-xs text-[#666666] p-6">Prediction not yet executed for this scan.</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Overlaid Canvas View with Dynamic Opacity */
            <div className="relative max-w-md w-full aspect-square rounded-2xl bg-black border border-white/10 overflow-hidden flex items-center justify-center">
              {/* Base MRI */}
              <img
                src={getAssetUrl(currentScan.file_path)}
                alt="Base MRI"
                style={imageFilterStyle}
                className="absolute inset-0 w-full h-full object-contain"
              />

              {/* Grad-CAM Overlay with Opacity */}
              {prediction?.heatmap_path && (
                <img
                  src={getAssetUrl(prediction.heatmap_path)}
                  alt="Grad-CAM Overlay"
                  style={{
                    ...imageFilterStyle,
                    opacity: heatmapOpacity,
                  }}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
              )}
            </div>
          )}

          {/* Diagnostic Pill in Corner */}
          {prediction && (
            <div className="absolute bottom-6 left-6 p-3 rounded-xl bg-[#0A0A0E]/80 backdrop-blur-md border border-white/10 text-xs space-y-1">
              <div className="text-[10px] text-[#9A9A9A]">Classified Neoplasm:</div>
              <div className="font-bold text-[#8052FF]">{prediction.predicted_class}</div>
              <div className="text-[10px] text-[#15846E]">Confidence: {prediction.confidence_percentage}%</div>
            </div>
          )}
        </div>
      </div>
    </WorkspaceLayout>
  );
}

export default function ViewerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-xs text-white">Loading Viewer...</div>}>
      <ViewerContent />
    </Suspense>
  );
}
