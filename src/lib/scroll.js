import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** 是否有精细指针(桌面鼠标) */
export const hasFinePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

let lenis = null;

/**
 * 平滑滚动: Lenis 负责手感, GSAP ticker 负责驱动, ScrollTrigger 负责联动。
 */
export function initSmoothScroll() {
  if (lenis) return lenis;
  if (prefersReducedMotion()) return null;

  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
    gestureOrientation: "vertical",
    autoRaf: false,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function getLenis() {
  return lenis;
}

export function scrollToTop(immediate = true) {
  if (lenis) {
    lenis.scrollTo(0, { immediate });
    return;
  }
  window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
}

export function scrollToSelector(selector, offset = -84) {
  const el =
    typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.05 });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

export function refreshScroll(delay = 0) {
  window.setTimeout(() => ScrollTrigger.refresh(), delay);
}

export { gsap, ScrollTrigger };
