import { articles } from "../data/articles";
import { projects } from "../data/projects";
import { notes } from "../data/notes";
import { formatDate } from "./format";

const index = [
  ...articles.map((article) => ({
    type: "文章",
    id: article.slug,
    title: article.title,
    href: `/blog/${article.slug}`,
    excerpt: article.excerpt,
    meta: `${formatDate(article.date)} · ${article.category} · ${article.readingTime} MIN`,
    tags: article.tags,
    haystack: [
      article.title,
      article.excerpt,
      article.category,
      article.tags.join(" "),
      article.plain,
    ]
      .join(" ")
      .toLowerCase(),
  })),
  ...projects.map((project) => ({
    type: "项目",
    id: project.slug,
    title: project.title,
    href: `/projects/${project.slug}`,
    excerpt: project.desc,
    meta: `${project.year} · ${project.status}`,
    tags: project.tags,
    haystack: [
      project.title,
      project.subtitle,
      project.desc,
      project.tags.join(" "),
      project.content,
    ]
      .join(" ")
      .toLowerCase(),
  })),
  ...notes.map((note) => ({
    type: "短记",
    id: note.id,
    title: `${note.emoji} ${note.tag}`,
    href: note.article ? `/blog/${note.article}` : "/#notes",
    excerpt: note.text,
    meta: formatDate(note.date),
    tags: [note.tag],
    haystack: `${note.tag} ${note.text}`.toLowerCase(),
  })),
];

export const searchPool = index;

export function searchAll(query, limit = 9) {
  const keyword = String(query || "").trim().toLowerCase();
  if (!keyword) return [];

  const terms = keyword.split(/\s+/).filter(Boolean);
  const results = [];

  for (const entry of index) {
    let score = 0;
    const title = entry.title.toLowerCase();

    for (const term of terms) {
      if (title === term) score += 120;
      if (title.includes(term)) score += 45;
      if (entry.tags?.some((tag) => tag.toLowerCase().includes(term))) score += 20;

      let hits = 0;
      let from = 0;
      while (hits < 8) {
        const at = entry.haystack.indexOf(term, from);
        if (at === -1) break;
        hits += 1;
        from = at + term.length;
      }
      score += hits * 4;
    }

    if (score > 0) results.push({ ...entry, score });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"]/g,
    (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch])
  );

/** 把命中的关键词包成 <mark> */
export function highlight(text, query) {
  const source = String(text || "");
  const terms = String(query || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (!terms.length) return escapeHtml(source);

  const pattern = new RegExp(`(${terms.join("|")})`, "i");
  // split 结果按捕获组交替: 偶数位是普通文本, 奇数位是命中项
  return source
    .split(pattern)
    .map((part, index) =>
      index % 2 === 1 ? `<mark>${escapeHtml(part)}</mark>` : escapeHtml(part)
    )
    .join("");
}
