"use client";

import React, { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  RefreshCw,
  Layers,
  Sparkles
} from "lucide-react";

interface ImageManipulatorProps {
  originalUrl: string;
  heatmapUrl?: string | null;
  pureHeatmapUrl?: string | null;
  altText?: string;
  hasPrediction?: boolean;
}

export default function ImageManipulator({
  originalUrl,
  heatmapUrl,
  pureHeatmapUrl,
  altText = "Brain MRI Scan",
  hasPrediction = false,
}: ImageManipulatorProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [viewMode, setViewMode] = useState<"overlay" | "side_by_side" | "original" | "pure_heatmap">("overlay");

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.75));
  const handleRotateCw = () => setRotation((r) => (r + 90) % 360);
  const handleRotateCcw = () => setRotation((r) => (r - 90 + 360) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const activeDisplayUrl =
    viewMode === "overlay" && heatmapUrl
      ? heatmapUrl
      : viewMode === "pure_heatmap" && pureHeatmapUrl
      ? pureHeatmapUrl
      : originalUrl;

  return (
    <div className="space-y-4">
      {/* View Mode Switcher Toolbar */}
      {hasPrediction && (heatmapUrl || pureHeatmapUrl) && (
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-1.5 p-1 rounded-full liquid-glass">
            <button
              onClick={() => setViewMode("overlay")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-normal tracking-wide transition-all cursor-pointer ${
                viewMode === "overlay"
                  ? "bg-white/15 text-white font-medium shadow-sm"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Overlay Map
            </button>
            <button
              onClick={() => setViewMode("side_by_side")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-normal tracking-wide transition-all cursor-pointer ${
                viewMode === "side_by_side"
                  ? "bg-white/15 text-white font-medium shadow-sm"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Side-by-Side
            </button>
            {pureHeatmapUrl && (
              <button
                onClick={() => setViewMode("pure_heatmap")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-normal tracking-wide transition-all cursor-pointer ${
                  viewMode === "pure_heatmap"
                    ? "bg-white/15 text-amber-300 font-medium shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Pure Heatmap
              </button>
            )}
            <button
              onClick={() => setViewMode("original")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-normal tracking-wide transition-all cursor-pointer ${
                viewMode === "original"
                  ? "bg-white/15 text-white font-medium shadow-sm"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Raw MRI
            </button>
          </div>

          <div className="text-xs text-white/60 font-mono px-3 py-1 rounded-full liquid-glass">
            {Math.round(zoom * 100)}% • {rotation}°
          </div>
        </div>
      )}

      {/* Main Viewport Container with Liquid Glass (NO black box) */}
      <div className="relative rounded-3xl liquid-glass overflow-hidden min-h-[380px] flex items-center justify-center p-6 shadow-xl">
        {viewMode === "side_by_side" && heatmapUrl ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {/* Left: Original Scan */}
            <div className="space-y-2 text-center">
              <span className="text-xs font-medium text-white/70 uppercase tracking-wider block">
                Original Slice
              </span>
              <div className="rounded-2xl overflow-hidden liquid-glass aspect-square flex items-center justify-center p-2 border border-white/10 shadow-inner">
                <img
                  src={originalUrl}
                  alt="Original MRI"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: "transform 0.2s ease-out",
                  }}
                  className="max-h-full max-w-full object-contain rounded-xl select-none"
                />
              </div>
            </div>

            {/* Right: Grad-CAM Overlay */}
            <div className="space-y-2 text-center">
              <span className="text-xs font-medium text-cyan-300 uppercase tracking-wider block">
                Grad-CAM Activation
              </span>
              <div className="rounded-2xl overflow-hidden liquid-glass aspect-square flex items-center justify-center p-2 border border-cyan-400/20 shadow-inner">
                <img
                  src={heatmapUrl}
                  alt="Grad-CAM Overlay"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: "transform 0.2s ease-out",
                  }}
                  className="max-h-full max-w-full object-contain rounded-xl select-none"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Single Interactive Viewport */
          <div className="w-full flex items-center justify-center min-h-[340px] max-h-[500px] overflow-hidden">
            <img
              src={activeDisplayUrl}
              alt={altText}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: "transform 0.2s ease-out",
              }}
              className="max-h-[440px] max-w-full object-contain select-none rounded-2xl shadow-2xl"
            />
          </div>
        )}

        {/* Floating Controls Bar with Liquid Glass */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass liquid-glass-interactive text-white shadow-lg backdrop-blur-md">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 text-white/70 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/10"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 text-white/70 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/10"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3 bg-white/20" />
          <button
            onClick={handleRotateCcw}
            title="Rotate Left"
            className="p-1.5 text-white/70 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRotateCw}
            title="Rotate Right"
            className="p-1.5 text-white/70 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/10"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3 bg-white/20" />
          <button
            onClick={handleReset}
            title="Reset View"
            className="p-1.5 text-white/70 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/10"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
