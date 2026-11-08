import gsap from "gsap";
import { hasFinePointer, prefersReducedMotion } from "./scroll";

/* ============================================================
   1. 光标方点
   ============================================================ */
let ringEl = null;
let ringX = 0;
let ringY = 0;
let targetX = 0;
let targetY = 0;
let ringBooted = false;

export function initCursorRing() {
  if (ringBooted || !hasFinePointer() || prefersReducedMotion()) return;
  ringBooted = true;

  ringEl = document.createElement("div");
  ringEl.id = "cursor-dot";
  ringEl.setAttribute("aria-hidden", "true");
  document.body.appendChild(ringEl);

  const setX = gsap.quickSetter(ringEl, "x", "px");
  const setY = gsap.quickSetter(ringEl, "y", "px");

  window.addEventListener(
    "mousemove",
    (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      ringEl.classList.add("is-visible");
    },
    { passive: true }
  );

  document.addEventListener("mouseover", (event) => {
    const hit = event.target.closest?.("a, button, [data-cursor-hover]");
    gsap.to(ringEl, { scale: hit ? 2.4 : 1, duration: 0.26, overwrite: "auto" });
    ringEl.classList.toggle("is-hovering", !!hit);
  });

  document.documentElement.addEventListener("mouseleave", () =>
    ringEl.classList.add("is-hidden")
  );
  document.documentElement.addEventListener("mouseenter", () =>
    ringEl.classList.remove("is-hidden")
  );

  gsap.ticker.add(() => {
    ringX += (targetX - ringX) * 0.18;
    ringY += (targetY - ringY) * 0.18;
    setX(ringX);
    setY(ringY);
  });
}

/* ============================================================
   2. 磁性按钮
   ============================================================ */
const MAGNETIC_SELECTOR = ".btn, [data-magnetic]";

export function enhanceMagnetic(root = document) {
  if (!hasFinePointer() || prefersReducedMotion()) return;

  root.querySelectorAll(MAGNETIC_SELECTOR).forEach((el) => {
    if (el.dataset.magneticBound === "1") return;
    el.dataset.magneticBound = "1";

    const strength = Number(el.dataset.magneticStrength || 0.24);

    el.addEventListener("mousemove", (event) => {
      const rect = el.getBoundingClientRect();
      gsap.to(el, {
        x: (event.clientX - rect.left - rect.width / 2) * strength,
        y: (event.clientY - rect.top - rect.height / 2) * strength,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    });

    el.addEventListener("mouseleave", () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.45)",
        overwrite: "auto",
      });
    });
  });
}

/* ============================================================
   3. 滚动显现
   ============================================================ */
let revealObserver = null;

function finishReveal(node) {
  node.removeAttribute("data-reveal");
  node.removeAttribute("data-reveal-children");
  gsap.set(node, { clearProps: "all" });
  [...node.children].forEach((child) => gsap.set(child, { clearProps: "all" }));
  revealRegistry.delete(node);
}

function setupRevealObserver() {
  if (revealObserver) return revealObserver;

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        revealObserver.unobserve(el);

        if (el.hasAttribute("data-reveal-children")) {
          const kids = [...el.children];
          if (!kids.length) {
            finishReveal(el);
            return;
          }
          gsap.fromTo(
            kids,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.74,
              ease: "power3.out",
              stagger: 0.075,
              onComplete: () => finishReveal(el),
            }
          );
        } else {
          gsap.fromTo(
            el,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.78,
              ease: "power3.out",
              onComplete: () => finishReveal(el),
            }
          );
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  return revealObserver;
}

export function observeReveals(root = document) {
  const targets = root.querySelectorAll("[data-reveal], [data-reveal-children]");
  if (!targets.length) return;

  if (prefersReducedMotion()) {
    targets.forEach(finishReveal);
    return;
  }

  const observer = setupRevealObserver();
  targets.forEach((el) => {
    revealRegistry.add(el);
    observer.observe(el);
  });

  ensureRevealSweep();
}

/* ------------------------------------------------------------
   兜底: 瞬间跳转(锚点 / 刷新恢复 / 拖滚动条)时,
   IntersectionObserver 可能一个元素都没碰到, 内容会永远停在 opacity:0。
   检测到「大跨度滚动」就直接把越过触发线的元素显现。
   ------------------------------------------------------------ */
const revealRegistry = new Set();
let lastRevealScrollY = 0;
let sweepBooted = false;
let suppressUntil = 0;

function revealInstantly(el) {
  revealObserver?.unobserve(el);
  gsap.killTweensOf(el);
  [...el.children].forEach((child) => gsap.killTweensOf(child));
  finishReveal(el);
  revealRegistry.delete(el);
}

function sweepReveals() {
  const vh = window.innerHeight;
  for (const el of [...revealRegistry]) {
    if (el.getBoundingClientRect().top < vh * 0.96) revealInstantly(el);
  }
}

/** 换页时抑制兜底扫描, 让新页面保留入场动画 */
export function suppressRevealSweep(ms = 800) {
  suppressUntil = performance.now() + ms;
  lastRevealScrollY = window.scrollY;
}

