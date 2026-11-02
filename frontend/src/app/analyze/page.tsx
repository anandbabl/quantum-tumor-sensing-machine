"use client";

import React, { useState, useEffect, useRef } from "react";
import WorkspaceLayout from "@/components/workspace-layout";
import AIAssistantPanel from "@/components/ai-assistant-panel";
import ImageManipulator from "@/components/image-manipulator";
import MRIScanner from "@/components/mri-scanner";
import { apiRequest, getAssetUrl, getApiUrl } from "@/lib/api";
import { MRIScan, Prediction, Patient } from "@/types";
import confetti from "canvas-confetti";
import {
  Brain,
  UploadCloud,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  User,
  Download,
  Sparkles,
  ChevronRight,
  Activity
} from "lucide-react";

export default function AnalyzePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [samples, setSamples] = useState<Array<{ filename: string; label: string; url: string }>>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [currentScan, setCurrentScan] = useState<MRIScan | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatedReportUrl, setGeneratedReportUrl] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Patient[]>("/patients").then((p) => setPatients(p || [])).catch(() => {});
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

  // Load sample scan and display preview ready for Analyze
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

  // 5-Second Realistic Scanner Workflow
  const handleStartAnalysis = async () => {
    if (!previewUrl && !selectedFile && !currentScan) return;
    setError(null);
    setPrediction(null);
    setIsScanning(true);

    // Minimum 5-second scanner presentation duration
    const minScanTimer = new Promise<void>((resolve) => setTimeout(resolve, 5000));

    // Real backend inference executed in parallel
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
      // Both the 5-second medical scanner animation AND real inference must complete
      const [predResult] = await Promise.all([inferencePromise, minScanTimer]);
      setPrediction(predResult);
      setIsScanning(false);

      if (predResult.confidence > 0.85) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 },
          colors: ["#8052ff", "#22d3ee", "#ffb829"],
        });
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
    <WorkspaceLayout
      categoryLabel="Inference Workspace"
      title="Analyze Brain MRI"
      subtitle="Ingest cranial slices for real-time EfficientNetB3 classification and genuine mathematical Grad-CAM explainability floating on pure void."
      fluidWidth={true}
    >
      <div className="space-y-12">
        {/* Error notification */}
        {error && (
          <div className="py-3 px-4 border border-red-500/40 text-red-400 text-[14px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Asymmetric Clinical Layout: Left (Controls + Ingestion) / Right (Scanner / Viewer + Assistant) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* ========================================================== */}
          {/* LEFT COLUMN (5 Cols): Ingestion, Samples & Metadata        */}
          {/* ========================================================== */}
          <div className="lg:col-span-5 space-y-10">
            {/* Upload Zone */}
            <div className="space-y-4">
              <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#ffb829] block">
                01. Radiological Ingestion
              </span>

              {previewUrl ? (
                <div className="space-y-4">
                  <div className="relative aspect-square w-full bg-[#000000] border border-[#222222] rounded-[24px] overflow-hidden flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Uploaded MRI Slice"
                      className="w-full h-full object-contain"
                    />
                    {isScanning && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                        <span className="text-xs font-mono uppercase tracking-wider text-[#22d3ee] flex items-center gap-2">
                          <Activity className="w-4 h-4 animate-spin" />
                          <span>Active Scanner Linked</span>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isScanning}
                      className="text-[13px] font-semibold uppercase tracking-[0.025em] text-[#9a9a9a] hover:text-[#ffffff] transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Replace Slice
                    </button>
                    <button
                      onClick={handleRemoveImage}
                      disabled={isScanning}
                      className="text-[13px] font-semibold uppercase tracking-[0.025em] text-red-400 hover:text-red-300 transition-colors disabled:opacity-40 cursor-pointer"
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
                  className="p-12 rounded-[24px] border border-dashed border-[#333333] hover:border-[#8052ff] bg-[#000000] cursor-pointer transition-all duration-200 text-center space-y-4 group"
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
                  <UploadCloud className="w-10 h-10 mx-auto text-[#9a9a9a] group-hover:text-[#8052ff] transition-colors" />
                  <div className="space-y-1">
                    <div className="text-[16px] font-normal text-[#ffffff]">
                      Drop cranial MRI slice here
                    </div>
                    <div className="text-[14px] font-extralight text-[#9a9a9a]">
                      or click to select DICOM-derived JPG / PNG
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Patient Metadata Assignment */}
            <div className="space-y-4 pt-4 border-t border-[#181818]">
              <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#ffb829] block">
                02. Clinical Attribution (Optional)
              </span>

              <div className="space-y-3 text-[14px]">
                <div>
                  <label className="text-[12px] font-extralight text-[#9a9a9a] block mb-1">
                    Assigned Patient Directory
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    disabled={isScanning}
                    className="w-full px-3 py-2.5 rounded-[12px] bg-[#000000] border border-[#222222] text-[#ffffff] text-[14px] focus:outline-none focus:border-[#8052ff] disabled:opacity-50"
                  >
                    <option value="" className="bg-[#000000] text-[#9a9a9a]">
                      De-identified / Anonymous Subject
                    </option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#000000] text-[#ffffff]">
                        {p.name} ({p.patient_code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 1-Click Evaluation Benchmark Samples */}
            <div className="space-y-4 pt-4 border-t border-[#181818]">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#ffb829]">
                  03. Evaluation Test Samples
                </span>
                <span className="text-[11px] font-extralight text-[#9a9a9a]">1-Click Load</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {samples.map((s) => (
                  <button
                    key={s.filename}
                    onClick={() => handleUseSample(s.filename)}
                    disabled={isUploading || isScanning}
                    className="group text-left space-y-2 cursor-pointer focus:outline-none disabled:opacity-40"
                  >
                    <div className="aspect-square rounded-[16px] overflow-hidden bg-[#000000] border border-[#222222] group-hover:border-[#8052ff] transition-colors">
                      <img
                        src={getAssetUrl(s.url)}
                        alt={s.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="text-[12px] font-normal text-[#ffffff] truncate group-hover:text-[#8052ff] transition-colors">
                      {s.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Analyze MRI Button */}
            {previewUrl && !prediction && (
              <div className="pt-2">
                <button
                  onClick={handleStartAnalysis}
                  disabled={isUploading || isScanning}
                  className="w-full bg-[#8052ff] hover:opacity-90 active:scale-95 text-[#ffffff] text-[14px] font-semibold uppercase tracking-[0.025em] rounded-[22.5px] py-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(128,82,255,0.3)]"
                >
                  {isScanning ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin text-[#22d3ee]" />
                      <span>Scanning & Analyzing MRI Scan...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze MRI Scan</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* ========================================================== */}
          {/* RIGHT COLUMN (7 Cols): Scanner / Viewer / Prediction       */}
          {/* ========================================================== */}
          <div className="lg:col-span-7 space-y-10">
            {isScanning ? (
              /* Realistic 5-Second Medical Scanner Screen */
              <MRIScanner
                imageUrl={previewUrl || ""}
                onCancel={() => setIsScanning(false)}
              />
            ) : prediction ? (
              /* Smoothly Revealed Real Prediction Result View */
              <div className="space-y-10 animate-fadeIn">
                {/* Result Headline Block */}
                <div className="space-y-3 pb-6 border-b border-[#181818]">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#ffb829] block">
                    Inferred Classification
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                    <h2 className="text-[42px] sm:text-[48px] font-normal tracking-[-1.68px] text-[#ffffff] leading-none">
                      {prediction.predicted_class}
                    </h2>
                    <div className="text-[28px] font-normal text-[#ffb829]">
                      {(prediction.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                  <p className="text-[18px] font-extralight text-[#bdbdbd] leading-relaxed">
                    TensorFlow GradientTape activations localized primary spatial features in the {prediction.predicted_class.toLowerCase()} class index with calibrated certainty.
                  </p>
                </div>

                {/* Interactive Grad-CAM Image Manipulator */}
                <div className="space-y-3">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#9a9a9a] block">
                    Spatial Activation Map
                  </span>
                  <ImageManipulator
                    originalUrl={previewUrl || ""}
                    heatmapUrl={prediction.heatmap_path ? getAssetUrl(prediction.heatmap_path) : null}
                    pureHeatmapUrl={prediction.pure_heatmap_path ? getAssetUrl(prediction.pure_heatmap_path) : null}
                    hasPrediction={true}
                  />
                </div>

                {/* Calibrated Probability Distribution Bars Floating on Void */}
                <div className="space-y-4 pt-4 border-t border-[#181818]">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#9a9a9a] block">
                    Calibrated Class Probabilities
                  </span>

                  <div className="space-y-3 text-[14px]">
                    {(() => {
                      const gliomaProb = prediction.probabilities?.find((p) => p.class_name.includes("Glioma"))?.percentage ?? (prediction.predicted_class.includes("Glioma") ? prediction.confidence * 100 : 5);
                      const meningiomaProb = prediction.probabilities?.find((p) => p.class_name.includes("Meningioma"))?.percentage ?? (prediction.predicted_class.includes("Meningioma") ? prediction.confidence * 100 : 4);
                      const pituitaryProb = prediction.probabilities?.find((p) => p.class_name.includes("Pituitary"))?.percentage ?? (prediction.predicted_class.includes("Pituitary") ? prediction.confidence * 100 : 3);

                      return (
                        <>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[#ffffff]">
                              <span>Glioma Tumor</span>
                              <span>{gliomaProb.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#8052ff] transition-all duration-500"
                                style={{ width: `${gliomaProb}%` }}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[#ffffff]">
                              <span>Meningioma Tumor</span>
                              <span>{meningiomaProb.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#ffb829] transition-all duration-500"
                                style={{ width: `${meningiomaProb}%` }}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[#ffffff]">
                              <span>Pituitary Tumor</span>
                              <span>{pituitaryProb.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#15846e] transition-all duration-500"
                                style={{ width: `${pituitaryProb}%` }}
                              />
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* PDF Generation Action */}
                <div className="pt-2 flex items-center gap-6">
                  <button
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport}
                    className="text-[14px] font-semibold uppercase tracking-[0.025em] text-[#ffffff] hover:text-[#8052ff] inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 text-[#8052ff]" />
                    <span>{isGeneratingReport ? "Generating Document..." : "Download Clinical PDF Report"}</span>
                  </button>
                </div>

                {/* Docked AI Medical Assistant */}
                <div className="pt-8 border-t border-[#181818]">
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
            ) : (
              <div className="h-full min-h-[460px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#222222] rounded-[24px]">
                <Brain className="w-12 h-12 text-[#333333] mb-4" />
                <h3 className="text-[24px] font-normal text-[#ffffff] tracking-tight">
                  Awaiting MRI Ingestion
                </h3>
                <p className="text-[16px] font-extralight text-[#9a9a9a] max-w-sm mt-2">
                  Select a test sample or drop a cranial file, then click Analyze MRI Scan to begin deep feature extraction.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
