/** 短记(虚构数据) */
export const notes = [
  {
    id: "n1",
    date: "2026-11-05",
    emoji: "🔧",
    tag: "调试",
    text: "给编辑器加了一盏平行光,阴影条纹调了三小时。最后是 shadow.bias = -0.0005。这种参数没有推导过程,只有试。",
    article: "webgl-memory-leak",
  },
  {
    id: "n2",
    date: "2026-11-03",
    emoji: "📉",
    tag: "性能",
    text: "首屏的图表库从 1.2MB 换成按需注册,含样式总共 380KB。LCP 从 4.2s 到 1.6s —— 最大的一笔收益来自删代码。",
    article: "vite-build-profile",
  },
  {
    id: "n3",
    date: "2026-10-29",
    emoji: "🧪",
    tag: "工具",
    text: "写了个脚本统计每个组件文件的行数,排了个榜。第一名 940 行,是我上个月自己写的那个。",
  },
  {
    id: "n4",
    date: "2026-10-26",
    emoji: "✅",
    tag: "里程碑",
    text: "站内搜索接上了客户端索引,⌘K 能直接搜到正文里的词,不用等接口了。",
  },
  {
    id: "n5",
    date: "2026-10-23",
    emoji: "✍️",
    tag: "写作",
    text: "删掉了一篇写了一半的稿子。不是没写完,是没必要写 —— 结论就一句话,过程真的没人关心。",
    article: "writing-like-product",
  },
  {
    id: "n6",
    date: "2026-10-15",
    emoji: "🧯",
    tag: "教训",
    text: "线上白屏十分钟。原因是新接的一个第三方脚本抛错,阻断了后面的初始化。以后所有外部脚本都包一层 try/catch。",
  },
];

export const latestNotes = notes.slice(0, 3);

export function getNote(id) {
  return notes.find((note) => note.id === id) || null;
}