function ensureRevealSweep() {
  if (sweepBooted) return;
  sweepBooted = true;
  lastRevealScrollY = window.scrollY;

  let frame = 0;
  window.addEventListener(
    "scroll",
    () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const delta = Math.abs(y - lastRevealScrollY);
        lastRevealScrollY = y;

        if (performance.now() < suppressUntil) return;
        if (delta > window.innerHeight * 0.8) sweepReveals();
      });
    },
    { passive: true }
  );
}

/** 供路由切换 / 锚点跳转后手动补一次 */
export function sweepRevealsNow() {
  if (!revealRegistry.size) return;
  lastRevealScrollY = window.scrollY;
  sweepReveals();
}

/* ============================================================
   4. 跑马灯: 滚动越快跑得越快
   ============================================================ */
let marqueeAnims = [];
let marqueeRate = 1;
let lastScrollY = 0;
let marqueeBooted = false;

export function refreshMarquee() {
  marqueeAnims = document
    .getAnimations()
    .filter(
      (animation) =>
        animation.animationName === "marquee-scroll" ||
        animation.animationName === "marquee"
    );
}

export function initMarqueeRate() {
  if (marqueeBooted || prefersReducedMotion()) return;
  marqueeBooted = true;

  refreshMarquee();
  lastScrollY = window.scrollY;
  let frame = 0;

  gsap.ticker.add(() => {
    frame += 1;
    // CSS 动画可能比脚本晚一帧注册, 空集合时定期补采一次
    if (!marqueeAnims.length && frame % 45 === 0) refreshMarquee();

    const y = window.scrollY;
    const delta = y - lastScrollY;
    lastScrollY = y;

    const target = Math.min(5, Math.max(1, 1 + Math.abs(delta) * 0.06));
    marqueeRate += (target - marqueeRate) * 0.08;
    if (Math.abs(marqueeRate - 1) < 0.01) marqueeRate = 1;

    for (const animation of marqueeAnims) {
      try {
        animation.playbackRate = marqueeRate;
      } catch {
        /* 动画可能已被销毁 */
      }
    }
  });
}

/* ============================================================
   5. 代码块复制
   ============================================================ */
let copyBooted = false;

export function initCodeCopy() {
  if (copyBooted) return;
  copyBooted = true;

  document.addEventListener("click", async (event) => {
    const button = event.target.closest?.("[data-copy]");
    if (!button) return;

    const wrap = button.closest(".code-wrap");
    const code = wrap?.querySelector("pre")?.innerText ?? "";

    try {
      await navigator.clipboard.writeText(code);
      button.textContent = "已复制";
    } catch {
      button.textContent = "复制失败";
    }

    button.classList.add("is-copied");
    window.setTimeout(() => {
      button.textContent = "复制";
      button.classList.remove("is-copied");
    }, 1600);
  });
}

/* ============================================================
   6. 切走标签页时改标题
   ============================================================ */
let titleBooted = false;

export function initTitleWatcher() {
  if (titleBooted) return;
  titleBooted = true;

  let restoreTitle = document.title;
  let timer = null;

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      restoreTitle = document.title;
      document.title = "… 回来再看";
    } else {
      document.title = "好,继续";
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        document.title = restoreTitle;
      }, 1400);
    }
  });
}

/* ============================================================
   7. 彩蛋
   ============================================================ */
const BOOM_WORDS = ["✳", "△", "□", "○", "WIP", "✓", "//", "★"];

export function spawnBoom(x, y, word) {
  if (prefersReducedMotion()) return;

  const el = document.createElement("span");
  el.className = "boom";
  el.textContent = word || BOOM_WORDS[Math.floor(Math.random() * BOOM_WORDS.length)];
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.fontSize = `${14 + Math.random() * 10}px`;
  document.body.appendChild(el);

  gsap.fromTo(
    el,
    { opacity: 0, scale: 0.6, y: 0, rotate: -8 },
    {
      opacity: 1,
      scale: 1,
      y: -60 - Math.random() * 40,
      rotate: 8,
      duration: 0.85,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(el, {
          opacity: 0,
          y: "-=30",
          duration: 0.4,
          delay: 0.12,
          onComplete: () => el.remove(),
        });
      },
    }
  );
}

/* ============================================================
   8. 数字滚动
   ============================================================ */
export function countUp(el, to, options = {}) {
  if (!el) return;
  const { duration = 1.5, suffix = "", delay = 0 } = options;

  if (prefersReducedMotion()) {
    el.textContent = `${to}${suffix}`;
    return;
  }

  const proxy = { value: 0 };
  gsap.to(proxy, {
    value: to,
    duration,
    delay,
    ease: "power2.out",
    onUpdate: () => {
      el.textContent = `${Math.round(proxy.value)}${suffix}`;
    },
  });
}

/* ============================================================
   9. 一次性全局初始化
   ============================================================ */
let globalsBooted = false;

export function initGlobalMotion() {
  if (globalsBooted) return;
  globalsBooted = true;

  initCursorRing();
  initCodeCopy();
  initTitleWatcher();
  initMarqueeRate();
}
