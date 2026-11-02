"use client";

import React, { useState, useEffect } from "react";
import WorkspaceLayout from "@/components/workspace-layout";
import { apiRequest } from "@/lib/api";
import { SystemHealth, User } from "@/types";
import {
  ShieldAlert,
  Cpu,
  Database,
  Users,
  HardDrive,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock
} from "lucide-react";

export default function AdminPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiRequest<SystemHealth>("/admin/system-health").catch(() => null),
      apiRequest<User[]>("/admin/users").catch(() => []),
      apiRequest<any[]>("/admin/audit-logs").catch(() => []),
    ])
      .then(([healthData, usersData, logsData]) => {
        setHealth(healthData);
        setUsers(usersData || []);
        setAuditLogs(logsData || []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <WorkspaceLayout
      title="Admin Control & System Infrastructure"
      subtitle="Hardware telemetry, model status, user access management, and HIPAA-aligned audit trails"
    >
      <div className="space-y-8">
        {/* System Health Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-[#0A0A0E] border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#9A9A9A]">
              <span>Deep Learning Engine</span>
              <Cpu className="w-4 h-4 text-[#8052FF]" />
            </div>
            <div className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#15846E] animate-pulse" />
              <span>{health?.model_loaded ? "Operational" : "Offline"}</span>
            </div>
            <div className="text-[11px] text-[#9A9A9A]">{health?.model_backbone || "EfficientNetB3"}</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0A0A0E] border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#9A9A9A]">
              <span>Groq LLM Status</span>
              <Activity className="w-4 h-4 text-[#FFB829]" />
            </div>
            <div className="text-sm font-bold text-white truncate">
              {health?.groq_api_status || "Initializing"}
            </div>
            <div className="text-[11px] text-[#9A9A9A]">Model: LLaMA 3.3 70B</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0A0A0E] border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#9A9A9A]">
              <span>Disk Storage Ingestion</span>
              <HardDrive className="w-4 h-4 text-[#15846E]" />
            </div>
            <div className="text-xl font-bold text-white">
              {health?.storage_used_mb ? `${health.storage_used_mb} MB` : "0.0 MB"}
            </div>
            <div className="text-[11px] text-[#9A9A9A]">Uploads, Heatmaps & PDFs</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0A0A0E] border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#9A9A9A]">
              <span>Registered Accounts</span>
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="text-xl font-bold text-white">{health?.total_users ?? 0}</div>
            <div className="text-[11px] text-[#9A9A9A]">{health?.total_scans ?? 0} total scans</div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="p-6 rounded-3xl bg-[#0A0A0E] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <h3 className="text-sm font-bold text-white">User Accounts & Roles</h3>
              <p className="text-[11px] text-[#9A9A9A]">RBAC permissions and account statuses</p>
            </div>
            <span className="text-xs text-[#9A9A9A]">{users.length} Active Accounts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#9A9A9A]">
              <thead className="bg-[#07070A] text-[#BDBDBD] text-[11px] uppercase tracking-wider border-b border-white/[0.08]">
                <tr>
                  <th className="p-3 pl-4">Full Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3 pr-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="p-3 pl-4 font-semibold text-white">{u.full_name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/5 border border-white/10 text-white">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-[#15846E] font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#15846E]" />
                        <span>Active</span>
                      </span>
                    </td>
                    <td className="p-3 pr-4 text-[11px] text-[#666666]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log Stream */}
        <div className="p-6 rounded-3xl bg-[#0A0A0E] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <h3 className="text-sm font-bold text-white">System Security Audit Log</h3>
              <p className="text-[11px] text-[#9A9A9A]">Immutable security trail of authentication, inferences, and report downloads</p>
            </div>
            <Clock className="w-4 h-4 text-[#8052FF]" />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {auditLogs.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#666666]">No audit events logged.</div>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] font-bold text-[#8052FF]">{log.action}</span>
                    <span className="text-[#9A9A9A]">{log.details || log.resource}</span>
                  </div>
                  <span className="text-[10px] text-[#666666] shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
