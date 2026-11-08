/** 文章评论区的示例评论(虚构数据) */
export const seedComments = [
  {
    id: "s1",
    name: "阿吉",
    avatar: "阿",
    color: "#2f6f5f",
    time: "2026-11-06T10:22:00+08:00",
    text: "「先把动效分两类」这句我要抄到团队文档里。我们现在的动效就是一锅粥,鼠标相关的和滚动相关的混在一起。",
    likes: 5,
  },
  {
    id: "s2",
    name: "Momo",
    avatar: "M",
    color: "#6b4c9a",
    time: "2026-11-05T16:45:00+08:00",
    text: "请问 reduced-motion 的判断,你是在模块加载时就固定,还是每次调用都读一次?",
    likes: 3,
    reply: {
      time: "2026-11-05T17:20:00+08:00",
      text: "模块加载时读一次。用户在系统设置里改完之后刷新页面就生效,没必要每帧判断。",
    },
  },
];

export const articleAuthor = "Hank";
