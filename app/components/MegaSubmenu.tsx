"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "./Icons";

export interface SubmenuCard {
  icon: React.ReactNode;
  badge?: string;
  category?: string;
  title: string;
  description: string;
  tags?: string[];
  href: string;
}

export interface SubmenuFooter {
  primaryLink?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    ctaLabel: string;
    onClick?: () => void;
    href?: string;
  };
}

export interface MegaSubmenuData {
  cards: SubmenuCard[];
  footer?: SubmenuFooter;
}

export interface MegaSubmenuProps {
  isOpen: boolean;
  onClose: () => void;
  data: MegaSubmenuData;
  className?: string;
}

/**
 * Desktop Mega Submenu
 * Positioned below the navbar item with a spacious 3-column layout.
 */
export default function MegaSubmenu({
  isOpen,
  onClose,
  data,
  className = "",
}: MegaSubmenuProps) {
  return (
    <div
      className={`absolute top-full pt-3 z-50 transition-all duration-200 ease-out pointer-events-auto ${
        isOpen
          ? "opacity-100 translate-y-0 visible"
          : "opacity-0 -translate-y-2 invisible pointer-events-none"
      } ${className}`}
      role="menu"
      aria-orientation="vertical"
      aria-hidden={!isOpen}
    >
      <div className="bg-white rounded-[28px] border border-[#E4DEEE] shadow-[0_20px_50px_rgba(40,20,70,0.14)] p-6 md:p-7 w-[calc(100vw-2.5rem)] sm:w-[860px] lg:w-[940px] max-w-[940px] transition-all">
        {/* 3 Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {data.cards.map((card, idx) => (
            <Link
              key={card.title + idx}
              href={card.href}
              onClick={onClose}
              className="group bg-[#F8F5FD] hover:bg-[#F3EDFB] border border-[#ECE5F6] hover:border-[#D6C7EE] rounded-[22px] p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div>
                {/* Header: Icon & Badge */}
                <div className="flex items-center justify-between gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#523B93] text-white flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-105 shrink-0">
                    {card.icon}
                  </div>
                  {card.badge && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EDE6F8] text-[#553C9A]">
                      {card.badge}
                    </span>
                  )}
                </div>

                {/* Category Subtitle */}
                {card.category && (
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#736F7C] mt-4">
                    {card.category}
                  </div>
                )}

                {/* Title */}
                <h4 className="text-base sm:text-lg font-bold text-[#17151D] group-hover:text-[#523B93] transition-colors mt-1 leading-snug">
                  {card.title}
                </h4>

                {/* Description */}
                <p className="text-xs text-[#625F6B] leading-relaxed mt-2 font-normal">
                  {card.description}
                </p>
              </div>

              {/* Tags Section */}
              {card.tags && card.tags.length > 0 && (
                <div className="border-t border-[#E8E1F3] mt-5 pt-3.5">
                  <div className="flex items-center text-[11px] font-medium text-[#5A5565]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#523B93] inline-block mr-2 shrink-0"></span>
                    <span>{card.tags.join(" \u2022 ")}</span>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Bottom Section */}
        {data.footer && (
          <div className="border-t border-[#EDE8F5] mt-6 pt-4 px-1 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            {/* Primary Link (Left) */}
            {data.footer.primaryLink && (
              <Link
                href={data.footer.primaryLink.href}
                onClick={onClose}
                className="text-[#523B93] font-bold hover:text-[#432E76] inline-flex items-center gap-1.5 transition-colors group/link"
              >
                <span>{data.footer.primaryLink.label}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
              </Link>
            )}

            {/* Secondary CTA (Right) */}
            {data.footer.secondaryCta && (
              <div className="text-[#625F6B] font-medium flex items-center">
                <span>{data.footer.secondaryCta.text}</span>
                {data.footer.secondaryCta.onClick ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      data.footer?.secondaryCta?.onClick?.();
                    }}
                    className="text-[#523B93] font-bold underline hover:text-[#432E76] ml-1 transition-colors cursor-pointer"
                  >
                    {data.footer.secondaryCta.ctaLabel}
                  </button>
                ) : data.footer.secondaryCta.href ? (
                  <Link
                    href={data.footer.secondaryCta.href}
                    onClick={onClose}
                    className="text-[#523B93] font-bold underline hover:text-[#432E76] ml-1 transition-colors"
                  >
                    {data.footer.secondaryCta.ctaLabel}
                  </Link>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Mobile Submenu
 * Formats the rich product cards cleanly for mobile drawers.
 */
export function MobileSubmenu({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: MegaSubmenuData;
}) {
  if (!isOpen) return null;

  return (
    <div className="mt-3 space-y-3.5 pl-1 pr-1 animate-in fade-in slide-in-from-top-1 duration-200">
      {data.cards.map((card, idx) => (
        <Link
          key={card.title + idx}
          href={card.href}
          onClick={onClose}
          className="block bg-[#F8F5FD] active:bg-[#F3EDFB] border border-[#ECE5F6] rounded-2xl p-4 transition-all"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#523B93] text-white flex items-center justify-center shrink-0">
                {card.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#17151D] leading-tight">
                  {card.title}
                </h4>
                {card.category && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#736F7C]">
                    {card.category}
                  </span>
                )}
              </div>
            </div>
            {card.badge && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#EDE6F8] text-[#553C9A] shrink-0">
                {card.badge}
              </span>
            )}
          </div>

          <p className="text-[11px] text-[#625F6B] leading-relaxed line-clamp-2">
            {card.description}
          </p>

          {card.tags && card.tags.length > 0 && (
            <div className="border-t border-[#E8E1F3] mt-2.5 pt-2 flex items-center text-[10px] text-[#5A5565] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#523B93] inline-block mr-1.5 shrink-0"></span>
              <span>{card.tags.join(" \u2022 ")}</span>
            </div>
          )}
        </Link>
      ))}

      {/* Mobile Footer Links */}
      {data.footer && (
        <div className="bg-[#FAF8FE] border border-[#ECE5F6] rounded-2xl p-4 space-y-2.5 text-xs mt-3">
          {data.footer.primaryLink && (
            <Link
              href={data.footer.primaryLink.href}
              onClick={onClose}
              className="text-[#523B93] font-bold flex items-center justify-between w-full"
            >
              <span>{data.footer.primaryLink.label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {data.footer.secondaryCta && (
            <div className="pt-2 border-t border-[#EDE8F5] text-[#625F6B] text-[11px] flex items-center justify-between">
              <span>{data.footer.secondaryCta.text}</span>
              {data.footer.secondaryCta.onClick ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    data.footer?.secondaryCta?.onClick?.();
                  }}
                  className="text-[#523B93] font-bold underline"
                >
                  {data.footer.secondaryCta.ctaLabel}
                </button>
              ) : data.footer.secondaryCta.href ? (
                <Link
                  href={data.footer.secondaryCta.href}
                  onClick={onClose}
                  className="text-[#523B93] font-bold underline"
                >
                  {data.footer.secondaryCta.ctaLabel}
                </Link>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
