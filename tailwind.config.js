/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 全部挂 CSS 变量: 双主题热切换 + /透明度 修饰符
        bg: "rgb(var(--bg-rgb) / <alpha-value>)",
        soft: "rgb(var(--soft-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        line: "rgb(var(--border-rgb) / <alpha-value>)",
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        muted: "rgb(var(--muted-rgb) / <alpha-value>)",
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "InterVariable",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "Noto Sans SC",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "Cascadia Code",
          "Consolas",
          "Menlo",
          "Courier New",
          "monospace",
        ],
      },
      maxWidth: {
        prose: "66ch",
      },
      borderRadius: {
        DEFAULT: "3px",
      },
      transitionTimingFunction: {
        lux: "cubic-bezier(0.22, 1, 0.36, 1)",
        expo: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
