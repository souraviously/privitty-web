"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ShieldIcon, ArrowRight, FileTextIcon, CheckIcon, ClockIcon } from "../components/Icons";

export default function ReportAbusePage() {
  const [targetSubdomain, setTargetSubdomain] = useState("");
  const [category, setCategory] = useState("phishing");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [urgency, setUrgency] = useState("Standard Priority (2 Business Days)");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F5FF] text-[#17151D]">
      <Navbar />

      <main className="flex-1 py-16 px-6 max-w-7xl mx-auto w-full">
        {/* HEADER */}
        <div className="grid md:grid-cols-12 gap-8 items-start mb-12">
          <div data-gsap="fade-up" className="md:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFEAF6] border border-[#DDD5EF] text-[10.5px] sm:text-[11px] font-bold tracking-[0.06em] text-[#432F75] uppercase select-none transition-all">
              <ShieldIcon className="w-3.5 h-3.5 text-[#503796] shrink-0" />
              <span>Security Governance &amp; Incident Protocol &bull; Last updated 20 Aug 2026</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#17151D] font-headline">
              Report Abuse
            </h1>
            <p className="text-[#625F6B] text-base leading-relaxed">
              Privitty provides hosted services to customers on subdomains of <code className="bg-[#D2D2F3]/60 px-1.5 py-0.5 rounded font-mono text-sm text-[#4f378a]">privitty.cloud</code> (for example, <code className="bg-[#D2D2F3]/60 px-1.5 py-0.5 rounded font-mono text-sm text-[#4f378a]">customer1.privitty.cloud</code>). If you believe a privitty.cloud subdomain is being used for abusive or illegal activity, please report it to us.
            </p>
          </div>

          <div
            data-gsap="scale-up"
            data-gsap-delay="0.15"
            className="md:col-span-4 bg-white p-6 rounded-3xl border border-[#DDD8E8] shadow-sm space-y-2 premium-card"
          >
            <div className="text-[10px] font-bold text-[#6750A4] uppercase tracking-wider">SIRT Response Desk</div>
            <div className="text-2xl font-extrabold text-[#17151D] font-headline">Target SLA &le; 48h</div>
            <div className="text-xs text-[#625F6B]">Cryptographic non-repudiation audit logged for all incoming security tickets.</div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Scope & Direct Email */}
          <div className="md:col-span-5 space-y-8">
            {/* SCOPE BOX */}
            <div
              data-gsap="fade-up"
              className="bg-[#D2D2F3]/30 p-8 rounded-3xl border border-[#DDD8E8] space-y-6"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#6750A4] uppercase tracking-wider">
                <span className="w-6 h-6 rounded-lg bg-[#D2D2F3] flex items-center justify-center text-[#4f378a]">
                  <ShieldIcon className="w-3.5 h-3.5" />
                </span>
                SCOPE: What to report
              </div>

              <p className="text-xs text-[#625F6B] leading-relaxed">
                Our zero-trust and machine identity platform enforces strict terms. Flag subdomains engaging in any of the following activities:
              </p>

              <div
                data-gsap="stagger"
                data-gsap-stagger="0.06"
                className="space-y-3"
              >
                <div data-gsap-item className="bg-white p-4 rounded-2xl border border-[#DDD8E8] space-y-1 premium-card">
                  <div className="font-bold text-xs text-[#17151D]">Phishing or fraud</div>
                  <div className="text-[11px] text-[#625F6B]">Deceptive credential harvesting or fraudulent impersonation.</div>
                </div>

                <div data-gsap-item className="bg-white p-4 rounded-2xl border border-[#DDD8E8] space-y-1 premium-card">
                  <div className="font-bold text-xs text-[#17151D]">Malware or malicious distribution</div>
                  <div className="text-[11px] text-[#625F6B]">Payload hosting, command-and-control server hosting, or trojans.</div>
                </div>

                <div data-gsap-item className="bg-white p-4 rounded-2xl border border-[#DDD8E8] space-y-1 premium-card">
                  <div className="font-bold text-xs text-[#17151D]">Spam or unauthorized bulk messaging</div>
                  <div className="text-[11px] text-[#625F6B]">Automated unsolicited commercial or volumetric abuse.</div>
                </div>

                <div data-gsap-item className="bg-white p-4 rounded-2xl border border-[#DDD8E8] space-y-1 premium-card">
                  <div className="font-bold text-xs text-[#17151D]">Unauthorized access or attacks</div>
                  <div className="text-[11px] text-[#625F6B]">Network scanning, DDoS, brute force, or OT infiltration attempts.</div>
                </div>

                <div data-gsap-item className="bg-white p-4 rounded-2xl border border-[#DDD8E8] space-y-1 premium-card">
                  <div className="font-bold text-xs text-[#17151D]">Illegal content</div>
                  <div className="text-[11px] text-[#625F6B]">Unlawful material violating statutory safety standards.</div>
                </div>

                <div data-gsap-item className="bg-white p-4 rounded-2xl border border-[#DDD8E8] space-y-1 premium-card">
                  <div className="font-bold text-xs text-[#17151D]">Other violations of Terms of Service</div>
                  <div className="text-[11px] text-[#625F6B]">Breaches of acceptable resource usage and customer covenants.</div>
                </div>
              </div>
            </div>

            {/* DIRECT EMAIL INGESTION */}
            <div
              data-gsap="fade-up"
              className="bg-white p-6 rounded-3xl border border-[#DDD8E8] space-y-3 premium-card"
            >
              <div className="text-xs font-bold uppercase text-[#6750A4]">DIRECT EMAIL INGESTION</div>
              <div className="text-xs text-[#625F6B]">Primary reporting mailbox:</div>
              <a
                href="mailto:abuse@privittytech.com"
                className="text-base font-bold text-[#6750A4] underline hover:text-[#57418F] inline-flex items-center gap-1.5 transition-colors"
              >
                abuse@privittytech.com
                <ArrowRight className="w-4 h-4 inline" />
              </a>
              <div className="p-3 bg-[#F8F5FF] rounded-xl border border-[#DDD8E8] text-[11px] text-[#625F6B]">
                <span className="font-bold text-[#17151D]">Urgent Escalation:</span> For urgent active security or active compromise, include <code className="font-bold text-red-600">URGENT</code> in the subject line.
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Direct Ingestion Form */}
          <div className="md:col-span-7 space-y-8">
            <div
              data-gsap="fade-up"
              data-gsap-delay="0.1"
              className="bg-white p-8 md:p-10 rounded-3xl border border-[#DDD8E8] shadow-lg space-y-6"
            >
              <div className="flex justify-between items-center pb-4 border-b border-[#DDD8E8]">
                <div>
                  <div className="text-xs font-bold text-[#6750A4] uppercase tracking-wider">DIRECT INGESTION FORM</div>
                  <h2 className="text-2xl font-bold text-[#17151D] font-headline">How to report</h2>
                </div>
                <span className="px-3 py-1 bg-[#D2D2F3] text-[#4f378a] text-[10px] font-bold rounded-full uppercase">
                  Encrypted Intake
                </span>
              </div>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="p-3.5 rounded-xl bg-[#F8F5FF] border border-[#DDD8E8] text-xs text-[#625F6B] space-y-1">
                    <div className="font-bold text-[#17151D]">Please ensure your report includes:</div>
                    <ul className="grid grid-cols-2 gap-1 text-[11px]">
                      <li>&bull; Full URL or hostname involved</li>
                      <li>&bull; Observed abuse description</li>
                      <li>&bull; Evidence (logs, headers, captures)</li>
                      <li>&bull; Contact details for follow-up</li>
                    </ul>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17151D] mb-1.5">
                      Target Subdomain / Hostname Involved *
                    </label>
                    <input
                      type="text"
                      required
                      value={targetSubdomain}
                      onChange={(e) => setTargetSubdomain(e.target.value)}
                      placeholder="e.g. customer1.privitty.cloud"
                      className="w-full px-4 py-3 rounded-xl border border-[#DDD8E8] text-sm focus:outline-none focus:border-[#6750A4] transition-colors"
                    />
                    <div className="text-[11px] text-gray-500 mt-1">Must reside on the privitty.cloud domain namespace.</div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17151D] mb-1.5">
                      Abuse Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#DDD8E8] text-sm focus:outline-none focus:border-[#6750A4] transition-colors"
                    >
                      <option value="phishing">Phishing or Deceptive Credential Harvesting</option>
                      <option value="malware">Malware / Command &amp; Control Hosting</option>
                      <option value="spam">Spam / Unauthorized Messaging</option>
                      <option value="unauthorized_access">DDoS / Unauthorized Access Attempts</option>
                      <option value="illegal_content">Illegal Content</option>
                      <option value="tos_violation">Terms of Service Violation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17151D] mb-1.5">
                      Description of Abuse Observed *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detail the specific malicious actions, timestamps, affected IP targets, or anomalous patterns..."
                      className="w-full px-4 py-3 rounded-xl border border-[#DDD8E8] text-sm focus:outline-none focus:border-[#6750A4] transition-colors"
                    ></textarea>
                  </div>

                  {/* Drag & Drop File Upload Box */}
                  <div>
                    <label className="block text-xs font-bold text-[#17151D] mb-1.5">
                      Supporting Evidence &amp; Logs
                    </label>
                    <div className="border-2 border-dashed border-[#DDD8E8] rounded-2xl p-6 text-center bg-[#F8F5FF] hover:border-[#6750A4] transition-all cursor-pointer space-y-2 group">
                      <div className="w-10 h-10 rounded-full bg-[#D2D2F3] text-[#4f378a] flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                        <FileTextIcon className="w-5 h-5 text-[#4f378a]" />
                      </div>
                      <div className="text-xs font-bold text-[#17151D]">
                        Click to upload files <span className="font-normal text-gray-500">or drag logs, headers, and screenshots</span>
                      </div>
                      <div className="text-[10px] text-gray-400">Supported: .log, .eml, .txt, .pcap, .png, .pdf (Up to 25MB)</div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#17151D] mb-1.5">
                        Your Contact Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="reporter@company.com"
                        className="w-full px-4 py-3 rounded-xl border border-[#DDD8E8] text-sm focus:outline-none focus:border-[#6750A4] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#17151D] mb-1.5">
                        Urgency Level
                      </label>
                      <select
                        value={urgency}
                        onChange={(e) => setUrgency(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[#DDD8E8] text-sm focus:outline-none focus:border-[#6750A4] transition-colors"
                      >
                        <option>Standard Priority (2 Business Days)</option>
                        <option>High Priority (24 Hours)</option>
                        <option>URGENT (Active Threat / Compromise)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-[#6750A4] text-white font-bold text-sm hover:bg-[#57418F] shadow-md transition-all flex items-center justify-center gap-2 interactive-btn cursor-pointer"
                  >
                    <span>Submit Abuse Report</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#17151D] font-headline">Report Successfully Logged</h3>
                  <p className="text-xs text-[#625F6B] max-w-md mx-auto">
                    Your report has been encrypted and submitted to the Privitty SIRT Response Desk. A ticket reference has been logged.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setTargetSubdomain("");
                      setDescription("");
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#6750A4] text-white text-xs font-semibold interactive-btn cursor-pointer"
                  >
                    Submit Another Report
                  </button>
                </div>
              )}
            </div>

            {/* WHAT HAPPENS NEXT PROTOCOL */}
            <div
              data-gsap="fade-up"
              className="bg-[#F8F5FF] p-6 rounded-3xl border border-[#DDD8E8] flex gap-4 items-center premium-card"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#6750A4] text-white flex items-center justify-center shrink-0 shadow-xs">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase text-[#6750A4]">SIRT PROTOCOL</div>
                <h4 className="font-bold text-sm text-[#17151D]">What happens next</h4>
                <p className="text-xs text-[#625F6B]">
                  We aim to acknowledge reports within 2 business days and will investigate and act on confirmed abuse, which may include suspending the affected subdomain. For urgent security matters, include &quot;URGENT&quot; in the subject line.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BANNER */}
        <div
          data-gsap="fade-in"
          className="mt-16 p-6 rounded-2xl bg-white border border-[#DDD8E8] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-[#625F6B] premium-card"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6750A4]"></span>
            <span>Cryptographic Traceability &amp; Sovereign OT Access</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-[#D2D2F3]/60 rounded-full font-bold text-[#4f378a]">Zero Open Ports</span>
            <span className="px-3 py-1 bg-[#D2D2F3]/60 rounded-full font-bold text-[#4f378a]">Hardware-Free Trust</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
