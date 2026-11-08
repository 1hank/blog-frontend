export const site = {
  /** 站点身份 */
  name: "Hank",
  mark: "TECH BLOG",
  brand: "Hank 的技术博客",
  fullName: "Hank Chen",
  role: "FRONTEND & VISUALIZATION",
  tagline: "写代码,也写清楚为什么。",
  description:
    "一个前端工程师的工作记录:可视化、工程化,以及那些当场没想明白、事后必须写下来的事。",

  intro:
    "这里放三类东西:做过的可视化项目、被性能问题教育过的现场记录、以及一些工程化上的取舍。少量结论,大量过程。",

  since: 2024,
  location: "Hangzhou, China",

  email: "hi@hank.dev",
  github: "https://github.com/hank-dev",

  status: {
    label: "NOW",
    text: "在给 WebGL 编辑器补光照",
  },

  socials: [
    { label: "GitHub", href: "https://github.com/hank-dev", external: true },
    { label: "Email", href: "mailto:hi@hank.dev", external: true },
    { label: "RSS", href: "/feed.xml", external: false },
  ],

  nav: [
    { label: "首页", to: "/", name: "Home" },
    { label: "博客", to: "/blog", name: "BlogList" },
    { label: "项目", to: "/projects", name: "Projects" },
    { label: "留言", to: "/guestbook", name: "Guestbook" },
    { label: "标签", to: "/tags", name: "Tags" },
    { label: "归档", to: "/archive", name: "Archive" },
    { label: "关于", to: "/about", name: "About" },
  ],

  footerNav: [
    { label: "博客", to: "/blog" },
    { label: "项目", to: "/projects" },
    { label: "标签", to: "/tags" },
    { label: "归档", to: "/archive" },
    { label: "留言", to: "/guestbook" },
    { label: "关于", to: "/about" },
  ],

  /** 细线跑马灯的词条 */
  ticker: [
    "Vue 3",
    "Three.js",
    "WebGL",
    "Canvas",
    "性能预算",
    "可视化",
    "工程化",
    "写下来才算懂",
  ],

  skills: [
    "TypeScript",
    "Vue 3",
    "Three.js",
    "WebGL",
    "Canvas",
    "GSAP",
    "Vite",
    "Tailwind CSS",
    "Node",
    "GitHub Actions",
  ],
};

export default site;
