"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowRight, ShieldCheckIcon } from "../components/Icons";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F5FF] text-[#17151D]">
      <Navbar />

      <main className="flex-1 py-16 px-6 max-w-7xl mx-auto w-full">
        {/* HEADER */}
        <div data-gsap="fade-up" className="max-w-3xl space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFEAF6] border border-[#DDD5EF] text-[10.5px] sm:text-[11px] font-bold tracking-[0.06em] text-[#432F75] uppercase select-none transition-all">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-[#503796] shrink-0" />
            <span>Legal &amp; Compliance &bull; Last updated 20 Aug 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#17151D] font-headline">
            Privacy Policy
          </h1>
          <p className="text-[#625F6B] text-base leading-relaxed">
            Welcome to Privitty (&quot;we&quot; or &quot;us&quot;). This Privacy Policy is designed to help you understand how we collect, use, disclose, and safeguard your personal information when you use our website and related services.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR: Table of Contents */}
          <aside
            data-gsap="slide-left"
            className="md:col-span-4 sticky top-28 bg-white p-6 rounded-3xl border border-[#DDD8E8] space-y-3 shadow-sm premium-card"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6750A4] pb-2 border-b border-[#DDD8E8]">
              Table of Contents
            </h3>
            <nav className="space-y-2 text-xs font-medium text-[#625F6B]">
              <a href="#section-1" className="block hover:text-[#6750A4] hover:translate-x-1 transition-all">1. Information We Collect</a>
              <a href="#section-2" className="block hover:text-[#6750A4] hover:translate-x-1 transition-all">2. How We Use Your Information</a>
              <a href="#section-3" className="block hover:text-[#6750A4] hover:translate-x-1 transition-all">3. Sharing Your Information</a>
              <a href="#section-4" className="block hover:text-[#6750A4] hover:translate-x-1 transition-all">4. Cookies &amp; Similar Technologies</a>
              <a href="#section-5" className="block hover:text-[#6750A4] hover:translate-x-1 transition-all">5. Your Choices</a>
              <a href="#section-6" className="block hover:text-[#6750A4] hover:translate-x-1 transition-all">6. Security</a>
              <a href="#section-7" className="block hover:text-[#6750A4] hover:translate-x-1 transition-all">7. Children&apos;s Privacy</a>
              <a href="#section-8" className="block hover:text-[#6750A4] hover:translate-x-1 transition-all">8. Changes to Privacy Policy</a>
              <a href="#section-9" className="block hover:text-[#6750A4] hover:translate-x-1 transition-all">9. Contact Us</a>
            </nav>

            <div className="pt-4 border-t border-[#DDD8E8] text-[11px] text-[#625F6B] leading-relaxed">
              Privitty operates zero-knowledge data enclaves. Telemetry data is encrypted locally before transmission.
            </div>
          </aside>

          {/* RIGHT CONTENT AREA */}
          <div className="md:col-span-8 space-y-8">
            {/* 1. Information We Collect */}
            <section
              id="section-1"
              data-gsap="fade-up"
              className="bg-white p-8 rounded-3xl border border-[#DDD8E8] space-y-6 shadow-sm premium-card"
            >
              <h2 className="text-xl font-bold text-[#17151D] font-headline flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#D2D2F3] text-[#4f378a] flex items-center justify-center text-xs font-bold">1</span>
                Information We Collect
              </h2>

              <div className="space-y-4 text-sm text-[#625F6B] leading-relaxed">
                <div className="p-4 rounded-2xl bg-[#F8F5FF] border border-[#DDD8E8] space-y-2">
                  <h3 className="font-bold text-[#17151D] text-xs uppercase tracking-wider">1.1 Personal Information</h3>
                  <p>
                    We may collect personal information, such as your name, email address, company affiliation, and phone number when you register for an account, subscribe to newsletters, or contact us through our website.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8F5FF] border border-[#DDD8E8] space-y-2">
                  <h3 className="font-bold text-[#17151D] text-xs uppercase tracking-wider">1.2 Usage Information</h3>
                  <p>
                    We may collect information about your use of our website and services, including IP addresses, browser types, device identifiers, and operating system metrics. This information helps us optimize performance and security.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. How We Use Your Information */}
            <section
              id="section-2"
              data-gsap="fade-up"
              className="bg-white p-8 rounded-3xl border border-[#DDD8E8] space-y-6 shadow-sm premium-card"
            >
              <h2 className="text-xl font-bold text-[#17151D] font-headline flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#D2D2F3] text-[#4f378a] flex items-center justify-center text-xs font-bold">2</span>
                How We Use Your Information
              </h2>

              <p className="text-sm text-[#625F6B] leading-relaxed">
                We use collected information for various legitimate business purposes, including:
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#F8F5FF] border border-[#DDD8E8]">
                  <h4 className="font-bold text-xs text-[#17151D] mb-1">Providing &amp; Maintaining Service</h4>
                  <p className="text-xs text-[#625F6B]">To authenticate identities, manage ephemeral access sessions, and enforce security policies.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8F5FF] border border-[#DDD8E8]">
                  <h4 className="font-bold text-xs text-[#17151D] mb-1">Communicating Account Updates</h4>
                  <p className="text-xs text-[#625F6B]">To send security alerts, platform updates, and technical notifications.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8F5FF] border border-[#DDD8E8]">
                  <h4 className="font-bold text-xs text-[#17151D] mb-1">Sending Promotional Material</h4>
                  <p className="text-xs text-[#625F6B]">To notify you of new product features (you may opt-out at any time).</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8F5FF] border border-[#DDD8E8]">
                  <h4 className="font-bold text-xs text-[#17151D] mb-1">Responding to Inquiries</h4>
                  <p className="text-xs text-[#625F6B]">To provide technical support and address architecture review requests.</p>
                </div>
              </div>
            </section>

            {/* 3. Sharing Your Information */}
            <section
              id="section-3"
              data-gsap="fade-up"
              className="bg-white p-8 rounded-3xl border border-[#DDD8E8] space-y-4 shadow-sm premium-card"
            >
              <h2 className="text-xl font-bold text-[#17151D] font-headline flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#D2D2F3] text-[#4f378a] flex items-center justify-center text-xs font-bold">3</span>
                Sharing Your Information
              </h2>
              <p className="text-sm text-[#625F6B] leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share information with trusted third-party service providers who assist us in operating our website or conducting our business under strict confidentiality covenants.
              </p>
            </section>

            {/* 4. Cookies */}
            <section
              id="section-4"
              data-gsap="fade-up"
              className="bg-white p-8 rounded-3xl border border-[#DDD8E8] space-y-4 shadow-sm premium-card"
            >
              <h2 className="text-xl font-bold text-[#17151D] font-headline flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#D2D2F3] text-[#4f378a] flex items-center justify-center text-xs font-bold">4</span>
                Cookies and Similar Technologies
              </h2>
              <p className="text-sm text-[#625F6B] leading-relaxed">
                We use essential cookies and similar technologies to maintain security sessions and enhance user experience. You can control cookies through your browser settings, though disabling essential cookies may affect service functionality.
              </p>
            </section>

            {/* 5. Your Choices */}
            <section
              id="section-5"
              data-gsap="fade-up"
              className="bg-white p-8 rounded-3xl border border-[#DDD8E8] space-y-4 shadow-sm premium-card"
            >
              <h2 className="text-xl font-bold text-[#17151D] font-headline flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#D2D2F3] text-[#4f378a] flex items-center justify-center text-xs font-bold">5</span>
                Your Choices
              </h2>
              <p className="text-sm text-[#625F6B] leading-relaxed">
                You can manage your communication preferences or opt-out of marketing emails. You may also contact us to update, correct, or delete your personal information stored on our platforms.
              </p>
            </section>

            {/* 6. Security */}
            <section
              id="section-6"
              data-gsap="fade-up"
              className="bg-white p-8 rounded-3xl border border-[#DDD8E8] space-y-4 shadow-sm premium-card"
            >
              <h2 className="text-xl font-bold text-[#17151D] font-headline flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#D2D2F3] text-[#4f378a] flex items-center justify-center text-xs font-bold">6</span>
                Security
              </h2>
              <p className="text-sm text-[#625F6B] leading-relaxed">
                We implement hardware-backed cryptographic controls and end-to-end encryption to protect personal information. However, no method of transmission over the internet is 100% secure, and absolute security cannot be guaranteed.
              </p>
            </section>

            {/* 7. Children's Privacy */}
            <section
              id="section-7"
              data-gsap="fade-up"
              className="bg-white p-8 rounded-3xl border border-[#DDD8E8] space-y-4 shadow-sm premium-card"
            >
              <h2 className="text-xl font-bold text-[#17151D] font-headline flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#D2D2F3] text-[#4f378a] flex items-center justify-center text-xs font-bold">7</span>
                Children&apos;s Privacy
              </h2>
              <p className="text-sm text-[#625F6B] leading-relaxed">
                Our website is not intended for individuals under the age of 18. If you become aware that a child has provided us with personal information, please contact us so we may delete such information immediately.
              </p>
            </section>

            {/* 8. Changes */}
            <section
              id="section-8"
              data-gsap="fade-up"
              className="bg-white p-8 rounded-3xl border border-[#DDD8E8] space-y-4 shadow-sm premium-card"
            >
              <h2 className="text-xl font-bold text-[#17151D] font-headline flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#D2D2F3] text-[#4f378a] flex items-center justify-center text-xs font-bold">8</span>
                Changes to This Privacy Policy
              </h2>
              <p className="text-sm text-[#625F6B] leading-relaxed">
                We may update this Privacy Policy periodically. We will notify you of any changes by posting the new Privacy Policy on this page. Your continued use of the website after such modifications constitutes acknowledgment of the updated policy.
              </p>
            </section>

            {/* 9. Contact Us */}
            <section
              id="section-9"
              data-gsap="fade-up"
              className="bg-white p-8 rounded-3xl border border-[#DDD8E8] space-y-6 shadow-sm premium-card"
            >
              <h2 className="text-xl font-bold text-[#17151D] font-headline flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#D2D2F3] text-[#4f378a] flex items-center justify-center text-xs font-bold">9</span>
                Contact Us
              </h2>
              <p className="text-sm text-[#625F6B]">
                If you have questions, inquiries, or requests concerning this Privacy Policy or our data handling practices, please contact our data governance team:
              </p>

              <div className="p-4 rounded-2xl bg-[#F8F5FF] border border-[#DDD8E8] flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <div className="text-xs font-bold uppercase text-[#625F6B]">E-mail Contact</div>
                  <div className="text-sm font-bold text-[#6750A4]">info@privittytech.com</div>
                </div>
                <a
                  href="mailto:info@privittytech.com"
                  className="px-6 py-2.5 rounded-xl bg-[#6750A4] text-white text-xs font-semibold hover:bg-[#57418F] transition-all inline-flex items-center gap-1.5 interactive-btn cursor-pointer"
                >
                  Send Inquiry
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </section>

            {/* BOTTOM EMBLEM BADGE */}
            <div
              data-gsap="scale-up"
              className="bg-gradient-to-r from-[#D2D2F3] to-[#F8F5FF] p-10 rounded-3xl border border-[#DDD8E8] text-center space-y-4 premium-card"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden mx-auto flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Privitty Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <h3 className="text-xl font-bold text-[#17151D] font-headline">
                Privitty Security &amp; Sovereignty
              </h3>

              <p className="text-xs text-[#625F6B] max-w-md mx-auto">
                The identity layer for operational technology. Machine identity by
                default. Human access, always revocable. No VPN. No hardware. No open ports.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
