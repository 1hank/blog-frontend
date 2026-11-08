import { createRouter, createWebHistory } from "vue-router";
import { blinds } from "../lib/blinds";
import { prefersReducedMotion, scrollToTop, scrollToSelector } from "../lib/scroll";
import { suppressRevealSweep } from "../lib/motion";
import { getArticle } from "../data/articles";
import { getProject } from "../data/projects";

import Home from "../views/Home.vue";
import BlogList from "../views/BlogList.vue";
import BlogDetail from "../views/BlogDetail.vue";
import Projects from "../views/Projects.vue";
import ProjectDetail from "../views/ProjectDetail.vue";
import Tags from "../views/Tags.vue";
import TagDetail from "../views/TagDetail.vue";
import Archive from "../views/Archive.vue";
import Guestbook from "../views/Guestbook.vue";
import About from "../views/About.vue";
import NotFound from "../views/NotFound.vue";

const routes = [
  { path: "/", name: "Home", component: Home, meta: { title: "首页" } },
  { path: "/blog", name: "BlogList", component: BlogList, meta: { title: "博客" } },
  { path: "/blog/:slug", name: "BlogDetail", component: BlogDetail, meta: { title: "文章" } },
  { path: "/projects", name: "Projects", component: Projects, meta: { title: "项目" } },
  {
    path: "/projects/:slug",
    name: "ProjectDetail",
    component: ProjectDetail,
    meta: { title: "项目" },
  },
  { path: "/tags", name: "Tags", component: Tags, meta: { title: "标签" } },
  { path: "/tags/:tag", name: "TagDetail", component: TagDetail, meta: { title: "标签" } },
  { path: "/archive", name: "Archive", component: Archive, meta: { title: "归档" } },
  { path: "/guestbook", name: "Guestbook", component: Guestbook, meta: { title: "留言板" } },
  { path: "/about", name: "About", component: About, meta: { title: "关于" } },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
    meta: { title: "页面不存在" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const SITE_NAME = "Hank 的技术博客";
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 幕布转场守卫: 会话内第一次切页才播。
 */
router.beforeEach(async (to, from) => {
  if (!from.name) return true; // 首屏不播
  if (blinds.hasPlayed() || prefersReducedMotion()) return true;

  blinds.markPlayed();
  await Promise.race([blinds.cover(), wait(1200)]);
  return true;
});

router.afterEach((to) => {
  // 标题
  let title = SITE_NAME;

  if (to.name === "BlogDetail") {
    const article = getArticle(String(to.params.slug));
    title = article ? `${article.title} · ${SITE_NAME}` : `文章不存在 · ${SITE_NAME}`;
  } else if (to.name === "ProjectDetail") {
    const project = getProject(String(to.params.slug));
    title = project ? `${project.title} · ${SITE_NAME}` : `项目不存在 · ${SITE_NAME}`;
  } else if (to.name === "TagDetail") {
    let tag = String(to.params.tag);
    try {
      tag = decodeURIComponent(tag);
    } catch {
      /* 保持原样 */
    }
    title = `#${tag} · ${SITE_NAME}`;
  } else if (to.meta.title && to.name !== "Home") {
    title = `${to.meta.title} · ${SITE_NAME}`;
  }

  document.title = title;

  // 换页回到顶部(并抑制「大跨度滚动」兜底扫描, 保留新页面入场动画)
  suppressRevealSweep(900);
  scrollToTop(true);

  // 锚点
  if (to.hash) {
    window.setTimeout(() => scrollToSelector(to.hash, -90), 320);
  }
});

export default router;
