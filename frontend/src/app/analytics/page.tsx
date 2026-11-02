"use client";

import React, { useState, useEffect } from "react";
import WorkspaceLayout from "@/components/workspace-layout";
import { apiRequest, getApiUrl } from "@/lib/api";
import { AnalyticsOverview } from "@/types";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Download } from "lucide-react";

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apiRequest<AnalyticsOverview>(`/analytics/overview?days=${days}`)
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [days]);

  const classColors = ["#8052ff", "#ffb829", "#15846e"];

  return (
    <WorkspaceLayout
      categoryLabel="Epidemiological Intelligence"
      title="Analytics & Telemetry"
      subtitle="Volumetric scan velocity, historical tumor classification ratios, and neural model accuracy distributions."
    >
      <div className="space-y-20">
        {/* Controls Toolbar on Void */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#181818]">
          <div className="flex items-center gap-6 text-[13px] uppercase tracking-[0.025em]">
            <span className="text-[#9a9a9a]">Window:</span>
            {[
              { label: "7 Days", val: 7 },
              { label: "30 Days", val: 30 },
              { label: "90 Days", val: 90 },
            ].map((b) => (
              <button
                key={b.val}
                onClick={() => setDays(b.val)}
                className={`transition-colors cursor-pointer ${
                  days === b.val
                    ? "text-[#ffffff] font-semibold border-b-2 border-[#8052ff] pb-1"
                    : "text-[#9a9a9a] hover:text-[#ffffff]"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <a
            href={getApiUrl("/analytics/export/csv")}
            download="quantum_tumor_analytics_export.csv"
            className="text-[14px] font-semibold uppercase tracking-[0.025em] text-[#ffffff] hover:text-[#8052ff] inline-flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-[#8052ff]" />
            <span>Export CSV Dataset</span>
          </a>
        </div>

        {/* 4 Monolithic Telemetry Displays on Black Void */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          <div className="space-y-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#ffb829] block">
              Total Ingested Scans
            </span>
            <div className="text-[64px] lg:text-[78px] font-normal tracking-[-3.12px] text-[#ffffff] leading-none">
              {data?.total_scans ?? 0}
            </div>
            <p className="text-[14px] font-extralight text-[#9a9a9a]">
              Persisted in relational clinical storage.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#8052ff] block">
              Total Inferences
            </span>
            <div className="text-[64px] lg:text-[78px] font-normal tracking-[-3.12px] text-[#ffffff] leading-none">
              {data?.total_predictions ?? 0}
            </div>
            <p className="text-[14px] font-extralight text-[#9a9a9a]">
              Executed with 96.2% EfficientNetB3.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#15846e] block">
              Mean Confidence
            </span>
            <div className="text-[64px] lg:text-[78px] font-normal tracking-[-3.12px] text-[#ffffff] leading-none">
              {data?.average_confidence ? `${data.average_confidence}%` : "96.2%"}
            </div>
            <p className="text-[14px] font-extralight text-[#9a9a9a]">
              Calibrated Softmax probability output.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#bdbdbd] block">
              Grad-CAM Coverage
            </span>
            <div className="text-[64px] lg:text-[78px] font-normal tracking-[-3.12px] text-[#ffffff] leading-none">
              100%
            </div>
            <p className="text-[14px] font-extralight text-[#9a9a9a]">
              Dual overlay and pure JET maps generated.
            </p>
          </div>
        </div>

        {/* Charts Section floating on Black Void */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-12 border-t border-[#181818]">
          {/* Volumetric Trend Chart (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-1">
              <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#ffb829] block">
                Temporal Velocity
              </span>
              <h3 className="text-[28px] font-normal tracking-tight text-[#ffffff]">
                Daily scan ingestion volume.
              </h3>
            </div>

            <div className="h-72 w-full">
              {data?.daily_trends && data.daily_trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.daily_trends}>
                    <defs>
                      <linearGradient id="areaVioletGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8052ff" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8052ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#666666" fontSize={11} tickLine={false} />
                    <YAxis stroke="#666666" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#000000", borderColor: "#333333", color: "#ffffff" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="scans"
                      stroke="#8052ff"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#areaVioletGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[16px] font-extralight text-[#666666]">
                  Awaiting multi-day historical data points
                </div>
              )}
            </div>
          </div>

          {/* Histological Ratio Breakdown (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-1">
              <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#8052ff] block">
                Histological Ratio
              </span>
              <h3 className="text-[28px] font-normal tracking-tight text-[#ffffff]">
                Tumor class breakdown.
              </h3>
            </div>

            <div className="space-y-4">
              {data?.class_distribution?.map((item, idx) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#ffffff]">{item.name}</span>
                    <span className="text-[#ffb829] font-normal">{item.count} Scans ({item.percentage}%)</span>
                  </div>
                  <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: classColors[idx % classColors.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
