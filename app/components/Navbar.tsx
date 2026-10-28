"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  XIcon,
  CheckIcon,
  ChevronDown,
  UserIcon,
  MenuIcon,
  EdgePcIcon,
  CodeBracketsIcon,
  ShieldCheckIcon,
} from "./Icons";
import MegaSubmenu, { MegaSubmenuData, MobileSubmenu } from "./MegaSubmenu";

interface NavItem {
  name: string;
  href: string;
  submenu?: MegaSubmenuData;
}

export default function Navbar() {
  const pathname = usePathname();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedItem, setMobileExpandedItem] = useState<string | null>(
    null,
  );

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navContainerRef = useRef<HTMLDivElement | null>(null);

  // Close submenu on route change
  useEffect(() => {
    setActiveSubmenu(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close submenu on click outside or Escape
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        navContainerRef.current &&
        !navContainerRef.current.contains(event.target as Node)
      ) {
        setActiveSubmenu(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveSubmenu(null);
        setIsMobileMenuOpen(false);
        setIsDemoModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMouseEnter = (name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveSubmenu(name);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveSubmenu(null);
    }, 150);
  };

  // Dynamic mega submenu data definition
  const productsSubmenuData: MegaSubmenuData = {
    cards: [
      {
        icon: <EdgePcIcon className="w-5 h-5 text-white" />,
        badge: "EDGE",
        category: "OT & GATEWAY SECURITY",
        title: "Privitty Edge",
        description:
          "Machine identity & outbound-only remote access for MELIPC and Windows IoT industrial PCs.",
        tags: ["Windows IoT", "Zero Open Ports"],
        href: "/product#edge",
      },
      {
        icon: <CodeBracketsIcon className="w-5 h-5 text-white" />,
        badge: "SDK / API",
        category: "DEVELOPER & PROTOCOLS",
        title: "Communicator SDK",
        description:
          "Drop-in library for E2EE messaging, file-level policy governance, and instant cryptographic revocation.",
        tags: ["Multi-Platform", "C / Rust / TS"],
        href: "/product#sdk",
      },
      {
        icon: <ShieldCheckIcon className="w-5 h-5 text-white" />,
        badge: "APP",
        category: "ENTERPRISE COMMUNICATIONS",
        title: "Communicator App",
        description:
          "Sovereign team communication app with zero metadata tracking, per-file access limits, and private relays.",
        tags: ["Cross-Platform", "Sovereign Relays"],
        href: "/product#app",
      },
    ],
    footer: {
      primaryLink: {
        label: "Explore Full Product Suite & Technical Architecture",
        href: "/product",
      },
      secondaryCta: {
        text: "Need custom OEM integration?",
        ctaLabel: "Book Demo",
        onClick: () => setIsDemoModalOpen(true),
      },
    },
  };

  const navLinks: NavItem[] = [
    {
      name: "Products",
      href: "/product",
      submenu: productsSubmenuData,
    },
    { name: "How It Works", href: "/#architecture" },
    { name: "Docs", href: "https://docs.edge.privittytech.com/" },
    { name: "About", href: "/about" },
    { name: "Privacy", href: "/privacy" },
    { name: "Report Abuse", href: "/report-abuse" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#F8F5FF]/90 border-b border-[#DDD8E8] transition-all">
        <div
          ref={navContainerRef}
          className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-10 h-10 group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="Privitty Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-[#17151D] font-headline">
                Privitty
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-8 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const hasSubmenu = Boolean(link.submenu);
              const isSubmenuOpen = activeSubmenu === link.name;

              if (hasSubmenu && link.submenu) {
                return (
                  <div
                    key={link.name}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(link.name)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setActiveSubmenu(isSubmenuOpen ? null : link.name)
                      }
                      className={`transition-colors py-2 inline-flex items-center gap-1.5 focus:outline-none cursor-pointer ${
                        isActive || isSubmenuOpen
                          ? "text-[#6750A4] font-bold"
                          : "text-[#625F6B] hover:text-[#17151D]"
                      }`}
                      aria-expanded={isSubmenuOpen}
                      aria-haspopup="true"
                    >
                      <span>{link.name}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isSubmenuOpen
                            ? "rotate-180 text-[#6750A4]"
                            : "text-[#7B7787]"
                        }`}
                      />
                    </button>

                    <MegaSubmenu
                      isOpen={isSubmenuOpen}
                      onClose={() => setActiveSubmenu(null)}
                      data={link.submenu}
                      className="-left-4 sm:-left-8 lg:-left-12"
                    />
                  </div>
                );
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  target={link.name === "Docs" ? "_blank" : undefined}
                  rel={link.name === "Docs" ? "noopener noreferrer" : undefined}
                  className={`transition-colors py-2 ${
                    isActive
                      ? "text-[#6750A4] font-bold border-b-2 border-[#6750A4]"
                      : "text-[#625F6B] hover:text-[#17151D]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="hidden sm:inline-flex px-5 py-2.5 rounded-full text-sm font-semibold bg-[#543C95] text-white hover:bg-[#432E76] shadow-md shadow-[#543C95]/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              Book a Demo
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-full bg-[#D2D2F3]/70 text-[#4f378a] flex items-center justify-center font-bold text-sm"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? (
                <XIcon className="w-4 h-4" />
              ) : (
                <MenuIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#DDD8E8] px-5 py-5 space-y-4 shadow-xl">
            <div className="space-y-2">
              {navLinks.map((link) => {
                const hasSubmenu = Boolean(link.submenu);
                const isExpanded = mobileExpandedItem === link.name;

                if (hasSubmenu && link.submenu) {
                  return (
                    <div key={link.name} className="space-y-1">
                      <button
                        type="button"
                        onClick={() =>
                          setMobileExpandedItem(isExpanded ? null : link.name)
                        }
                        className="w-full flex items-center justify-between text-left text-sm font-bold text-[#17151D] py-2 px-1"
                      >
                        <span>{link.name}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isExpanded
                              ? "rotate-180 text-[#6750A4]"
                              : "text-[#7B7787]"
                          }`}
                        />
                      </button>

                      <MobileSubmenu
                        isOpen={isExpanded}
                        onClose={() => setIsMobileMenuOpen(false)}
                        data={link.submenu}
                      />
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    target={link.name === "Docs" ? "_blank" : undefined}
                    rel={
                      link.name === "Docs" ? "noopener noreferrer" : undefined
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-sm font-semibold text-[#17151D] py-2 px-1 hover:text-[#6750A4]"
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#DDD8E8] flex gap-3">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsDemoModalOpen(true);
                }}
                className="w-full py-3 rounded-xl text-center text-sm font-semibold bg-[#543C95] text-white hover:bg-[#432E76]"
              >
                Book a Demo
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Shared Demo Modal */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full border border-[#DDD8E8] shadow-2xl relative">
            <button
              onClick={() => {
                setIsDemoModalOpen(false);
                setDemoSubmitted(false);
              }}
              className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
              aria-label="Close"
            >
              <XIcon className="w-5 h-5" />
            </button>

            {!demoSubmitted ? (
              <div className="space-y-6">
                <div className="inline-block px-3 py-1 rounded-md bg-[#D2D2F3] text-[#4f378a] text-xs font-bold uppercase tracking-wider">
                  Privitty Enterprise Access
                </div>
                <h3 className="text-2xl font-bold text-[#17151D] font-headline">
                  Schedule Privitty Architecture Review
                </h3>
                <p className="text-xs text-[#625F6B]">
                  Connect with our OT Security and Sovereign Infrastructure
                  specialists to assess your zero-trust posture.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setDemoSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-[#17151D] mb-1">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="engineer@enterprise.com"
                      className="w-full px-4 py-3 rounded-xl border border-[#DDD8E8] text-sm focus:outline-none focus:border-[#6750A4]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#17151D] mb-1">
                      Company / Organization *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Global Industrial Corp"
                      className="w-full px-4 py-3 rounded-xl border border-[#DDD8E8] text-sm focus:outline-none focus:border-[#6750A4]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#17151D] mb-1">
                      Deployment Focus
                    </label>
                    <select className="w-full px-4 py-3 rounded-xl border border-[#DDD8E8] text-sm focus:outline-none focus:border-[#6750A4]">
                      <option>Operational Technology (OT) &amp; ICS</option>
                      <option>Data Sovereignty &amp; Local Residency</option>
                      <option>
                        Machine Identity &amp; Certificate Automation
                      </option>
                      <option>Full Platform Audit</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-[#6750A4] text-white font-semibold text-sm hover:bg-[#57418F] transition-all shadow-md"
                  >
                    Submit Request
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckIcon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#17151D] font-headline">
                  Request Confirmed
                </h3>
                <p className="text-xs text-[#625F6B]">
                  Our security architecture team will reach out within 4
                  business hours.
                </p>
                <button
                  onClick={() => {
                    setIsDemoModalOpen(false);
                    setDemoSubmitted(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#6750A4] text-white text-xs font-semibold"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
