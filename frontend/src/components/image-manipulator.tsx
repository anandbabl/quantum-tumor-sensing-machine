"use client";

import React, { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  RefreshCw,
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
      {/* View Mode Switcher Toolbar (Dala Minimalist Text Links) */}
      {hasPrediction && (heatmapUrl || pureHeatmapUrl) && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] uppercase tracking-[0.025em] pb-2 border-b border-[#181818]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode("overlay")}
              className={`transition-colors cursor-pointer ${
                viewMode === "overlay" ? "text-[#ffffff] font-semibold" : "text-[#9a9a9a] hover:text-[#ffffff]"
              }`}
            >
              Overlay Map
            </button>
            <button
              onClick={() => setViewMode("side_by_side")}
              className={`transition-colors cursor-pointer ${
                viewMode === "side_by_side" ? "text-[#ffffff] font-semibold" : "text-[#9a9a9a] hover:text-[#ffffff]"
              }`}
            >
              Side-by-Side
            </button>
            {pureHeatmapUrl && (
              <button
                onClick={() => setViewMode("pure_heatmap")}
                className={`transition-colors cursor-pointer ${
                  viewMode === "pure_heatmap" ? "text-[#ffb829] font-semibold" : "text-[#9a9a9a] hover:text-[#ffffff]"
                }`}
              >
                Pure Heatmap
              </button>
            )}
            <button
              onClick={() => setViewMode("original")}
              className={`transition-colors cursor-pointer ${
                viewMode === "original" ? "text-[#ffffff] font-semibold" : "text-[#9a9a9a] hover:text-[#ffffff]"
              }`}
            >
              Raw MRI
            </button>
          </div>

          <div className="text-[12px] text-[#ffb829] font-mono">
            {Math.round(zoom * 100)}% • {rotation}°
          </div>
        </div>
      )}

      {/* Main Viewport Container on Pure Black Void */}
      <div className="relative rounded-[24px] bg-[#000000] border border-[#222222] overflow-hidden min-h-[360px] flex items-center justify-center p-4">
        {viewMode === "side_by_side" && heatmapUrl ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {/* Left: Original Scan */}
            <div className="space-y-2 text-center">
              <span className="text-[11px] font-semibold text-[#9a9a9a] uppercase tracking-[0.025em] block">
                Original Slice
              </span>
              <div className="rounded-[16px] overflow-hidden bg-black aspect-square flex items-center justify-center border border-[#1a1a1a]">
                <img
                  src={originalUrl}
                  alt="Original MRI"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: "transform 0.2s ease-out",
                  }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>

            {/* Right: Grad-CAM Overlay */}
            <div className="space-y-2 text-center">
              <span className="text-[11px] font-semibold text-[#8052ff] uppercase tracking-[0.025em] block">
                Grad-CAM Activation
              </span>
              <div className="rounded-[16px] overflow-hidden bg-black aspect-square flex items-center justify-center border border-[#1a1a1a]">
                <img
                  src={heatmapUrl}
                  alt="Grad-CAM Activation Overlay"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: "transform 0.2s ease-out",
                  }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center max-h-[460px] overflow-hidden">
            <img
              src={activeDisplayUrl}
              alt={altText}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: "transform 0.2s ease-out",
              }}
              className="max-h-[440px] max-w-full object-contain select-none"
            />
          </div>
        )}

        {/* Floating Controls Bar on Void */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#000000] border border-[#333333] text-white">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 text-[#9a9a9a] hover:text-[#ffffff] transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 text-[#9a9a9a] hover:text-[#ffffff] transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3 bg-[#333333]" />
          <button
            onClick={handleRotateCcw}
            title="Rotate Left"
            className="p-1.5 text-[#9a9a9a] hover:text-[#ffffff] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRotateCw}
            title="Rotate Right"
            className="p-1.5 text-[#9a9a9a] hover:text-[#ffffff] transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3 bg-[#333333]" />
          <button
            onClick={handleReset}
            title="Reset"
            className="p-1.5 text-[#9a9a9a] hover:text-[#ffffff] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
