/**
 * 生成 RSS feed: public/feed.xml
 * ---------------------------------------------------------------
 * 只读 src/data/articles.js 里的元数据(slug/title/date/tags/excerpt),
 * 正文由前端渲染, feed 里只放摘要与链接。
 *
 * 用法: npm run feed
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = fs.readFileSync(path.join(root, "src/data/articles.js"), "utf8");

const start = source.indexOf("const rawArticles = [");
const end = source.indexOf("\n];", start);
if (start === -1 || end === -1) {
  throw new Error("找不到 rawArticles 数组, 请检查 src/data/articles.js 的结构");
}

const block = source
  .slice(start + "const rawArticles = ".length, end + 2)
  .replace(/content:\s*content\w+/g, 'content: ""');

// eslint-disable-next-line no-new-func
const articles = new Function(`return (${block});`)();

const site = {
  title: "Hank 的技术博客",
  link: "https://example.com",
  description: "一个关于前端、可视化与工程化折腾记录的个人技术博客。",
  language: "zh-CN",
};

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toRfc822 = (iso) => {
  const date = new Date(`${iso}T09:00:00+08:00`);
  return date.toUTCString();
};

const items = [...articles]
  .sort((a, b) => (a.date < b.date ? 1 : -1))
  .map((article) => {
    const url = `${site.link}/blog/${article.slug}`;
    const categories = [article.category, ...(article.tags || [])]
      .map((name) => `      <category>${escapeXml(name)}</category>`)
      .join("\n");

    return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${toRfc822(article.date)}</pubDate>
      <description>${escapeXml(article.excerpt)}</description>
${categories}
    </item>`;
  })
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.title)}</title>
    <link>${escapeXml(site.link)}</link>
    <description>${escapeXml(site.description)}</description>
    <language>${site.language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(site.link)}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

const outDir = path.join(root, "public");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "feed.xml"), xml, "utf8");
console.log(`✅ 已生成 public/feed.xml (${articles.length} 篇)`);
