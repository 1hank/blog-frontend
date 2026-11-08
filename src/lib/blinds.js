import gsap from "gsap";
import { prefersReducedMotion } from "./scroll";

const STORAGE_KEY = "blog-blinds-used";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 幕布转场控制器
 * ---------------------------------------------------------------
 * 五块竖条从上方落下遮住屏幕, 新页面在幕布后渲染,
 * 随后幕布继续向下"穿页"而过。每个会话只播一次:
 *   1. 打开网站: 不播, 只走轻量入场
 *   2. 会话内第一次换页: 幕布登场, 只此一次
 *   3. 之后的换页: 交给 <transition> 的淡入
 */
export const blinds = {
  root: null,
  panels: [],
  label: null,

  bind(root) {
    this.root = root;
    this.panels = root ? [...root.querySelectorAll(".blinds__panel")] : [];
    this.label = root ? root.querySelector(".blinds__label") : null;
  },

  isPlaying() {
    return !!this.root && this.root.classList.contains("is-animating");
  },

  hasPlayed() {
    try {
      return !!sessionStorage.getItem(STORAGE_KEY);
    } catch {
      return true;
    }
  },

  markPlayed() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* 无痕模式下忽略 */
    }
  },

  /** 五块幕布自上而下落下 */
  async cover() {
    if (!this.root || !this.panels.length || prefersReducedMotion()) return;

    this.root.classList.add("is-animating");
    gsap.killTweensOf([...this.panels, this.label]);

    const tl = gsap.timeline();
    tl.set(this.panels, { yPercent: -101 })
      .to(this.panels, {
        yPercent: 0,
        duration: 0.42,
        ease: "power3.inOut",
        stagger: 0.05,
      })
      .to(this.label, { opacity: 1, duration: 0.22 }, "-=0.18");

    await tl.then();
  },

  /** 幕布继续向下走, 露出已经渲染好的新页面 */
  async reveal() {
    if (!this.root) return;

    if (prefersReducedMotion()) {
      this.root.classList.remove("is-animating");
      return;
    }

    gsap.killTweensOf([...this.panels, this.label]);

    const tl = gsap.timeline({
      onComplete: () => this.root.classList.remove("is-animating"),
    });
    tl.to(this.label, { opacity: 0, duration: 0.16 }).to(
      this.panels,
      {
        yPercent: 101,
        duration: 0.6,
        ease: "power4.inOut",
        stagger: 0.05,
      },
      "<0.04"
    );

    await tl.then();
  },

  /** 首次切页的完整流程(带超时兜底) */
  async firstTimeTransition() {
    if (!this.hasPlayed() && !prefersReducedMotion()) {
      this.markPlayed();
      await Promise.race([this.cover(), wait(1200)]);
    }
  },
};

export { wait };
