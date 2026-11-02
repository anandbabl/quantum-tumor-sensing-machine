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
  CheckCircle2
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
      title="Clinical PDF Report Archive"
      subtitle="Formal decision-support document archive with ReportLab neural telemetry and Grad-CAM overlays"
      actionText="Analyze Scan"
      actionHref="/analyze"
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="p-4 rounded-2xl bg-[#0A0A0E] border border-white/[0.08] flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#9A9A9A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Report Code or Tumor..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder:text-[#666666] focus:outline-none focus:border-[#8052FF]"
            />
          </div>
          <span className="text-xs text-[#9A9A9A]">{reports.length} Reports Archived</span>
        </div>

        {/* Reports Table */}
        <div className="rounded-3xl bg-[#0A0A0E] border border-white/[0.08] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#9A9A9A]">
              <thead className="bg-[#07070A] text-[#BDBDBD] text-[11px] uppercase tracking-wider border-b border-white/[0.08]">
                <tr>
                  <th className="p-4 pl-6">Report Code</th>
                  <th className="p-4">Classification Finding</th>
                  <th className="p-4">Confidence</th>
                  <th className="p-4">Generated Timestamp</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-xs text-[#666666]">
                      {isLoading ? "Loading reports..." : "No reports generated yet. Analyze an MRI scan to generate a report."}
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((r) => (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 pl-6 font-mono text-white font-bold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#8052FF]" />
                        <span>{r.report_code}</span>
                      </td>
                      <td className="p-4 font-semibold text-white">
                        {r.predicted_class || "Brain Tumor MRI"}
                      </td>
                      <td className="p-4 text-[#15846E] font-bold">
                        {r.confidence ? `${r.confidence}%` : "N/A"}
                      </td>
                      <td className="p-4 text-[11px] text-[#666666]">
                        {new Date(r.generated_at).toLocaleString()}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <a
                          href={getApiUrl(r.download_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-[#8052FF] text-white transition-all text-xs font-medium border border-white/[0.08]"
                        >
                          <Download className="w-3.5 h-3.5" />
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
        <div className="p-4 rounded-2xl bg-[#0A0A0E] border border-white/[0.06] flex items-center gap-3 text-xs text-[#9A9A9A]">
          <ShieldAlert className="w-4 h-4 text-[#FFB829] shrink-0" />
          <p className="text-[11px]">
            Every PDF report includes model telemetry, patient metadata, Grad-CAM explainability figures, and explicit medical limitations disclaimers required for institutional research and clinical decision support.
          </p>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
