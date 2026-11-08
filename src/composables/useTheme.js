import { ref, readonly } from "vue";
import { prefersReducedMotion } from "../lib/scroll";

const STORAGE_KEY = "blog-theme";
const theme = ref("light");

const THEME_COLORS = {
  light: "#ffffff",
  dark: "#1b1233",
};

function apply(value, animate = false) {
  theme.value = value;
  const root = document.documentElement;
  root.dataset.theme = value;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLORS[value] || "#ffffff");

  if (animate) {
    root.classList.add("theme-animate");
    window.setTimeout(() => root.classList.remove("theme-animate"), 500);
  }

  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* 忽略隐私模式写入失败 */
  }
}

/**
 * 与参考站一致: 默认白底, 不跟随系统深色偏好。
 */
export function initTheme() {
  const saved = document.documentElement.dataset.theme;
  if (saved === "dark" || saved === "light") {
    theme.value = saved;
    return;
  }
  apply("light");
}

/**
 * 主题切换: View Transition 可用时做一次圆形扩散, 否则降级为普通过渡。
 */
export function toggleTheme(event) {
  const next = theme.value === "dark" ? "light" : "dark";

  const commit = () => apply(next, true);

  const canTransition =
    typeof document.startViewTransition === "function" && !prefersReducedMotion();

  if (!canTransition) {
    commit();
    return;
  }

  const x = event?.clientX ?? window.innerWidth - 60;
  const y = event?.clientY ?? 40;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const transition = document.startViewTransition(commit);

  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 560,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    })
    .catch(() => {
      /* 过渡被取消时忽略 */
    });
}

export function useTheme() {
  return {
    theme: readonly(theme),
    toggleTheme,
  };
}
