import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BrandTagline from "../components/BrandTagline";
import { ArrowRight, ArrowUpRight, FileTextIcon, ShieldCheckIcon } from "../components/Icons";
import { getPublishedWhitepapers } from "@/app/lib/queries";


function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default async function WhitepapersPage() {
  const whitepapers = await getPublishedWhitepapers();

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F5FF] text-[#17151D]">
      <Navbar />

      <main className="flex-1">
        {/* =========================================================================
            HERO SECTION
           ========================================================================= */}
        <section className="pt-12 sm:pt-16 pb-16 md:pb-20 px-6 max-w-7xl mx-auto text-center">
          <div data-gsap="fade-up" className="mb-6 flex justify-center">
            <BrandTagline />
          </div>

          <h1
            data-gsap="fade-up"
            data-gsap-delay="0.1"
            className="text-4xl sm:text-5xl lg:text-[60px] font-extrabold text-[#17151D] font-headline tracking-tight leading-[1.1] max-w-4xl mx-auto"
          >
            Technical blueprints for<br />
            <span className="font-serif italic font-normal text-[#4C3298]">zero-trust OT</span> security.
          </h1>

          <p
            data-gsap="fade-up"
            data-gsap-delay="0.2"
            className="text-sm sm:text-base text-[#625F6B] max-w-2xl mx-auto mt-6 leading-relaxed"
          >
            In-depth architectural research, mathematical verification models, and operational field guides for securing mission-critical industrial machinery without VPN perimeters.
          </p>
        </section>

        {/* =========================================================================
            WHITEPAPERS LISTING
           ========================================================================= */}
        <section className="pb-24 px-6 max-w-7xl mx-auto border-t border-[#DDD8E8]/70 pt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#6750A4]">
                RESEARCH LIBRARY
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17151D] font-headline tracking-tight mt-1">
                Published Whitepapers
              </h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#ECE7F6] text-[#4F378A]">
              {whitepapers.length} Document{whitepapers.length === 1 ? "" : "s"}
            </span>
          </div>

          {whitepapers.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-[#DDD8E8]/70 text-center max-w-xl mx-auto space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#ECE7F6] text-[#4F378A] flex items-center justify-center mx-auto">
                <FileTextIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#17151D]">No Whitepapers Published Yet</h3>
              <p className="text-xs text-[#625F6B]">
                New research publications will be listed here as soon as they are approved and published by our research team.
              </p>
            </div>
          ) : (
            <div
              data-gsap="stagger"
              data-gsap-stagger="0.1"
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {whitepapers.map((wp) => (
                <div
                  key={wp.id}
                  data-gsap-item
                  className="bg-white p-8 lg:p-10 rounded-3xl border border-[#DDD8E8]/80 shadow-xs flex flex-col justify-between space-y-6 premium-card hover:border-[#6750A4]/40 transition-all"
                >
                  <div className="space-y-5">
                    {/* Top Meta Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-[#ECE7F6] text-[#4F378A] text-[10.5px] font-bold uppercase tracking-wider">
                        {wp.category || "Security Architecture"}
                      </span>
                      <div className="flex items-center gap-3 text-[11px] text-[#7A7589]">
                        <span>{formatBytes(wp.fileSize)}</span>
                        <span>•</span>
                        <span>{wp.downloadCount} downloads</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl font-bold text-[#17151D] font-headline tracking-tight leading-snug">
                      <Link
                        href={`/whitepapers/${wp.slug}`}
                        className="hover:text-[#6750A4] transition-colors"
                      >
                        {wp.title}
                      </Link>
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs sm:text-sm text-[#625F6B] leading-relaxed">
                      {wp.shortDescription}
                    </p>

                    {/* Author & Verification */}
                    <div className="flex items-center gap-2 pt-2 text-[11px] font-semibold text-[#4F378A]">
                      <ShieldCheckIcon className="w-4 h-4 text-[#6750A4]" />
                      <span>{wp.author || "Privitty Security Research"}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-6 border-t border-[#ECE7F5] flex flex-wrap items-center justify-between gap-3">
                    <Link
                      href={`/whitepapers/${wp.slug}`}
                      className="text-xs font-bold text-[#6750A4] hover:text-[#4F378A] flex items-center gap-1.5 transition-colors group"
                    >
                      <span>Read Overview</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>

                    <a
                      href={`/api/whitepapers/${wp.slug}/download`}
                      className="px-5 py-2.5 rounded-xl bg-[#4F378A] hover:bg-[#432E76] text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-sm interactive-btn"
                    >
                      <span>Download PDF</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
