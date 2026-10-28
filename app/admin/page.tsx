"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquareQuote,
  Building2,
  Users,
  FileText,
  Image as ImageIcon,
  Clock,
  ArrowUpRight,
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Download,
} from "lucide-react";

interface DashboardData {
  metrics: {
    testimonials: { total: number; published: number; drafts: number };
    partners?: { total: number; published: number; drafts: number };
    teamMembers: { total: number; published: number; drafts: number };
    whitepapers: { total: number; published: number; drafts: number; totalDownloads: number };
    media: { total: number };
    totalDrafts: number;
  };
  system: {
    database: string;
    storageMode: string;
    s3Bucket: string;
    awsRegion: string;
  };
  recentActivity: Array<{
    id: string;
    adminEmail: string;
    action: string;
    targetType: string;
    targetId: string | null;
    details: string | null;
    createdAt: string;
  }>;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load statistics");
        return res.json();
      })
      .then((json) => {
        setData(json);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700">
        <h3 className="font-bold text-sm">Failed to load dashboard data</h3>
        <p className="text-xs mt-1">{error || "Please refresh or verify database connectivity."}</p>
      </div>
    );
  }

  const { metrics, system, recentActivity } = data;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#5933AA] to-[#7342D6] rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-[#5933AA]/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="currentColor">
            <path d="M40,-68.7C52.1,-63.9,62.2,-53.4,70.1,-41.2C78.1,-29,83.9,-14.5,82.8,-0.6C81.8,13.2,73.8,26.4,65,37.8C56.2,49.2,46.5,58.8,35,66.1C23.5,73.4,11.8,78.5,-0.7,79.7C-13.1,80.9,-26.3,78.3,-38.2,71.5C-50.1,64.7,-60.7,53.8,-68.8,41.2C-76.9,28.6,-82.5,14.3,-82.3,0.1C-82.1,-14.1,-76,-28.2,-67.2,-39.8C-58.4,-51.4,-46.9,-60.5,-34.5,-65.2C-22.1,-69.9,-11.1,-70.2,1.3,-72.5C13.7,-74.7,27.8,-73.5,40,-68.7Z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#E3D7FC]">
            PRIVITTY SOVEREIGN CMS
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight">
            Content Administration Center
          </h2>
          <p className="text-xs sm:text-sm text-[#EAE4F7] leading-relaxed">
            Manage published customer testimonials, public About page team members, cryptographic whitepaper PDF documents, and secure S3 media assets.
          </p>
        </div>

        {/* Quick action pill row */}
        <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap gap-2.5">
          <Link
            href="/admin/partners"
            className="px-3.5 py-2 rounded-xl bg-white text-[#5933AA] hover:bg-[#F8F5FF] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Manage Partners
          </Link>
          <Link
            href="/admin/testimonials?new=true"
            className="px-3.5 py-2 rounded-xl bg-white text-[#5933AA] hover:bg-[#F8F5FF] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> New Testimonial
          </Link>
          <Link
            href="/admin/team?new=true"
            className="px-3.5 py-2 rounded-xl bg-white text-[#5933AA] hover:bg-[#F8F5FF] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Team Member
          </Link>
          <Link
            href="/admin/whitepapers?new=true"
            className="px-3.5 py-2 rounded-xl bg-white text-[#5933AA] hover:bg-[#F8F5FF] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Upload Whitepaper
          </Link>
          <Link
            href="/admin/media"
            className="px-3.5 py-2 rounded-xl bg-white/15 text-white hover:bg-white/25 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <ImageIcon className="w-3.5 h-3.5" /> Media Library
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Partners Card */}
        <Link
          href="/admin/partners"
          className="bg-white rounded-2xl p-5 border border-[#DDD8E8] shadow-xs hover:border-[#6750A4] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7589]">
              Partners
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F4EFFB] text-[#5933AA] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#17151D] font-headline">
              {metrics.partners?.total ?? 0}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">
              {metrics.partners?.published ?? 0} in Marquee
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#7A7589] flex items-center justify-between border-t border-[#F0EBF8] pt-2">
            <span>{metrics.partners?.drafts ?? 0} in Draft</span>
            <span className="text-[#5933AA] font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              Manage &rarr;
            </span>
          </div>
        </Link>

        {/* Testimonials Card */}
        <Link
          href="/admin/testimonials"
          className="bg-white rounded-2xl p-5 border border-[#DDD8E8] shadow-xs hover:border-[#6750A4] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7589]">
              Testimonials
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F4EFFB] text-[#5933AA] flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquareQuote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#17151D] font-headline">
              {metrics.testimonials.total}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">
              {metrics.testimonials.published} Published
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#7A7589] flex items-center justify-between border-t border-[#F0EBF8] pt-2">
            <span>{metrics.testimonials.drafts} in Draft</span>
            <span className="text-[#5933AA] font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              Manage &rarr;
            </span>
          </div>
        </Link>

        {/* Team Members Card */}
        <Link
          href="/admin/team"
          className="bg-white rounded-2xl p-5 border border-[#DDD8E8] shadow-xs hover:border-[#6750A4] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7589]">
              Team Members
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F4EFFB] text-[#5933AA] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#17151D] font-headline">
              {metrics.teamMembers.total}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">
              {metrics.teamMembers.published} on About Page
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#7A7589] flex items-center justify-between border-t border-[#F0EBF8] pt-2">
            <span>{metrics.teamMembers.drafts} hidden</span>
            <span className="text-[#5933AA] font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              Reorder &rarr;
            </span>
          </div>
        </Link>

        {/* Whitepapers Card */}
        <Link
          href="/admin/whitepapers"
          className="bg-white rounded-2xl p-5 border border-[#DDD8E8] shadow-xs hover:border-[#6750A4] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7589]">
              Whitepapers
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F4EFFB] text-[#5933AA] flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#17151D] font-headline">
              {metrics.whitepapers.total}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">
              {metrics.whitepapers.published} Live
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#7A7589] flex items-center justify-between border-t border-[#F0EBF8] pt-2">
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3 text-[#5933AA]" />
              {metrics.whitepapers.totalDownloads} downloads
            </span>
            <span className="text-[#5933AA] font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              Upload PDF &rarr;
            </span>
          </div>
        </Link>

        {/* Media Assets Card */}
        <Link
          href="/admin/media"
          className="bg-white rounded-2xl p-5 border border-[#DDD8E8] shadow-xs hover:border-[#6750A4] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7589]">
              Media Library
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F4EFFB] text-[#5933AA] flex items-center justify-center group-hover:scale-105 transition-transform">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#17151D] font-headline">
              {metrics.media.total}
            </span>
            <span className="text-xs text-[#625F6B]">Managed Assets</span>
          </div>
          <div className="mt-2 text-[11px] text-[#7A7589] flex items-center justify-between border-t border-[#F0EBF8] pt-2">
            <span>S3 &amp; Local Storage</span>
            <span className="text-[#5933AA] font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              Browse &rarr;
            </span>
          </div>
        </Link>
      </div>

      {/* Two-Column Layout: System Status & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Activity Feed (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-[#DDD8E8] shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-[#5933AA]" />
              <h3 className="font-extrabold text-base text-[#17151D] font-headline">
                Recent CMS Activity &amp; Audit Trail
              </h3>
            </div>
            <span className="text-xs text-[#7A7589]">
              Real-time DB Events
            </span>
          </div>

          {recentActivity.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#7A7589]">
              No administrative activity recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-[#F0EBF8]">
              {recentActivity.map((log) => {
                let parsedDetails: Record<string, unknown> | null = null;
                try {
                  if (log.details) parsedDetails = JSON.parse(log.details);
                } catch {
                  // Ignore
                }

                return (
                  <div key={log.id} className="py-3.5 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#F4EFFB] text-[#5933AA] text-[10px] font-bold uppercase tracking-wider">
                          {log.action.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs font-bold text-[#17151D]">
                          {log.targetType}
                        </span>
                      </div>
                      <p className="text-xs text-[#625F6B]">
                        Performed by <span className="font-medium text-[#17151D]">{log.adminEmail}</span>
                        {parsedDetails && (
                          <span className="text-[11px] text-[#7A7589] block mt-0.5">
                            {JSON.stringify(parsedDetails).slice(0, 90)}
                          </span>
                        )}
                      </p>
                    </div>

                    <span className="text-[11px] text-[#9B97A6] shrink-0">
                      {new Date(log.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: AWS & System Status (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#DDD8E8] shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-[#17151D] uppercase tracking-wider">
              Deployment Architecture
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8FF] border border-[#E8E2F4]">
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-[#5933AA]" />
                  <span className="text-xs font-semibold text-[#17151D]">Relational DB</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{system.database}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8FF] border border-[#E8E2F4]">
                <div className="flex items-center gap-2.5">
                  <Cloud className="w-4 h-4 text-[#5933AA]" />
                  <span className="text-xs font-semibold text-[#17151D]">Object Storage</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#5933AA] font-bold">
                  <span>{system.storageMode}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8FF] border border-[#E8E2F4]">
                <span className="text-xs font-semibold text-[#17151D]">AWS Region</span>
                <span className="text-xs font-mono text-[#625F6B]">{system.awsRegion}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#DDD8E8]">
              <Link
                href="/admin/settings"
                className="w-full py-2.5 px-3 rounded-xl bg-[#F4EFFB] hover:bg-[#EAE4F7] text-[#5933AA] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View AWS &amp; EC2 Setup Guide</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Draft Notification Card */}
          {metrics.totalDrafts > 0 && (
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{metrics.totalDrafts} Unpublished Draft Items</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                You have content in draft status. Draft items are safe and hidden from the public website until you publish them.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
