"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Edit3, Search, Star, ExternalLink, Eye, EyeOff } from "lucide-react";
import ImageUploadField from "@/app/admin/components/ImageUploadField";
import { resolveAssetUrl } from "@/app/lib/media";

interface Testimonial {
  id: string;
  authorName: string;
  jobTitle: string;
  companyName: string;
  quote: string;
  rating: number;
  authorPortrait: string | null;
  companyLogo: string | null;
  displayOrder: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
}

interface TestimonialsApiResponse {
  testimonials: Testimonial[];
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
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return (await res.json()) as T;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);

  // Form state matching schema
  const [form, setForm] = useState({
    authorName: "",
    jobTitle: "",
    companyName: "",
    quote: "",
    rating: 5,
    authorPortrait: "",
    companyLogo: "",
    displayOrder: 0,
    isPublished: true,
    isFeatured: false,
  });

  useEffect(() => {
    fetchTestimonials();
  }, [search, statusFilter]);

  async function fetchTestimonials() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const data = await apiFetch<TestimonialsApiResponse>(
        `/api/admin/testimonials?${params.toString()}`
      );
      setTestimonials(data.testimonials || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({
      authorName: "",
      jobTitle: "",
      companyName: "",
      quote: "",
      rating: 5,
      authorPortrait: "",
      companyLogo: "",
      displayOrder: testimonials.length,
      isPublished: true,
      isFeatured: false,
    });
    setShowForm(true);
  }

  function openEdit(item: Testimonial) {
    setEditing(item);
    setForm({
      authorName: item.authorName,
      jobTitle: item.jobTitle,
      companyName: item.companyName,
      quote: item.quote,
      rating: item.rating,
      authorPortrait: item.authorPortrait ?? "",
      companyLogo: item.companyLogo ?? "",
      displayOrder: item.displayOrder,
      isPublished: item.isPublished,
      isFeatured: item.isFeatured,
    });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await apiFetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch (e: unknown) {
      alert("Delete failed: " + (e instanceof Error ? e.message : "Unknown error"));
    }
  }

  async function togglePublish(t: Testimonial) {
    try {
      const updated = await apiFetch<Testimonial>(`/api/admin/testimonials/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !t.isPublished }),
      });
      setTestimonials((prev) =>
        prev.map((item) => (item.id === t.id ? { ...item, isPublished: updated.isPublished } : item))
      );
    } catch (e: unknown) {
      alert("Status toggle failed: " + (e instanceof Error ? e.message : "Unknown error"));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        const updated = await apiFetch<Testimonial>(`/api/admin/testimonials/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setTestimonials((prev) =>
          prev.map((item) => (item.id === editing.id ? updated : item))
        );
      } else {
        const created = await apiFetch<Testimonial>("/api/admin/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setTestimonials((prev) => [...prev, created]);
      }
      setShowForm(false);
    } catch (e: unknown) {
      alert("Save failed: " + (e instanceof Error ? e.message : "Validation error"));
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Testimonials Management</h1>
          <p className="text-sm text-gray-400">
            Manage partner endorsements, quotes, client ratings, and homepage featured reviews.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6750A4] hover:bg-[#574092] text-white text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-[#1D1829]/70 backdrop-blur-md p-3 rounded-2xl border border-white/10">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search author, company, quote..."
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
          <option value="all">All Status</option>
          <option value="published">Published Only</option>
          <option value="draft">Drafts Only</option>
        </select>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Loading & Testimonial List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          Loading testimonials from PostgreSQL...
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-[#1D1829]/50 rounded-2xl border border-white/10 p-12 text-center text-gray-400 text-sm">
          No testimonials found. Click &quot;Add Testimonial&quot; to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className={`bg-[#1D1829]/90 border rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all ${
                t.isFeatured
                  ? "border-[#6750A4] shadow-[0_0_20px_rgba(103,80,164,0.15)]"
                  : "border-white/10"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {t.isFeatured && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#6750A4]/30 text-[#D8CEF6] border border-[#6750A4]/40">
                        Featured
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        t.isPublished
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {t.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed italic line-clamp-3">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  {t.authorPortrait ? (
                    <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/10">
                      <Image
                        src={resolveAssetUrl(t.authorPortrait)}
                        alt={t.authorName || "Author portrait"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#6750A4] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {(t.authorName || "P").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {t.authorName || "Unnamed Author"}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate">
                      {t.jobTitle || "Partner"} • {t.companyName || "Organization"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => togglePublish(t)}
                  className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {t.isPublished ? (
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
                    onClick={() => openEdit(t)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181424] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editing ? "Edit Testimonial" : "Create New Testimonial"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={form.authorName}
                    onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                    className="w-full bg-[#100D1A] text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-[#6750A4] focus:outline-none"
                    placeholder="e.g. Milind Deore"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={form.jobTitle}
                    onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                    className="w-full bg-[#100D1A] text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-[#6750A4] focus:outline-none"
                    placeholder="e.g. Chief Technology Officer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="w-full bg-[#100D1A] text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-[#6750A4] focus:outline-none"
                    placeholder="e.g. Industrial Automation Corp"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Rating (1 - 5)</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value, 10) })}
                    className="w-full bg-[#100D1A] text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-[#6750A4] focus:outline-none"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                    <option value={2}>⭐⭐ (2 Stars)</option>
                    <option value={1}>⭐ (1 Star)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">Quote * (Min. 10 characters)</label>
                <textarea
                  required
                  rows={4}
                  value={form.quote}
                  onChange={(e) => setForm({ ...form, quote: e.target.value })}
                  className="w-full bg-[#100D1A] text-white rounded-xl p-3.5 border border-white/10 focus:border-[#6750A4] focus:outline-none leading-relaxed"
                  placeholder="Enter endorsement or partner review..."
                />
              </div>

              <ImageUploadField
                label="Author Profile Picture (Optional)"
                value={form.authorPortrait || null}
                onChange={(val) => setForm({ ...form, authorPortrait: val || "" })}
                folder="testimonials"
                aspectRatio="square"
                helperText="Upload PNG, JPG, or WebP up to 5MB. Clean circular avatar shown on public testimonials."
              />


              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Display Order</label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#100D1A] text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-[#6750A4] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-[#6750A4] focus:ring-0 bg-[#100D1A] border-white/20"
                  />
                  <label htmlFor="isPublished" className="text-gray-300 font-medium cursor-pointer">
                    Publish to Website
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#6750A4] focus:ring-0 bg-[#100D1A] border-white/20"
                  />
                  <label htmlFor="isFeatured" className="text-gray-300 font-medium cursor-pointer">
                    Feature on Homepage
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
                  className="px-6 py-2.5 rounded-xl bg-[#6750A4] hover:bg-[#574092] text-white font-semibold transition-colors shadow-md cursor-pointer"
                >
                  {editing ? "Save Changes" : "Create Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
