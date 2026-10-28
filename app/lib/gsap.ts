"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let isRegistered = false;

export function initGSAP() {
  if (typeof window !== "undefined" && !isRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({
      ignoreMobileResize: true,
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize",
    });
    isRegistered = true;
  }
  return { gsap, ScrollTrigger };
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger };
