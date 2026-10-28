"use client";

import { useState } from "react";
import { GatewayIcon, E2eeBadgeIcon, ChipIcon } from "./Icons";

export default function SecurityDashboardCard() {
  const [isTunnelActive, setIsTunnelActive] = useState(true);
  const [selectedPill, setSelectedPill] = useState<string>("Scoped Ephemeral");

  const handleRevoke = () => {
    setIsTunnelActive((prev) => !prev);
  };

  return (
    <div className="bg-white rounded-[28px] sm:rounded-[32px] p-5 sm:p-7 border border-[#E9E4F2] shadow-[0_22px_65px_-12px_rgba(79,53,155,0.12)] space-y-4 max-w-lg mx-auto w-full transition-all duration-300">
      {/* 1. Header: Gateway info & E2EE badge */}
      <div className="flex items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-xs">
            <img
              src="/gateway-icon.png"
              alt="Gateway Icon"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="text-sm sm:text-[15px] font-bold text-[#17151D] tracking-tight">
              Factory Floor : GATEWAY-001
            </div>

            <div className="text-xs text-[#7B7785] font-normal flex items-center gap-1.5 mt-0.5">
              <span>Osaka Plant</span>
              <span>&bull;</span>
              <span>Secure Session</span>
            </div>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-[#EFEBF7] text-[#503796] text-[11px] font-bold flex items-center gap-1.5 border border-[#E3DCF2] shrink-0 select-none">
          <E2eeBadgeIcon className="w-3 h-3" />
          <span>E2EE</span>
        </div>
      </div>

      {/* 2. Active Permissions Container */}
      <div className="bg-[#F7F5FB] p-3.5 sm:p-4 rounded-2xl border border-[#ECE6F6] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#503796]"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#635B74]">
              ACTIVE PERMISSIONS
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#7B7785]">
            Expires in 28m
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["View Only", "No Forward", "Scoped Ephemeral"].map((pill) => {
            const isSelected = selectedPill === pill;
            return (
              <button
                key={pill}
                type="button"
                onClick={() => setSelectedPill(pill)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                  isSelected
                    ? "bg-white text-[#503796] border border-[#DDD5EF] font-bold ring-1 ring-[#503796]/10"
                    : "bg-white text-[#433E50] border border-[#E5E0F0] hover:text-[#503796]"
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Activity Log Item: GATEWAY-001 Package received */}
      <div className="flex items-start gap-3 px-1 py-0.5">
        <div className="w-8 h-8 rounded-lg bg-[#EFEAF6] text-[#503796] flex items-center justify-center shrink-0 mt-0.5">
          <ChipIcon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#17151D]">
              GATEWAY-001
            </span>
            <span className="text-[11px] text-[#7B7785] font-mono">
              14:02 UTC
            </span>
          </div>
          <p className="text-xs text-[#625F6B] mt-0.5 leading-snug">
            Package received and staged cryptographically.
          </p>
        </div>
      </div>

      {/* 4. Active Session Box: Yamamoto remote session */}
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 space-y-2.5 ${
          isTunnelActive
            ? "bg-[#F4EFFB] border-[#E7DFFA]"
            : "bg-[#F9F7FA] border-[#E8E4ED] opacity-60"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#503796]">
            Yamamoto (Sr. OT Lead)
          </span>
          <span className="text-[11px] text-[#7B7785] font-mono">
            14:03 UTC
          </span>
        </div>
        <p className="text-xs text-[#524E5B] leading-snug">
          Opening remote session to apply GX Works logic.
        </p>

        {/* Terminal/tunnel code strip */}
        <div className="bg-white rounded-xl px-3.5 py-2.5 flex items-center justify-between border border-[#E5DEF3] shadow-xs">
          <span className="font-mono text-[11px] sm:text-xs text-[#3C364A] font-medium tracking-tight">
            Secure Tunnel &rarr; 127.0.0.1:3389
          </span>
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              isTunnelActive
                ? "bg-[#B58B12] shadow-[0_0_6px_rgba(181,139,18,0.6)] animate-pulse"
                : "bg-gray-400"
            }`}
            title={isTunnelActive ? "Tunnel Active" : "Tunnel Closed"}
          ></span>
        </div>
      </div>

      {/* 5. Footer: Active Tunnel status & Revoke Button */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              isTunnelActive ? "bg-[#503796]" : "bg-gray-400"
            }`}
          ></span>
          <span className="text-xs font-bold text-[#17151D]">
            {isTunnelActive ? "1 Active Tunnel" : "0 Active Tunnels"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleRevoke}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isTunnelActive
              ? "bg-[#FDE8E8] text-[#D32F2F] hover:bg-[#FCD8D8] active:scale-95"
              : "bg-[#EFEAF6] text-[#503796] hover:bg-[#E5DCF2]"
          }`}
        >
          {isTunnelActive ? "Revoke" : "Restore"}
        </button>
      </div>
    </div>
  );
}
