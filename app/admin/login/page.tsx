"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Authentication failed. Please check your credentials.");
        return;
      }

      // Successfully authenticated
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network or server connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5FF] flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Background radial glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-[#6750A4]/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-[#553C9A]/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#5933AA] text-white shadow-lg shadow-[#5933AA]/25 mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17151D] font-headline tracking-tight">
            Privitty Admin Studio
          </h1>
          <p className="text-xs sm:text-sm text-[#625F6B] mt-1.5">
            Authorized administrator access &amp; identity governance
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#DDD8E8] shadow-xl shadow-[#5933AA]/5">
          {error && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-[#17151D] mb-1.5"
              >
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A7589]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@privitty.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#DDD8E8] bg-[#FAF8FF] focus:bg-white text-sm text-[#17151D] placeholder:text-[#9B97A6] focus:outline-none focus:ring-2 focus:ring-[#6750A4] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#17151D]"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A7589]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-[#DDD8E8] bg-[#FAF8FF] focus:bg-white text-sm text-[#17151D] placeholder:text-[#9B97A6] focus:outline-none focus:ring-2 focus:ring-[#6750A4] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7A7589] hover:text-[#17151D] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#5933AA] hover:bg-[#4F378A] text-white font-semibold text-sm transition-all shadow-md shadow-[#5933AA]/20 hover:shadow-lg flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed interactive-btn mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#DDD8E8] text-center">
            <p className="text-[11px] text-[#7A7589]">
              Privitty Sovereign Cryptographic CMS &bull; Rate-Limited &amp; Audit Logged
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-[#625F6B] hover:text-[#5933AA] font-medium transition-colors"
          >
            &larr; Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
}
