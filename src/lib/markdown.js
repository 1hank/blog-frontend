/**
 * 极简 Markdown 渲染器
 * ---------------------------------------------------------------
 * 只支持写博客真正会用到的语法, 但把代码块做成了带 mac 窗口栏的
 * 结构(红黄绿三点 + 语言标签 + 复制按钮), 并把标题收集出来给 TOC 用。
 */

const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

const escapeHtml = (str) =>
  String(str).replace(/[&<>"]/g, (ch) => ESCAPE_MAP[ch]);

export function slugify(text) {
  return String(text)
    .replace(/[`*_~[\]()#!]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function stripInline(text) {
  return String(text)
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/==([^=]+)==/g, "$1")
    .trim();
}

/* ------------------------------------------------------------------ */
/* 行内语法                                                            */
/* ------------------------------------------------------------------ */
function renderInline(raw) {
  const codes = [];
  let s = String(raw).replace(/`([^`]+)`/g, (_, code) => {
    codes.push(code);
    return `\u0000${codes.length - 1}\u0000`;
  });

  s = escapeHtml(s);

  // 图片
  s = s.replace(
    /!\[([^\]]*)\]\(([^)\s]+)\)/g,
    (_, alt, src) =>
      `<img src="${src}" alt="${alt}" loading="lazy" decoding="async" />`
  );

  // 链接
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => {
    const external = /^https?:\/\//.test(href)
      ? ' target="_blank" rel="noopener noreferrer"'
      : "";
    return `<a href="${href}"${external}>${text}</a>`;
  });

  // 强调
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  s = s.replace(/==([^=]+)==/g, "<mark>$1</mark>");

  // 还原行内代码
  s = s.replace(
    /\u0000(\d+)\u0000/g,
    (_, index) => `<code>${escapeHtml(codes[Number(index)])}</code>`
  );

  return s;
}

/* ------------------------------------------------------------------ */
/* 代码高亮(够用就行的轻量版)                                          */
/* ------------------------------------------------------------------ */
const KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "new", "class", "extends", "import", "from", "export", "default", "await",
  "async", "try", "catch", "finally", "throw", "typeof", "instanceof", "in",
  "of", "this", "super", "void", "delete", "yield", "static", "get", "set",
  "public", "private", "protected", "interface", "type", "enum", "implements",
  "package", "final", "boolean", "int", "long", "double", "float", "char",
  "String", "true", "false", "null", "undefined", "switch", "case", "break",
  "continue", "do", "def", "elif", "pass", "lambda", "with", "as", "and",
  "or", "not", "is", "None", "True", "False", "self", "print", "use", "fn",
  "let", "mut", "impl", "struct", "match", "where", "select", "insert",
]);

const HASH_COMMENT_LANGS = new Set([
  "bash", "sh", "shell", "zsh", "py", "python", "yaml", "yml", "toml", "ini",
  "conf", "dockerfile", "dotenv", "makefile",
]);

const HTML_LANGS = new Set(["html", "xml", "vue", "svelte", "svg"]);

function tokenize(code, lang) {
  const hashComment = HASH_COMMENT_LANGS.has(lang);
  const commentParts = ["\\/\\*[\\s\\S]*?\\*\\/", "\\/\\/[^\\n]*"];
  if (hashComment) commentParts.push("#[^\\n]*");
  if (HTML_LANGS.has(lang)) commentParts.push("<!--[\\s\\S]*?-->");

  const comment = `(?:${commentParts.join("|")})`;
  const string = "(?:\"(?:\\\\.|[^\"\\\\\\n])*\"|'(?:\\\\.|[^'\\\\\\n])*'|`(?:\\\\.|[^`\\\\])*`)";
  const number = "(?:\\b\\d[\\d._]*\\b)";
  const identifier = "([A-Za-z_$][\\w$]*)";

  const re = new RegExp(`(${comment})|(${string})|(${number})|${identifier}`, "g");

  let out = "";
  let last = 0;
  let match;

  while ((match = re.exec(code)) !== null) {
    if (match.index > last) out += escapeHtml(code.slice(last, match.index));

    const [full, isComment, isString, isNumber, isWord] = match;

    if (isComment) {
      out += `<span class="tok-com">${escapeHtml(full)}</span>`;
    } else if (isString) {
      out += `<span class="tok-str">${escapeHtml(full)}</span>`;
    } else if (isNumber) {
      out += `<span class="tok-num">${escapeHtml(full)}</span>`;
    } else if (isWord && KEYWORDS.has(isWord)) {
      out += `<span class="tok-kw">${escapeHtml(full)}</span>`;
    } else if (
      isWord &&
      /^\s*\(/.test(code.slice(match.index + full.length))
    ) {
      out += `<span class="tok-fn">${escapeHtml(full)}</span>`;
    } else {
      out += escapeHtml(full);
    }

    last = match.index + full.length;
  }

  if (last < code.length) out += escapeHtml(code.slice(last));
  return out;
}

function renderCodeBlock(code, lang) {
  const language = (lang || "text").toLowerCase();
  const label = escapeHtml(lang || "code");
  return [
    '<div class="code-wrap">',
    '<div class="code-bar">',
    '<span class="dots"><i></i><i></i><i></i></span>',
    `<span class="code-lang">${label}</span>`,
    '<button type="button" class="copy-btn" data-copy>复制</button>',
    "</div>",
    `<pre data-lang="${language}"><code>${tokenize(code, language)}</code></pre>`,
    "</div>",
  ].join("");
}

/* ------------------------------------------------------------------ */
/* 块级语法                                                            */
/* ------------------------------------------------------------------ */
const isBlank = (line) => /^\s*$/.test(line);
const LIST_RE = /^(\s*)(?:[-*+]|\d+[.)])\s+/;

