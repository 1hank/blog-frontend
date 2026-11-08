import contentEffectSystem from "../content/posts/vue-effect-system.md?raw";
import contentFirstFrame from "../content/posts/three-first-frame.md?raw";
import contentMemoryLeak from "../content/posts/webgl-memory-leak.md?raw";
import contentSse from "../content/posts/sse-vs-websocket.md?raw";
import contentDotField from "../content/posts/canvas-dot-field.md?raw";
import contentTailwind from "../content/posts/tailwind-kept-12.md?raw";
import contentVite from "../content/posts/vite-build-profile.md?raw";
import contentCi from "../content/posts/ci-that-runs.md?raw";
import contentWriting from "../content/posts/writing-like-product.md?raw";
import contentRewrite from "../content/posts/rewrite-admin-regret.md?raw";
import contentEcharts from "../content/posts/echarts-dashboards.md?raw";
import contentOffline from "../content/posts/offline-first-notes.md?raw";

import { readingTime, parseDate } from "../lib/format";
import { toPlainText } from "../lib/markdown";

/** 全部文章(虚构数据, 无后端依赖) */
const rawArticles = [
  {
    slug: "vue-effect-system",
    title: "Vue 3 里做一套能维护的动效系统",
    date: "2026-11-06",
    category: "技术分享",
    tags: ["Vue3", "GSAP", "架构"],
    excerpt:
      "声明式和命令式分开、观察者只建一个、卸载清单固定三条 —— 把散落在二十个组件里的动效收成一层。",
    featured: true,
    content: contentEffectSystem,
  },
  {
    slug: "three-first-frame",
    title: "Three.js 场景的第一帧:把首屏压进 1.5 秒",
    date: "2026-11-04",
    category: "前端可视化",
    tags: ["Three.js", "WebGL", "性能"],
    excerpt:
      "首屏慢的原因分三段:资源、解析上传、着色器编译。多数人只优化第一段,而第三段最容易被忽略。",
    featured: true,
    series: { name: "前端可视化手册", index: 1, total: 4 },
    content: contentFirstFrame,
  },
  {
    slug: "webgl-memory-leak",
    title: "一次 WebGL 内存泄漏的排查记录",
    date: "2026-10-31",
    category: "踩坑记录",
    tags: ["WebGL", "性能", "DevTools"],
    excerpt:
      "切换房间二十次后 GPU 进程崩溃。三次排查、一张监控表,把偶发崩溃变成可以盯着看的数字。",
    series: { name: "前端可视化手册", index: 2, total: 4 },
    content: contentMemoryLeak,
  },
  {
    slug: "sse-vs-websocket",
    title: "SSE 还是 WebSocket:实时看板的数据通道取舍",
    date: "2026-10-28",
    category: "工程化",
    tags: ["SSE", "WebSocket", "Vue3"],
    excerpt:
      "数据流是单向的,就没必要用双向协议。换掉之后少了两百行重连逻辑,也少了运维的一堆配置。",
    content: contentSse,
  },
  {
    slug: "canvas-dot-field",
    title: "用 Canvas 画一张会呼吸的点阵背景",
    date: "2026-10-24",
    category: "前端可视化",
    tags: ["Canvas", "动效"],
    excerpt:
      "CSS 版和 Canvas 版的取舍、鼠标位置为什么要缓动、以及一个反直觉的优化:不动就不重绘。",
    series: { name: "前端可视化手册", index: 3, total: 4 },
    content: contentDotField,
  },
  {
    slug: "tailwind-kept-12",
    title: "三年 Tailwind,最后只留下 12 个自定义类",
    date: "2026-10-21",
    category: "技术分享",
    tags: ["CSS", "Tailwind", "设计系统"],
    excerpt:
      "自定义类膨胀的根因不是「抽类」,是没有边界。这是活下来的 12 个,和删掉它们的理由。",
    featured: true,
    content: contentTailwind,
  },
  {
    slug: "vite-build-profile",
    title: "Vite 构建慢?先把这几个指标量出来",
    date: "2026-10-16",
    category: "工程化",
    tags: ["Vite", "性能", "构建"],
    excerpt:
      "冷启动、HMR、生产构建是三件事。混在一起谈,就会去优化错误的地方。附一份最终配置。",
    content: contentVite,
  },
  {
    slug: "ci-that-runs",
    title: "给前端项目加一层「能跑起来」的 CI",
    date: "2026-10-12",
    category: "工程化",
    tags: ["CI", "GitHub Actions", "规范"],
    excerpt:
      "最小可用版本只做三件事,四十秒跑完。但一定要开启「必需检查」,否则红色只是装饰品。",
    content: contentCi,
  },
  {
    slug: "writing-like-product",
    title: "结构化写作:让技术文档长得像产品",
    date: "2026-10-07",
    category: "杂谈随笔",
    tags: ["写作", "文档"],
    excerpt:
      "结论、条件、细节,读者的耐心只有三层。附一张我写完必过的检查清单。",
    content: contentWriting,
  },
  {
    slug: "rewrite-admin-regret",
    title: "我把后台管理系统重写了一遍,然后后悔了三天",
    date: "2026-10-02",
    category: "杂谈随笔",
    tags: ["工程", "反思"],
    excerpt:
      "四个月、三个人、上线两周四十一个 bug。四个月后我承认:80% 的痛点,两周局部改造就能解决。",
    content: contentRewrite,
  },
  {
    slug: "echarts-dashboards",
    title: "ECharts 大屏的六个坑,和三个必做项",
    date: "2025-12-18",
    category: "前端可视化",
    tags: ["ECharts", "Vue3", "性能"],
    excerpt:
      "高亮不会自动取消、缩放会糊、容器尺寸变化不触发 resize —— 以及为什么要跑一次 24 小时。",
    content: contentEcharts,
  },
  {
    slug: "offline-first-notes",
    title: "断网三天,我做了个离线优先的笔记应用",
    date: "2025-09-22",
    category: "杂谈随笔",
    tags: ["PWA", "IndexedDB"],
    excerpt:
      "本地是事实来源,服务器只是副本。这套思路写下来,同步逻辑只用 240 行。",
    content: contentOffline,
  },
];

