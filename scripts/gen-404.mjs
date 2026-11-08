/**
 * GitHub Pages 不支持 history 路由的服务端兜底。
 * 把 index.html 复制成 404.html, 深链(如 /blog-frontend/blog/xxx) 被 404 后
 * 返回的仍是应用本体, 由 vue-router 接住并渲染对应页面, 不会出现 GitHub 默认 404 页。
 */
import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const dist = resolve("dist");
const indexFile = resolve(dist, "index.html");

if (!existsSync(indexFile)) {
  console.error("dist/index.html 不存在, 请先执行 vite build");
  process.exit(1);
}

copyFileSync(indexFile, resolve(dist, "404.html"));
console.log("✓ 已生成 dist/404.html（SPA 深链兜底）");