function isBlockStart(line) {
  return (
    isBlank(line) ||
    /^\s*```/.test(line) ||
    /^#{1,6}\s+/.test(line) ||
    /^\s*\|/.test(line) ||
    /^\s*>/.test(line) ||
    LIST_RE.test(line) ||
    /^\s*([-*_])\1{2,}\s*$/.test(line)
  );
}

function splitRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderList(lines, start) {
  const first = lines[start].match(LIST_RE);
  const ordered = /^\s*\d+[.)]\s+/.test(lines[start]);
  const baseIndent = first[1].length;
  const itemRe = ordered ? /^(\s*)\d+[.)]\s+(.*)$/ : /^(\s*)[-*+]\s+(.*)$/;
  const items = [];
  let i = start;

  while (i < lines.length) {
    const match = lines[i].match(itemRe);
    if (!match) {
      if (isBlank(lines[i]) && lines[i + 1] && itemRe.test(lines[i + 1])) {
        i += 1;
        continue;
      }
      if (items.length && !isBlank(lines[i]) && !isBlockStart(lines[i])) {
        items[items.length - 1].text += " " + lines[i].trim();
        i += 1;
        continue;
      }
      break;
    }

    const indent = match[1].length;
    if (indent < baseIndent) break;

    if (indent > baseIndent && items.length) {
      const nested = renderList(lines, i);
      items[items.length - 1].children.push(nested.html);
      i = nested.next;
      continue;
    }

    items.push({ text: match[2], children: [] });
    i += 1;
  }

  const tag = ordered ? "ol" : "ul";
  const html = `<${tag}>${items
    .map(
      (item) =>
        `<li>${renderInline(item.text)}${item.children.join("")}</li>`
    )
    .join("")}</${tag}>`;

  return { html, next: i };
}

function renderTable(lines, start) {
  const header = splitRow(lines[start]);
  let i = start + 2;
  const rows = [];
  while (i < lines.length && /^\s*\|/.test(lines[i])) {
    rows.push(splitRow(lines[i]));
    i += 1;
  }

  const head = header.map((cell) => `<th>${renderInline(cell)}</th>`).join("");
  const body = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join("")}</tr>`
    )
    .join("");

  return {
    html: `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`,
    next: i,
  };
}

function renderQuote(lines, start) {
  const buffer = [];
  let i = start;
  while (i < lines.length && /^\s*>/.test(lines[i])) {
    buffer.push(lines[i].replace(/^\s*>\s?/, ""));
    i += 1;
  }
  const paragraphs = buffer
    .join("\n")
    .split(/\n{2,}/)
    .filter((block) => block.trim())
    .map((block) => `<p>${renderInline(block.replace(/\n/g, " "))}</p>`)
    .join("");
  return { html: `<blockquote>${paragraphs}</blockquote>`, next: i };
}

/**
 * @param {string} source markdown 源码
 * @returns {{ html: string, headings: Array<{level:number,text:string,id:string}> }}
 */
export function renderMarkdown(source) {
  const lines = String(source || "")
    .replace(/\r\n?/g, "\n")
    .split("\n");
  const html = [];
  const headings = [];
  const usedIds = new Set();
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (isBlank(line)) {
      i += 1;
      continue;
    }

    // 代码围栏
    const fence = line.match(/^\s*```(\S*)\s*$/);
    if (fence) {
      const lang = fence[1];
      const buffer = [];
      i += 1;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        buffer.push(lines[i]);
        i += 1;
      }
      i += 1; // 跳过结束围栏
      html.push(renderCodeBlock(buffer.join("\n"), lang));
      continue;
    }

    // 标题
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].trim();
      const base = slugify(stripInline(text)) || `section-${headings.length + 1}`;
      let id = base;
      let suffix = 2;
      while (usedIds.has(id)) {
        id = `${base}-${suffix}`;
        suffix += 1;
      }
      usedIds.add(id);
      headings.push({ level, text: stripInline(text), id });
      html.push(
        `<h${level} id="${id}">${renderInline(text)}<a class="heading-anchor" href="#${id}" aria-label="此节锚点">#</a></h${level}>`
      );
      i += 1;
      continue;
    }

    // 分隔线
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      html.push("<hr />");
      i += 1;
      continue;
    }

    // 表格
    if (
      /^\s*\|/.test(line) &&
      i + 1 < lines.length &&
      /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(lines[i + 1])
    ) {
      const table = renderTable(lines, i);
      html.push(table.html);
      i = table.next;
      continue;
    }

    // 引用
    if (/^\s*>/.test(line)) {
      const quote = renderQuote(lines, i);
      html.push(quote.html);
      i = quote.next;
      continue;
    }

    // 列表
    if (LIST_RE.test(line)) {
      const list = renderList(lines, i);
      html.push(list.html);
      i = list.next;
      continue;
    }

    // 段落
    const buffer = [];
    while (i < lines.length && !isBlockStart(lines[i])) {
      buffer.push(lines[i]);
      i += 1;
    }
    html.push(`<p>${renderInline(buffer.join(" "))}</p>`);
  }

  return { html: html.join("\n"), headings };
}

/** 提取纯文本, 用于阅读时长 / 搜索索引 */
export function toPlainText(source) {
  return String(source || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`~\-|]/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}
