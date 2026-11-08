import { toPlainText } from "./markdown";

const MONTHS = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

export function parseDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

/** 2026-11-02 -> 2026年11月2日 */
export function formatDate(value) {
  const d = parseDate(value);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 2026-11-02 -> 11.2 */
export function formatMonthDay(value) {
  const d = parseDate(value);
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

/** 2026-11-02 -> 11 月 */
export function formatMonth(value) {
  return MONTHS[parseDate(value).getMonth()];
}

export function yearOf(value) {
  return parseDate(value).getFullYear();
}

/** 2026-11-02 -> 2026-11 */
export function monthKey(value) {
  const d = parseDate(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function relativeTime(value) {
  const then = parseDate(value).getTime();
  const diff = Date.now() - then;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "刚刚";
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < 30 * day) return `${Math.floor(diff / day)} 天前`;
  if (diff < 365 * day) return `${Math.floor(diff / (30 * day))} 个月前`;
  return `${Math.floor(diff / (365 * day))} 年前`;
}

/** 中文按字数、英文按词数, 300 字/分钟 */
export function readingTime(source) {
  const text = toPlainText(source);
  const cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const words = text
    .replace(/[\u4e00-\u9fa5]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.ceil((cjk + words * 1.6) / 320);
  return Math.max(1, minutes);
}

export function groupByYear(items, key = "date") {
  const map = new Map();
  [...items]
    .sort((a, b) => parseDate(b[key]) - parseDate(a[key]))
    .forEach((item) => {
      const year = yearOf(item[key]);
      if (!map.has(year)) map.set(year, []);
      map.get(year).push(item);
    });
  return [...map.entries()].map(([year, list]) => ({ year, items: list }));
}

export function groupByMonth(items, key = "date") {
  const groups = [];
  [...items]
    .sort((a, b) => parseDate(b[key]) - parseDate(a[key]))
    .forEach((item) => {
      const keyValue = monthKey(item[key]);
      const last = groups[groups.length - 1];
      if (last && last.key === keyValue) {
        last.items.push(item);
      } else {
        groups.push({ key: keyValue, label: formatMonth(item[key]), items: [item] });
      }
    });
  return groups;
}

export function padNumber(value) {
  return String(value).padStart(2, "0");
}

export function truncate(text, length = 120) {
  const value = String(text || "");
  return value.length > length ? `${value.slice(0, length).trim()}…` : value;
}
