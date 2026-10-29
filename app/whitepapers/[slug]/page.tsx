import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import BrandTagline from "@/app/components/BrandTagline";
import {
  ArrowLeft,
  ArrowUpRight,
  ShieldIcon,
  ShieldCheckIcon,
  FileTextIcon,
  CheckIcon,
  LockIcon,
} from "@/app/components/Icons";
import { getPublishedWhitepaperBySlug, getPublishedWhitepapers } from "@/app/lib/queries";


function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const whitepapers = await getPublishedWhitepapers();
    if (whitepapers.length === 0) {
      // Next.js Cache Components requires at least one parameter set at build time
      // to perform validation of dynamic access. Return a reserved placeholder slug
      // that cleanly triggers notFound() when accessed.
      return [{ slug: "_sample" }];
    }
    return whitepapers.map((w) => ({ slug: w.slug }));
  } catch (error) {
    console.error("[generateStaticParams] Database query failed, using fallback parameter:", error);
    return [{ slug: "_sample" }];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "_sample") {
    return {
      title: "Whitepaper Not Found | Privitty",
      robots: { index: false, follow: false },
    };
  }

  try {
    const paper = await getPublishedWhitepaperBySlug(slug);

    if (!paper) {
      return {
        title: "Whitepaper Not Found | Privitty",
        robots: { index: false, follow: false },
      };
    }

    return {
      title: `${paper.title} | Privitty Whitepapers`,
      description: paper.shortDescription,
      openGraph: {
        title: `${paper.title} | Privitty Whitepapers`,
        description: paper.shortDescription,
        type: "article",
      },
    };
  } catch {
    return {
      title: "Whitepaper | Privitty",
      robots: { index: false, follow: false },
    };
  }
}

