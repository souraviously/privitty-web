"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Edit3,
  Search,
  ExternalLink,
  Eye,
  EyeOff,
  Building2,
  AlertTriangle,
} from "lucide-react";
import ImageUploadField from "@/app/admin/components/ImageUploadField";
import { resolveAssetUrl } from "@/app/lib/media";

interface Partner {
  id: string;
  companyName: string;
  logoUrl: string;
  websiteUrl: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PartnersApiResponse {
  partners: Partner[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function apiFetch<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...opts });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return (await res.json()) as T;
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    companyName: "",
    logoUrl: "",
    websiteUrl: "",
    displayOrder: 0,
    isPublished: true,
  });

  useEffect(() => {
    fetchPartners();
  }, [search, statusFilter]);

  async function fetchPartners() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const data = await apiFetch<PartnersApiResponse>(
        `/api/admin/partners?${params.toString()}`
      );
      setPartners(data.partners || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load partners");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({
      companyName: "",
      logoUrl: "",
      websiteUrl: "",
      displayOrder: partners.length + 1,
      isPublished: true,
    });
    setShowForm(true);
  }

  function openEdit(partner: Partner) {
    setEditing(partner);
    setForm({
      companyName: partner.companyName,
      logoUrl: partner.logoUrl,
      websiteUrl: partner.websiteUrl ?? "",
      displayOrder: partner.displayOrder,
      isPublished: partner.isPublished,
    });
    setShowForm(true);
  }

  async function togglePublish(partner: Partner) {
    try {
      const updated = await apiFetch<{ success: boolean; partner: Partner }>(
        `/api/admin/partners/${partner.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: partner.companyName,
            logoUrl: partner.logoUrl,
            websiteUrl: partner.websiteUrl,
            displayOrder: partner.displayOrder,
            isPublished: !partner.isPublished,
          }),
        }
      );
      setPartners((prev) =>
        prev.map((item) =>
          item.id === partner.id ? updated.partner : item
        )
      );
    } catch (e: unknown) {
      alert(
        "Status update failed: " +
          (e instanceof Error ? e.message : "Unknown error")
      );
    }
  }

  async function confirmDelete() {
    if (!deletingPartner) return;
    try {
      await apiFetch(`/api/admin/partners/${deletingPartner.id}`, {
        method: "DELETE",
      });
      setPartners((prev) => prev.filter((p) => p.id !== deletingPartner.id));
      setDeletingPartner(null);
    } catch (e: unknown) {
      alert("Delete failed: " + (e instanceof Error ? e.message : "Unknown error"));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.logoUrl) {
      alert("Please upload a partner logo before saving.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        companyName: form.companyName.trim(),
        logoUrl: form.logoUrl,
        websiteUrl: form.websiteUrl.trim() || null,
        displayOrder: Number(form.displayOrder) || 0,
        isPublished: form.isPublished,
      };

      if (editing) {
        const updated = await apiFetch<{ success: boolean; partner: Partner }>(
          `/api/admin/partners/${editing.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        setPartners((prev) =>
          prev.map((p) => (p.id === editing.id ? updated.partner : p))
        );
      } else {
        const created = await apiFetch<{ success: boolean; partner: Partner }>(
          "/api/admin/partners",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        setPartners((prev) => [...prev, created.partner]);
      }
      setShowForm(false);
    } catch (e: unknown) {
      alert("Save failed: " + (e instanceof Error ? e.message : "Validation error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-[#A588F5]" />
            <span>Partners &amp; Ecosystem</span>
          </h1>
          <p className="text-sm text-gray-400">
            Manage trusted partner logos displayed in the continuous marquee on the homepage.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6750A4] hover:bg-[#574092] text-white text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Partner</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-[#1D1829]/70 backdrop-blur-md p-3 rounded-2xl border border-white/10">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#120F1D] text-white text-xs rounded-xl pl-9 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-[#6750A4]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#120F1D] text-gray-300 text-xs rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:border-[#6750A4]"
        >
          <option value="all">All Partners</option>
          <option value="published">Published in Marquee</option>
          <option value="draft">Drafts Only</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Partners List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Loading partners from PostgreSQL...
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-[#1D1829]/50 rounded-2xl border border-white/10 p-12 text-center text-gray-400 text-sm space-y-3">
          <p>No partners found matching the current criteria.</p>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-xl bg-[#6750A4] text-white text-xs font-semibold hover:bg-[#574092] transition-colors"
          >
            Add Your First Partner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {partners.map((partner) => {
            const logoPreview = resolveAssetUrl(partner.logoUrl);
            return (
              <div
                key={partner.id}
                className="bg-[#1D1829]/90 border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all shadow-sm"
              >
                <div className="space-y-4">
                  {/* Card Header: Order and Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/5 font-mono">
                      Order: #{partner.displayOrder}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        partner.isPublished
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {partner.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  {/* Logo Display Area */}
                  <div className="relative h-20 w-full rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-3 overflow-hidden group">
                    <Image
                      src={logoPreview}
                      alt={partner.companyName}
                      width={180}
                      height={48}
                      className="max-h-12 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      unoptimized
                    />
                  </div>

                  {/* Company Info */}
                  <div>
                    <h3 className="text-sm font-bold text-white truncate">
                      {partner.companyName}
                    </h3>
                    {partner.websiteUrl ? (
                      <a
                        href={partner.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#B39DDB] hover:underline mt-1 truncate max-w-full"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{partner.websiteUrl}</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-gray-500 italic block mt-1">
                        No website linked
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => togglePublish(partner)}
                    className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {partner.isPublished ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                        <span>Unpublish</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Publish</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(partner)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                      title="Edit Partner"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingPartner(partner)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                      title="Delete Partner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form: Create / Edit Partner */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181424] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#A588F5]" />
                <span>{editing ? "Edit Partner" : "Add Partner Organization"}</span>
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 mb-1 font-medium">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.companyName}
                  onChange={(e) =>
                    setForm({ ...form, companyName: e.target.value })
                  }
                  className="w-full bg-[#100D1A] text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-[#6750A4] focus:outline-none"
                  placeholder="e.g. CoreIC Semiconductors"
                />
              </div>

              {/* Logo Upload Field */}
              <ImageUploadField
                label="Partner Logo * (SVG or PNG recommended)"
                value={form.logoUrl || null}
                onChange={(val) => setForm({ ...form, logoUrl: val || "" })}
                folder="partners"
                aspectRatio="wide"
                helperText="Upload transparent PNG, SVG, or WebP logo up to 5MB."
              />

              <div>
                <label className="block text-gray-300 mb-1 font-medium">
                  Website URL (Optional)
                </label>
                <input
                  type="url"
                  value={form.websiteUrl}
                  onChange={(e) =>
                    setForm({ ...form, websiteUrl: e.target.value })
                  }
                  className="w-full bg-[#100D1A] text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-[#6750A4] focus:outline-none"
                  placeholder="https://example.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        displayOrder: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full bg-[#100D1A] text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-[#6750A4] focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Lower numbers scroll first from right to left.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isPublishedPartner"
                    checked={form.isPublished}
                    onChange={(e) =>
                      setForm({ ...form, isPublished: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#6750A4] focus:ring-0 bg-[#100D1A] border-white/20"
                  />
                  <label
                    htmlFor="isPublishedPartner"
                    className="text-gray-300 font-medium cursor-pointer"
                  >
                    Publish to Homepage Marquee
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#6750A4] hover:bg-[#574092] text-white font-semibold transition-colors shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editing
                    ? "Save Changes"
                    : "Add Partner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Deletion */}
      {deletingPartner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181424] border border-rose-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Partner</h3>
                <p className="text-xs text-gray-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-white font-semibold">
                {deletingPartner.companyName}
              </strong>
              ? Its logo will immediately be removed from the public website marquee.
            </p>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeletingPartner(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-md cursor-pointer"
              >
                Delete Partner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