export const articles = rawArticles
  .map((article) => ({
    ...article,
    readingTime: readingTime(article.content),
    plain: toPlainText(article.content),
    href: `/blog/${article.slug}`,
  }))
  .sort((a, b) => parseDate(b.date) - parseDate(a.date));

/* ------------------------------------------------------------------ */
/* 派生数据                                                            */
/* ------------------------------------------------------------------ */
export const featuredArticles = articles.filter((article) => article.featured);
export const latestArticles = articles.slice(0, 4);

export const categories = [
  "全部",
  ...Array.from(new Set(articles.map((article) => article.category))),
];

export const tagCounts = articles.reduce((acc, article) => {
  article.tags.forEach((tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
  });
  return acc;
}, {});

export const tags = Object.entries(tagCounts)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

export const series = Array.from(
  articles
    .filter((article) => article.series)
    .reduce((map, article) => {
      const name = article.series.name;
      if (!map.has(name)) map.set(name, []);
      map.get(name).push(article);
      return map;
    }, new Map())
    .entries()
).map(([name, list]) => ({
  name,
  total: list[0].series.total,
  articles: list.sort((a, b) => a.series.index - b.series.index),
}));

/* ------------------------------------------------------------------ */
/* 查询函数                                                            */
/* ------------------------------------------------------------------ */
export function getArticle(slug) {
  return articles.find((article) => article.slug === slug) || null;
}

export function articlesByTag(tag) {
  return articles.filter((article) => article.tags.includes(tag));
}

export function articlesByCategory(category) {
  if (!category || category === "全部") return articles;
  return articles.filter((article) => article.category === category);
}

export function relatedArticles(article, limit = 3) {
  if (!article) return [];
  return articles
    .filter((item) => item.slug !== article.slug)
    .map((item) => {
      const shared = item.tags.filter((tag) => article.tags.includes(tag)).length;
      const sameCategory = item.category === article.category ? 1 : 0;
      return { item, score: shared * 2 + sameCategory };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}

export function adjacentArticles(slug) {
  const index = articles.findIndex((article) => article.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: articles[index + 1] || null,
    next: articles[index - 1] || null,
  };
}

export const stats = {
  posts: articles.length,
  tags: tags.length,
  years: new Set(articles.map((article) => article.date.slice(0, 4))).size,
  words: articles.reduce(
    (total, article) => total + article.plain.replace(/\s/g, "").length,
    0
  ),
};
