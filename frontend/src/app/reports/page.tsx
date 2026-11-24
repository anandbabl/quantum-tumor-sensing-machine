"use client";

import React, { useState, useEffect } from "react";
import WorkspaceLayout from "@/components/workspace-layout";
import { apiRequest, getApiUrl } from "@/lib/api";
import { Report } from "@/types";
import {
  FileText,
  Download,
  ExternalLink,
  ShieldAlert,
  Search,
  Brain,
  CheckCircle2,
  Calendar,
  Sparkles
} from "lucide-react";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiRequest<Report[]>("/reports")
      .then((data) => setReports(data || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filteredReports = reports.filter(
    (r) =>
      r.report_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.predicted_class && r.predicted_class.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <WorkspaceLayout
      categoryLabel="Clinical Documents"
      title="Clinical PDF Report Archive"
      subtitle="Formal decision-support document archive with ReportLab neural telemetry, Grad-CAM overlays, and verified physician sign-off metadata."
      actionText="Analyze Scan"
      actionHref="/analyze"
    >
      <div className="space-y-8">
        {/* Search & Meta Bar */}
        <div className="p-4 sm:p-5 rounded-3xl liquid-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Report Code or Histology..."
              className="w-full pl-10 pr-4 py-2 rounded-full liquid-glass text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{reports.length} Reports Archived</span>
          </div>
        </div>

        {/* Reports Liquid Glass Container */}
        <div className="rounded-3xl liquid-glass overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/70">
              <thead className="liquid-glass text-white/90 text-[11px] font-mono uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-4 pl-6">Report Code</th>
                  <th className="p-4">Classification Finding</th>
                  <th className="p-4">Confidence</th>
                  <th className="p-4">Generated Timestamp</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-16 text-center text-xs text-white/50 font-light">
                      {isLoading ? "Loading reports..." : "No reports generated yet. Analyze an MRI scan to generate a report."}
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((r) => (
                    <tr key={r.id} className="hover:bg-white/[0.04] transition-colors group">
                      <td className="p-4 pl-6 font-mono text-white font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-300" />
                        <span>{r.report_code}</span>
                      </td>
                      <td className="p-4 font-normal text-white">
                        <span className="px-3 py-1 rounded-full liquid-glass text-[11px]">
                          {r.predicted_class || "Brain Tumor MRI"}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-emerald-400 font-medium">
                        {r.confidence ? `${r.confidence}%` : "N/A"}
                      </td>
                      <td className="p-4 text-[11px] text-white/50 font-mono">
                        {new Date(r.generated_at).toLocaleString()}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <a
                          href={getApiUrl(r.download_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full liquid-glass liquid-glass-interactive text-white hover:text-cyan-300 transition-all text-xs font-medium shadow"
                        >
                          <Download className="w-3.5 h-3.5 text-cyan-300" />
                          <span>Download PDF</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer box */}
        <div className="p-5 rounded-3xl liquid-glass flex items-center gap-3.5 text-xs text-white/70 shadow-lg">
          <ShieldAlert className="w-5 h-5 text-amber-300 shrink-0" />
          <p className="text-[11px] leading-relaxed">
            Every PDF report includes model telemetry, patient metadata, Grad-CAM explainability figures, and explicit medical limitations disclaimers required for institutional research and clinical decision support.
          </p>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
