"use client";

import React, { useState, useEffect } from "react";
import WorkspaceLayout from "@/components/workspace-layout";
import { apiRequest } from "@/lib/api";
import { PerformanceResponse } from "@/types";

export default function PerformancePage() {
  const [data, setData] = useState<PerformanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCircuit, setSelectedCircuit] = useState<number>(0);

  useEffect(() => {
    apiRequest<PerformanceResponse>("/performance/metrics")
      .then((res) => setData(res))
      .catch((err) => console.error("Performance metrics fetch error:", err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !data) {
    return (
      <WorkspaceLayout
        categoryLabel="Mathematical Benchmarking"
        title="Model Performance"
        subtitle="Evaluating classical deep CNN telemetry alongside quantum computing circuit paradigms."
      >
        <div className="py-24 text-center text-[18px] font-extralight text-[#9a9a9a]">
          Loading model benchmark metrics and Hilbert space telemetry...
        </div>
      </WorkspaceLayout>
    );
  }

  const { model_telemetry, evaluation_benchmark, quantum_research } = data;
  const activeCircuit = quantum_research.circuits[selectedCircuit] || quantum_research.circuits[0];

  return (
    <WorkspaceLayout
      categoryLabel="Neural & Quantum Telemetry"
      title="Performance Architecture"
      subtitle="Comprehensive architectural inspector for the production EfficientNetB3 classifier and Quantum Machine Learning (QML) research."
    >
      <div className="space-y-24">
        {/* ============================================================== */}
        {/* SECTION 1: MONUMENTAL BENCHMARK TELEMETRY                      */}
        {/* ============================================================== */}
        <div className="space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#ffb829] block">
              Verified Weights
            </span>
            <h2 className="text-[38px] sm:text-[48px] font-normal tracking-[-1.68px] text-[#ffffff] leading-[1.15]">
              {model_telemetry.model_name}
            </h2>
            <p className="text-[18px] font-extralight text-[#bdbdbd] leading-relaxed">
              Trained functional model with 385 sublayers executing transfer-learned feature extraction on 300×300×3 cranial MRI slices.
            </p>
          </div>

          {/* 4 Large Typographic Telemetry Figures on Void */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 pt-4">
            <div className="space-y-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#ffb829] block">
                Benchmark Accuracy
              </span>
              <div className="text-[64px] lg:text-[78px] font-normal tracking-[-3.12px] text-[#ffffff] leading-none">
                {(model_telemetry.benchmark_accuracy * 100).toFixed(2)}%
              </div>
              <p className="text-[14px] font-extralight text-[#9a9a9a]">
                Verified on held-out test distribution.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#8052ff] block">
                Total Sublayers
              </span>
              <div className="text-[64px] lg:text-[78px] font-normal tracking-[-3.12px] text-[#ffffff] leading-none">
                {model_telemetry.layers_architecture?.length || 385}
              </div>
              <p className="text-[14px] font-extralight text-[#9a9a9a]">
                EfficientNetB3 backbone depth.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#15846e] block">
                Input Dimensions
              </span>
              <div className="text-[64px] lg:text-[78px] font-normal tracking-[-3.12px] text-[#ffffff] leading-none">
                300px
              </div>
              <p className="text-[14px] font-extralight text-[#9a9a9a]">
                (300, 300, 3) normalized RGB float32.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#bdbdbd] block">
                Forward Pass
              </span>
              <div className="text-[64px] lg:text-[78px] font-normal tracking-[-3.12px] text-[#ffffff] leading-none">
                35ms
              </div>
              <p className="text-[14px] font-extralight text-[#9a9a9a]">
                Average hardware inference latency.
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 2: HISTOLOGICAL METRIC TABLE (FLOATING ROWS)           */}
        {/* ============================================================== */}
        <div className="space-y-8 pt-16 border-t border-[#181818]">
          <div className="space-y-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#ffb829] block">
              Validation Distribution
            </span>
            <h3 className="text-[32px] font-normal tracking-tight text-[#ffffff]">
              Class-wise precision metrics.
            </h3>
          </div>

          <div className="divide-y divide-[#181818]">
            {evaluation_benchmark.classification_report?.map((m) => (
              <div
                key={m.class_name}
                className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-1">
                  <div className="text-[20px] font-normal text-[#ffffff]">
                    {m.class_name}
                  </div>
                  <span className="text-[13px] font-extralight text-[#9a9a9a]">
                    Sample Support: {m.support} verified scans
                  </span>
                </div>

                <div className="flex items-center gap-8 text-[14px]">
                  <div>
                    <span className="text-[11px] text-[#9a9a9a] uppercase block">Precision</span>
                    <span className="text-[#ffffff] font-normal">{(m.precision * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#9a9a9a] uppercase block">Recall</span>
                    <span className="text-[#ffffff] font-normal">{(m.recall * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#9a9a9a] uppercase block">F1-Score</span>
                    <span className="text-[#ffb829] font-normal">{(m.f1_score * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 3: QUANTUM MACHINE LEARNING RESEARCH                   */}
        {/* ============================================================== */}
        <div className="space-y-12 pt-16 border-t border-[#181818]">
          <div className="max-w-2xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#ffb829] block">
              Quantum Computing Research
            </span>
            <h3 className="text-[38px] font-normal tracking-[-1.68px] text-[#ffffff] leading-tight">
              Hilbert space classification topologies.
            </h3>
            <p className="text-[18px] font-extralight text-[#bdbdbd] leading-relaxed">
              Exploratory variational quantum circuits mapping complex border-zone histology into 16, 256, and 65,536-dimensional Hilbert spaces.
            </p>
          </div>

          {/* Circuit Selection Text Tabs */}
          <div className="flex items-center gap-8 text-[13px] uppercase tracking-[0.025em] pb-4 border-b border-[#181818]">
            {quantum_research.circuits.map((c, idx) => (
              <button
                key={c.name}
                onClick={() => setSelectedCircuit(idx)}
                className={`transition-colors cursor-pointer ${
                  selectedCircuit === idx
                    ? "text-[#ffffff] font-semibold border-b-2 border-[#8052ff] pb-2"
                    : "text-[#9a9a9a] hover:text-[#ffffff]"
                }`}
              >
                {c.name} ({c.qubits} Qubits)
              </button>
            ))}
          </div>

          {/* Active Circuit Floating Inspection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#8052ff] block">
                Topological Specification
              </span>
              <div className="text-[28px] font-normal text-[#ffffff]">
                {activeCircuit.name}
              </div>
              <div className="pt-2 text-[14px] text-[#9a9a9a] space-y-1">
                <div>Encoding Technique: <b className="text-white">{activeCircuit.encoding_technique}</b></div>
                <div>Entanglement Topology: <b className="text-white">{activeCircuit.entanglement_topology}</b></div>
                <div>Measurement Basis: <b className="text-white">{activeCircuit.measurement_basis}</b></div>
                <div>Classical Reduction: <b className="text-white">{activeCircuit.classical_reduction}</b></div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#15846e] block">
                  State Space Dimension
                </span>
                <div className="text-[54px] lg:text-[64px] font-normal text-[#ffffff] leading-none">
                  {activeCircuit.hilbert_dimension?.toLocaleString()} D
                </div>
                <p className="text-[14px] font-extralight text-[#9a9a9a]">
                  2^{activeCircuit.qubits} complex state vectors in quantum superposition.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-[#181818]">
                <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#ffb829] block">
                  Simulated QML Accuracy
                </span>
                <div className="text-[36px] font-normal text-[#ffb829]">
                  {(activeCircuit.benchmark_metrics?.simulated_accuracy * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
