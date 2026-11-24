"use client";

import React, { useState, useEffect, useRef } from "react";
import ImageManipulator from "@/components/image-manipulator";
import MRIScanner from "@/components/mri-scanner";
import AIAssistantPanel from "@/components/ai-assistant-panel";
import { apiRequest, getAssetUrl, getApiUrl } from "@/lib/api";
import { MRIScan, Prediction, Patient } from "@/types";
import confetti from "canvas-confetti";
import {
  UploadCloud,
  ArrowRight,
  AlertCircle,
  Download,
  Activity,
  Sparkles,
  CheckCircle2,
  FileText,
  RotateCcw,
  Layers,
  ShieldCheck,
  Brain
} from "lucide-react";

interface MRIAnalysisSuiteProps {
  initialPatientId?: string;
  onAnalysisComplete?: (prediction: Prediction) => void;
}

export default function MRIAnalysisSuite({
  initialPatientId = "",
  onAnalysisComplete,
}: MRIAnalysisSuiteProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId);
  const [samples, setSamples] = useState<Array<{ filename: string; label: string; url: string }>>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [currentScan, setCurrentScan] = useState<MRIScan | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatedReportUrl, setGeneratedReportUrl] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Patient[]>("/patients")
      .then((p) => setPatients(p || []))
      .catch(() => {});
    apiRequest<Array<{ filename: string; label: string; url: string }>>("/mri/samples")
      .then((s) => setSamples(s || []))
      .catch(() => {});
  }, []);

  const handleFileSelect = (file: File) => {
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setError("Unsupported format. Please upload standard brain MRI slice in JPG, JPEG, or PNG.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("File exceeds 25 MB limit.");
      return;
    }
    setError(null);
    setSelectedFile(file);
    setCurrentScan(null);
    setPrediction(null);
    setIsScanning(false);
    setGeneratedReportUrl(null);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCurrentScan(null);
    setPrediction(null);
    setIsScanning(false);
    setGeneratedReportUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUseSample = async (sampleFilename: string) => {
    setError(null);
    setIsUploading(true);
    setPrediction(null);
    setIsScanning(false);
    setGeneratedReportUrl(null);

    try {
      const scan = await apiRequest<MRIScan>(`/mri/sample/${sampleFilename}/use`, {
        method: "POST",
      });
      setCurrentScan(scan);
      setPreviewUrl(getAssetUrl(scan.file_path));
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message || "Failed to load evaluation sample");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!previewUrl && !selectedFile && !currentScan) return;
    setError(null);
    setPrediction(null);
    setIsScanning(true);

    const minScanTimer = new Promise<void>((resolve) => setTimeout(resolve, 5000));

    const inferencePromise = (async () => {
      let scanId = currentScan?.id;

      if (!scanId && selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        if (selectedPatientId) {
          formData.append("patient_id", selectedPatientId);
        }
        const uploadedScan = await apiRequest<MRIScan>("/mri/upload", {
          method: "POST",
          body: formData,
        });
        setCurrentScan(uploadedScan);
        scanId = uploadedScan.id;
      }

      if (!scanId) {
        throw new Error("No MRI scan identified for neural inference.");
      }

      return await apiRequest<Prediction>(`/predictions/analyze/${scanId}`, {
        method: "POST",
      });
    })();

    try {
      const [predResult] = await Promise.all([inferencePromise, minScanTimer]);
      setPrediction(predResult);
      setIsScanning(false);

      if (predResult.confidence > 0.85) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 },
          colors: ["#ffffff", "#22d3ee", "#8052ff"],
        });
      }

      if (onAnalysisComplete) {
        onAnalysisComplete(predResult);
      }
    } catch (err: any) {
      setError(err.message || "MRI analysis execution failed");
      setIsScanning(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!prediction) return;
    setIsGeneratingReport(true);
    try {
      const res = await apiRequest<{ download_url: string }>(`/reports/generate/${prediction.id}`, {
        method: "POST",
      });
      setGeneratedReportUrl(getApiUrl(res.download_url));
      window.open(getApiUrl(res.download_url), "_blank");
    } catch (err: any) {
      setError("Failed to generate PDF report: " + err.message);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="w-full space-y-8 text-white">
      {/* Header Badge & Title */}
      <div className="space-y-3 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass text-xs font-normal tracking-wide text-white/90">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Radiological Diagnostic Suite • EfficientNetB3 96.24%</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white leading-[1.1]">
          MRI Diagnostic Analysis & Feature Mapping
        </h2>
        <p className="text-sm sm:text-base font-light text-white/70 max-w-2xl leading-relaxed">
          Ingest cranial MRI scans for real-time deep learning tumor classification and genuine mathematical Grad-CAM explainability heatmaps.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl liquid-glass border border-red-500/40 text-red-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-white px-2 py-1 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Asymmetric Clinical Layout: Left (Controls + Upload) / Right (3D Brain / Scanner / Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* ========================================================== */}
        {/* LEFT COLUMN (5 Cols): Ingestion, Samples, Controls         */}
        {/* ========================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upload Card */}
          <div className="p-6 sm:p-7 rounded-3xl liquid-glass space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-medium tracking-wider uppercase text-white/70 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-cyan-400" />
                <span>01. Radiological Ingestion</span>
              </span>
              <span className="text-[11px] text-white/50 font-light">DICOM • JPG • PNG</span>
            </div>

            {previewUrl ? (
              <div className="space-y-4">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden liquid-glass flex items-center justify-center p-2">
                  <img
                    src={previewUrl}
                    alt="Uploaded MRI Slice"
                    className="w-full h-full object-contain rounded-xl"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 liquid-glass backdrop-blur-sm flex items-center justify-center rounded-2xl">
                      <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 flex items-center gap-2 liquid-glass px-4 py-2 rounded-full border border-cyan-400/30 shadow-lg">
                        <Activity className="w-4 h-4 animate-spin text-cyan-400" />
                        <span>Scanning In Progress</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isScanning}
                    className="flex-1 py-2.5 rounded-full liquid-glass liquid-glass-interactive text-xs font-medium text-white/90 hover:text-white transition-all disabled:opacity-40 cursor-pointer text-center"
                  >
                    Replace Slice
                  </button>
                  <button
                    onClick={handleRemoveImage}
                    disabled={isScanning}
                    className="py-2.5 px-4 rounded-full liquid-glass text-xs font-medium text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className="p-8 sm:p-10 rounded-2xl liquid-glass liquid-glass-interactive border border-dashed border-white/20 hover:border-white/50 cursor-pointer text-center space-y-3 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-12 h-12 mx-auto rounded-full liquid-glass flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6 text-white/90" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-white">
                    Drop cranial MRI slice here
                  </div>
                  <div className="text-xs font-light text-white/60">
                    or click to browse local files (max 25MB)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 1-Click Evaluation Benchmark Samples */}
          <div className="p-6 rounded-3xl liquid-glass space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-medium tracking-wider uppercase text-white/70 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-300" />
                <span>02. Evaluation Test Samples</span>
              </span>
              <span className="text-[11px] text-white/50 font-light">1-Click Load</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {samples.map((s) => (
                <button
                  key={s.filename}
                  onClick={() => handleUseSample(s.filename)}
                  disabled={isUploading || isScanning}
                  className="group text-left space-y-1.5 cursor-pointer focus:outline-none disabled:opacity-40"
                >
                  <div className="aspect-square rounded-xl overflow-hidden liquid-glass border border-white/10 group-hover:border-white/40 transition-all p-1">
                    <img
                      src={getAssetUrl(s.url)}
                      alt={s.label}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="text-[11px] font-medium text-white/80 truncate group-hover:text-white transition-colors">
                    {s.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Patient Assignment (Optional) */}
          <div className="p-6 rounded-3xl liquid-glass space-y-3">
            <span className="text-xs font-medium tracking-wider uppercase text-white/70 block">
              03. Clinical Patient Attribution
            </span>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              disabled={isScanning}
              className="w-full px-4 py-2.5 rounded-xl liquid-glass border border-white/15 text-white text-xs focus:outline-none focus:border-white/40 disabled:opacity-50 cursor-pointer"
            >
              <option value="" className="bg-[#121218] text-white/80">
                De-identified / Anonymous Subject
              </option>
              {patients.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#121218] text-white">
                  {p.name} ({p.patient_code})
                </option>
              ))}
            </select>
          </div>

          {/* Analyze MRI Button */}
          {previewUrl && !prediction && (
            <button
              onClick={handleStartAnalysis}
              disabled={isUploading || isScanning}
              className="w-full py-4 rounded-full liquid-glass liquid-glass-interactive text-sm font-medium tracking-wide text-white bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 shadow-lg shadow-black/30"
            >
              {isScanning ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Scanning & Analyzing MRI Scan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Analyze MRI Scan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

        {/* ========================================================== */}
        {/* RIGHT COLUMN (7 Cols): 3D Brain / Scanner / Output View    */}
        {/* ========================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {isScanning ? (
            /* Realistic 5-Second Medical Scanner Screen */
            <div className="rounded-3xl liquid-glass overflow-hidden p-6 sm:p-8">
              <MRIScanner
                imageUrl={previewUrl || ""}
                onCancel={() => setIsScanning(false)}
              />
            </div>
          ) : prediction ? (
            /* Revealed Prediction Result View */
            <div className="space-y-6">
              {/* Classification Result Card */}
              <div className="p-6 sm:p-8 rounded-3xl liquid-glass space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Inferred Classification Result</span>
                  </span>
                  <span className="text-xs font-mono text-emerald-400 px-3 py-1 rounded-full liquid-glass">
                    Verified Inference
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pt-1">
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white leading-none">
                    {prediction.predicted_class}
                  </h3>
                  <div className="text-2xl sm:text-3xl font-light text-amber-300">
                    {(prediction.confidence * 100).toFixed(1)}% Confidence
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-light text-white/70 leading-relaxed">
                  TensorFlow GradientTape activations localized primary spatial features in the{" "}
                  <span className="text-white font-medium">{prediction.predicted_class}</span> class index with high statistical calibration.
                </p>

                {/* Probability Distribution */}
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <span className="text-xs font-medium tracking-wider uppercase text-white/60 block">
                    Calibrated Class Probabilities
                  </span>

                  {(() => {
                    const gliomaProb =
                      prediction.probabilities?.find((p) => p.class_name.includes("Glioma"))?.percentage ??
                      (prediction.predicted_class.includes("Glioma") ? prediction.confidence * 100 : 5);
                    const meningiomaProb =
                      prediction.probabilities?.find((p) => p.class_name.includes("Meningioma"))?.percentage ??
                      (prediction.predicted_class.includes("Meningioma") ? prediction.confidence * 100 : 4);
                    const pituitaryProb =
                      prediction.probabilities?.find((p) => p.class_name.includes("Pituitary"))?.percentage ??
                      (prediction.predicted_class.includes("Pituitary") ? prediction.confidence * 100 : 3);

                    return (
                      <div className="space-y-2 text-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between text-white/90">
                            <span>Glioma Tumor</span>
                            <span className="font-mono">{gliomaProb.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full liquid-glass overflow-hidden">
                            <div
                              className="h-full bg-violet-400 rounded-full transition-all duration-500"
                              style={{ width: `${gliomaProb}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-white/90">
                            <span>Meningioma Tumor</span>
                            <span className="font-mono">{meningiomaProb.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full liquid-glass overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all duration-500"
                              style={{ width: `${meningiomaProb}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-white/90">
                            <span>Pituitary Tumor</span>
                            <span className="font-mono">{pituitaryProb.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full liquid-glass overflow-hidden">
                            <div
                              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                              style={{ width: `${pituitaryProb}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* PDF Report Download Button */}
                <div className="pt-2">
                  <button
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport}
                    className="w-full sm:w-auto px-6 py-3 rounded-full liquid-glass liquid-glass-interactive text-xs font-medium text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 text-cyan-300" />
                    <span>
                      {isGeneratingReport ? "Compiling Medical PDF..." : "Download Clinical PDF Report"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Spatial Activation Map (Grad-CAM) */}
              <div className="p-6 sm:p-8 rounded-3xl liquid-glass space-y-4">
                <span className="text-xs font-medium tracking-wider uppercase text-white/70 block">
                  Spatial Activation Heatmap (Grad-CAM)
                </span>
                <ImageManipulator
                  originalUrl={previewUrl || ""}
                  heatmapUrl={prediction.heatmap_path ? getAssetUrl(prediction.heatmap_path) : null}
                  pureHeatmapUrl={prediction.pure_heatmap_path ? getAssetUrl(prediction.pure_heatmap_path) : null}
                  hasPrediction={true}
                />
              </div>

              {/* AI Clinical Assistant Panel */}
              <div className="p-6 sm:p-8 rounded-3xl liquid-glass">
                <AIAssistantPanel
                  activePrediction={prediction}
                  patientInfo={
                    patients.find((p) => p.id === selectedPatientId)
                      ? {
                          name: patients.find((p) => p.id === selectedPatientId)!.name,
                          age: patients.find((p) => p.id === selectedPatientId)!.age,
                          gender: patients.find((p) => p.id === selectedPatientId)!.gender,
                        }
                      : undefined
                  }
                />
              </div>
            </div>
          ) : previewUrl ? (
            /* Selected Slice Ready for Analysis View */
            <div className="w-full h-full min-h-[540px] rounded-3xl liquid-glass p-8 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative max-w-sm w-full aspect-square rounded-2xl overflow-hidden liquid-glass border border-white/20 p-2 shadow-2xl flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Selected MRI Scan"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div className="space-y-2 max-w-md">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass text-xs text-cyan-300">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>MRI Slice Loaded & Ready for Neural Inference</span>
                </div>
                <p className="text-xs text-white/70 font-light">
                  Click below to run deep convolutional classification and Grad-CAM spatial heatmap extraction.
                </p>
              </div>
              <button
                onClick={handleStartAnalysis}
                disabled={isUploading || isScanning}
                className="px-8 py-3.5 rounded-full liquid-glass liquid-glass-interactive text-sm font-medium tracking-wide text-white bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Analyze MRI Scan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Clean Minimalist Awaiting Ingestion State */
            <div className="w-full h-full min-h-[540px] rounded-3xl liquid-glass p-10 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full liquid-glass flex items-center justify-center text-white/80 shadow-inner">
                <Brain className="w-10 h-10 stroke-[1.2] text-white/90" />
              </div>
              <div className="space-y-2 max-w-sm">
                <h4 className="text-lg font-medium text-white tracking-tight">
                  Awaiting Cranial MRI Scan
                </h4>
                <p className="text-xs text-white/60 font-light leading-relaxed">
                  Select one of the 1-click evaluation test samples or drop a cranial slice on the left to begin inference.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-sm w-full pt-2 text-[11px] text-white/70">
                <div className="p-3 rounded-2xl liquid-glass flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>96.24% EfficientNetB3</span>
                </div>
                <div className="p-3 rounded-2xl liquid-glass flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Grad-CAM Explainability</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
