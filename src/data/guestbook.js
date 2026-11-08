/** 留言板(虚构数据) */
export const guestbookMessages = [
  {
    id: "g1",
    name: "Nova",
    avatar: "N",
    color: "#1f3ad6",
    time: "2026-11-06T21:14:00+08:00",
    text: "点阵背景那个思路很好,照着自己首页改了一版。想问低端设备上靠近鼠标的区域会不会掉帧?",
    likes: 14,
    reply: {
      time: "2026-11-07T09:02:00+08:00",
      text: "会。我把 DPR 封顶到 2,再加了一条「鼠标静止就不重绘」,你可以先试这两个。",
    },
  },
  {
    id: "g2",
    name: "林深",
    avatar: "林",
    color: "#2f6f5f",
    time: "2026-11-05T18:40:00+08:00",
    text: "WebGL 泄漏那篇救了我一整天。renderer.info 之前完全没看过,现在常驻开发面板了。",
    likes: 9,
  },
  {
    id: "g3",
    name: "K",
    avatar: "K",
    color: "#b4531f",
    time: "2026-11-04T11:26:00+08:00",
    text: "动效系统那篇的全局 booted 标记,热更新的时候会不会导致新代码不生效?",
    likes: 6,
    reply: {
      time: "2026-11-04T13:05:00+08:00",
      text: "会,所以我只在生产环境常驻。开发环境用 import.meta.hot.dispose 把它重置掉。",
    },
  },
  {
    id: "g4",
    name: "周末不加班",
    avatar: "周",
    color: "#6b4c9a",
    time: "2026-11-02T22:51:00+08:00",
    text: "重写后台那篇看得后背发凉。我们正在做一模一样的事,已经第四个月了。",
    likes: 23,
  },
  {
    id: "g5",
    name: "Yuki",
    avatar: "Y",
    color: "#3b5b7a",
    time: "2026-10-30T09:08:00+08:00",
    text: "第一次来,排版很干净,细线和编号的设计很舒服。RSS 已订阅。",
    likes: 4,
  },
  {
    id: "g6",
    name: "老陈",
    avatar: "陈",
    color: "#a13a52",
    time: "2026-10-27T15:33:00+08:00",
    text: "CI 那篇的「体积预算」建议很实用。我们照做之后第一次就抓到一个 800KB 的依赖。",
    likes: 11,
  },
];

export function createMessage({ name, text }) {
  return {
    id: `local-${Date.now()}`,
    name: (name || "").trim() || "匿名访客",
    avatar: ((name || "匿").trim()[0] || "匿").toUpperCase(),
    color: "#1f3ad6",
    time: new Date().toISOString(),
    text: (text || "").trim(),
    likes: 0,
    local: true,
  };
}
