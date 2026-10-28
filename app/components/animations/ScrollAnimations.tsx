"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { initGSAP, prefersReducedMotion } from "../../lib/gsap";

interface ScrollAnimationsProps {
  children: React.ReactNode;
}

export default function ScrollAnimations({ children }: ScrollAnimationsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const { gsap, ScrollTrigger } = initGSAP();

    if (prefersReducedMotion()) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // Small delay to ensure Next.js has completed rendering the route
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        // 1. Single fade-up reveals
        const fadeUpElements = container.querySelectorAll<HTMLElement>(
          '[data-gsap="fade-up"]'
        );
        fadeUpElements.forEach((el) => {
          const delay = parseFloat(el.dataset.gsapDelay || "0");
          gsap.fromTo(
            el,
            { opacity: 0, y: 32 },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              delay,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                once: true,
              },
              clearProps: "transform,opacity",
            }
          );
        });

        // 2. Pure fade-in reveals
        const fadeInElements = container.querySelectorAll<HTMLElement>(
          '[data-gsap="fade-in"]'
        );
        fadeInElements.forEach((el) => {
          const delay = parseFloat(el.dataset.gsapDelay || "0");
          gsap.fromTo(
            el,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.8,
              delay,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 90%",
                once: true,
              },
              clearProps: "opacity",
            }
          );
        });

        // 3. Slide-in from left
        const slideLeftElements = container.querySelectorAll<HTMLElement>(
          '[data-gsap="slide-left"]'
        );
        slideLeftElements.forEach((el) => {
          const delay = parseFloat(el.dataset.gsapDelay || "0");
          gsap.fromTo(
            el,
            { opacity: 0, x: -36 },
            {
              opacity: 1,
              x: 0,
              duration: 0.75,
              delay,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                once: true,
              },
              clearProps: "transform,opacity",
            }
          );
        });

        // 4. Slide-in from right
        const slideRightElements = container.querySelectorAll<HTMLElement>(
          '[data-gsap="slide-right"]'
        );
        slideRightElements.forEach((el) => {
          const delay = parseFloat(el.dataset.gsapDelay || "0");
          gsap.fromTo(
            el,
            { opacity: 0, x: 36 },
            {
              opacity: 1,
              x: 0,
              duration: 0.75,
              delay,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                once: true,
              },
              clearProps: "transform,opacity",
            }
          );
        });

        // 5. Scale-up reveals (images, mockups, featured cards)
        const scaleUpElements = container.querySelectorAll<HTMLElement>(
          '[data-gsap="scale-up"]'
        );
        scaleUpElements.forEach((el) => {
          const delay = parseFloat(el.dataset.gsapDelay || "0");
          gsap.fromTo(
            el,
            { opacity: 0, scale: 0.94, y: 16 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.8,
              delay,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                once: true,
              },
              clearProps: "transform,opacity",
            }
          );
        });

        // 6. Staggered groups (cards, badges, feature items)
        const staggerGroups = container.querySelectorAll<HTMLElement>(
          '[data-gsap="stagger"]'
        );
        staggerGroups.forEach((group) => {
          const items = group.querySelectorAll<HTMLElement>(
            "[data-gsap-item]"
          );
          const targets = items.length > 0 ? items : group.children;
          const staggerTime = parseFloat(group.dataset.gsapStagger || "0.1");
          const delay = parseFloat(group.dataset.gsapDelay || "0");

          gsap.fromTo(
            targets,
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              delay,
              stagger: staggerTime,
              ease: "power2.out",
              scrollTrigger: {
                trigger: group,
                start: "top 88%",
                once: true,
              },
              clearProps: "transform,opacity",
            }
          );
        });

        // 7. Subtle Parallax for background decorative elements
        const parallaxElements = container.querySelectorAll<HTMLElement>(
          '[data-gsap="parallax"]'
        );
        parallaxElements.forEach((el) => {
          const speed = parseFloat(el.dataset.gsapSpeed || "0.2");
          const yOffset = 40 * speed;
          gsap.fromTo(
            el,
            { y: yOffset },
            {
              y: -yOffset,
              ease: "none",
              scrollTrigger: {
                trigger: el.parentElement || el,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.2,
              },
            }
          );
        });

        // 8. Number counters (e.g., stats)
        const counterElements = container.querySelectorAll<HTMLElement>(
          '[data-gsap="counter"]'
        );
        counterElements.forEach((el) => {
          const targetValue = parseFloat(el.dataset.target || el.innerText.replace(/[^0-9.]/g, "") || "0");
          const prefix = el.dataset.prefix || "";
          const suffix = el.dataset.suffix || "";
          if (isNaN(targetValue)) return;

          const obj = { count: 0 };
          gsap.to(obj, {
            count: targetValue,
            duration: 1.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              once: true,
            },
            onUpdate: () => {
              el.innerText = `${prefix}${Math.round(obj.count).toLocaleString()}${suffix}`;
            },
            onComplete: () => {
              el.innerText = `${prefix}${targetValue.toLocaleString()}${suffix}`;
            },
          });
        });

        // Refresh triggers after everything is wired up
        ScrollTrigger.refresh();
      }, container);

      return () => {
        ctx.revert();
      };
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname]);

  return (
    <div ref={containerRef} className="w-full">
      {children}
    </div>
  );
}