export default async function WhitepaperDetailPage({ params }: PageProps) {
  const { slug } = await params;
  if (slug === "_sample") {
    notFound();
  }

  const paper = await getPublishedWhitepaperBySlug(slug);

  if (!paper) {
    notFound();
  }

  const allPapers = await getPublishedWhitepapers({ take: 3 });
  const relatedPapers = allPapers.filter((p) => p.slug !== paper.slug).slice(0, 2);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F5FF] text-[#17151D]">
      <Navbar />

      <main className="flex-1">
        {/* Back Link & Breadcrumbs */}
        <div className="pt-8 pb-4 px-6 max-w-7xl mx-auto">
          <Link
            href="/whitepapers"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#6750A4] hover:text-[#4F378A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Whitepapers</span>
          </Link>
        </div>

        {/* =========================================================================
            HEADER SECTION
           ========================================================================= */}
        <section className="pt-4 pb-14 px-6 max-w-7xl mx-auto">
          <div className="max-w-4xl space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-md bg-[#ECE7F6] text-[#4F378A] text-xs font-bold uppercase tracking-wider">
                {paper.category || "Security Architecture"}
              </span>
              <span className="text-xs text-[#7A7589] font-medium">
                {paper.downloadCount} Verified Downloads
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-[#17151D] font-headline tracking-tight leading-[1.12]">
              {paper.title}
            </h1>

            <p className="text-base sm:text-lg text-[#524E5B] leading-relaxed max-w-3xl">
              {paper.shortDescription}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#625F6B] border-t border-[#DDD8E8]/70 pt-4">
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#7A7589]">AUTHOR</span>
                <span className="font-semibold text-[#17151D]">{paper.author || "Privitty Security Research"}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#7A7589]">FORMAT</span>
                <span className="font-semibold text-[#17151D]">PDF Document ({formatBytes(paper.fileSize)})</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#7A7589]">ACCESS</span>
                <span className="font-semibold text-[#4F378A]">Public Technical Paper</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BODY CONTENT & DOWNLOAD CARD
           ========================================================================= */}
        <section className="pb-24 px-6 max-w-7xl mx-auto border-t border-[#DDD8E8]">
          <div className="grid lg:grid-cols-12 gap-12 pt-12 items-start">
            {/* Main Long Description & Blueprint */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#DDD8E8]/80 shadow-xs space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#17151D] font-headline">
                  Executive Abstract &amp; Technical Scope
                </h2>

                <div className="text-sm sm:text-[15px] text-[#524E5B] leading-relaxed space-y-4">
                  {paper.longDescription ? (
                    paper.longDescription.split("\n\n").map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))
                  ) : (
                    <p>{paper.shortDescription}</p>
                  )}
                </div>

                <div className="pt-6 border-t border-[#ECE7F5] space-y-4">
                  <h3 className="text-base font-bold text-[#17151D] font-headline">
                    Key Architectural Takeaways in this Paper
                  </h3>
                  <ul className="space-y-3 text-xs sm:text-sm text-[#17151D]">
                    <li className="flex items-start gap-2.5">
                      <CheckIcon className="w-4 h-4 text-[#6750A4] shrink-0 mt-0.5" />
                      <span>Mathematical proof of zero-trust machine identity verification without hardware appliances.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckIcon className="w-4 h-4 text-[#6750A4] shrink-0 mt-0.5" />
                      <span>Techniques for eliminating inbound listening firewall ports across OT network perimeters.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckIcon className="w-4 h-4 text-[#6750A4] shrink-0 mt-0.5" />
                      <span>Ephemeral session leasing mechanisms ensuring immediate revocation in high-voltage grids.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckIcon className="w-4 h-4 text-[#6750A4] shrink-0 mt-0.5" />
                      <span>Sovereign data residency enclaves and tamper-proof audit trail guarantees.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Related Research */}
              {relatedPapers.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-bold text-[#17151D] font-headline">
                    Related Research Papers
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {relatedPapers.map((rel) => (
                      <div
                        key={rel.id}
                        className="bg-white p-5 rounded-2xl border border-[#DDD8E8]/70 space-y-3 hover:border-[#6750A4]/40 transition-all"
                      >
                        <span className="text-[10px] font-bold uppercase text-[#6750A4]">
                          {rel.category || "Research"}
                        </span>
                        <h4 className="text-sm font-bold text-[#17151D] line-clamp-2">
                          <Link href={`/whitepapers/${rel.slug}`} className="hover:text-[#6750A4]">
                            {rel.title}
                          </Link>
                        </h4>
                        <Link
                          href={`/whitepapers/${rel.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F378A]"
                        >
                          <span>View overview</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Download Box */}
            <div className="lg:col-span-4 sticky top-24 space-y-6">
              <div className="bg-[#2A2438] text-white p-8 rounded-3xl shadow-xl space-y-6 border border-[#3E3550]">
                <div className="w-12 h-12 rounded-2xl bg-[#6750A4] text-white flex items-center justify-center">
                  <FileTextIcon className="w-6 h-6 text-white" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-headline text-white">
                    Download Technical Paper
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Full unabridged technical document including architecture diagrams, protocol specs, and security proofs.
                  </p>
                </div>

                <a
                  href={`/api/whitepapers/${paper.slug}/download`}
                  className="w-full py-3.5 rounded-xl bg-white hover:bg-gray-100 text-[#17151D] font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg interactive-btn"
                >
                  <span>Download PDF Document</span>
                  <ArrowUpRight className="w-4 h-4 text-[#17151D]" />
                </a>

                <div className="pt-4 border-t border-white/10 space-y-2 text-[11px] text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>File size</span>
                    <span className="text-white font-medium">{formatBytes(paper.fileSize)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>File name</span>
                    <span className="text-white font-medium truncate max-w-[160px]">{paper.fileName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Delivery</span>
                    <span className="text-emerald-400 font-medium">Direct S3 / Edge Stream</span>
                  </div>
                </div>
              </div>

              {/* Sovereign Notice Card */}
              <div className="bg-white p-6 rounded-2xl border border-[#DDD8E8]/70 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#17151D]">
                  <LockIcon className="w-4 h-4 text-[#6750A4]" />
                  <span>Sovereign Security Guarantee</span>
                </div>
                <p className="text-xs text-[#625F6B] leading-relaxed">
                  Privitty research publications are cryptographically verified and comply with zero-trust architectural principles.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
