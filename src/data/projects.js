/** 项目数据(虚构数据) */
export const projects = [
  {
    slug: "ai-home-visualizer",
    title: "AI 家装可视化平台",
    subtitle: "户型识别 · 实时三维 · 自动布局",
    status: "持续迭代",
    year: 2026,
    featured: true,
    tags: ["Vue3", "Three.js", "FastAPI", "AI"],
    desc: "面向家装行业的可视化工具:上传户型图,自动解析墙体与门窗,在浏览器里实时渲染可漫游的三维空间。",
    highlights: [
      "户型图片 → 结构化墙体 / 门窗 JSON",
      "Three.js 场景实时搭建,几何体合并把 drawcall 压到个位数",
      "材质、灯光、家具切换即可预览",
      "首屏 1.4s / 单次切换内存增长 2MB",
    ],
    stack: [
      { name: "Vue 3", role: "界面与状态" },
      { name: "Three.js", role: "三维渲染" },
      { name: "FastAPI", role: "接口服务" },
      { name: "WebGL", role: "着色器" },
    ],
    links: [
      { label: "在线预览", href: "https://example.com", kind: "demo" },
      { label: "源码", href: "https://github.com/hank-dev", kind: "code" },
    ],
    metrics: [
      { label: "drawcall", value: "4" },
      { label: "首屏", value: "1.4s" },
      { label: "面积", value: "120㎡" },
    ],
    content: `
## 要解决的问题

家装门店里,客户很难通过平面图想象最终空间。这个项目的目标是把「看一眼就懂」变成默认体验。

## 技术要点

- 户型图经过一次简化识别,输出墙体线段与开洞信息
- 前端只认这份结构化契约,不关心识别是模型还是人工
- 同材质的几何体合并,drawcall 从三百多压到个位数
- 材质与灯光方案存在本地,切换时不重新请求

## 踩过的坑

最大的坑不是渲染,是**阴影**。一开始上了三重光源 + 2048 阴影贴图,集成显卡直接跌破 20fps。最后砍到一盏平行光 + 环境光,阴影 1024,视觉几乎无差。

## 下一步

家具拖拽做成基于射线检测的吸附式摆放,顺便补上场景导出。
`,
  },
  {
    slug: "blog-site",
    title: "作品集站点(本站)",
    subtitle: "你正在看的这一个",
    status: "已上线",
    year: 2026,
    featured: true,
    tags: ["Vue3", "Vite", "GSAP", "Tailwind"],
    desc: "纯前端个人站点:Markdown 直出、五块幕布转场、Hero 粒子场、双主题、命令面板式搜索。数据全部是虚构的。",
    highlights: [
      "Markdown 原文经 ?raw 导入,自研轻量渲染器",
      "五块幕布转场,每个会话只播一次",
      "白底 / 深墨紫双主题,支持 View Transition 圆形扩散",
      "客户端索引,⌘K 直接搜正文",
    ],
    stack: [
      { name: "Vue 3", role: "框架" },
      { name: "Vite", role: "构建" },
      { name: "GSAP", role: "动效" },
      { name: "Tailwind CSS", role: "样式" },
    ],
    links: [{ label: "源码", href: "https://github.com/hank-dev", kind: "code" }],
    metrics: [
      { label: "文章", value: "12" },
      { label: "首屏 JS", value: "142KB" },
      { label: "构建", value: "2s" },
    ],
    content: `
## 为什么自己搭

改一个细节要读懂别人的抽象,不如自己写一遍。整套只依赖几个很小的库,读代码十分钟就能上手。

## 交互清单

- 七条横向帘片的换页转场(每会话一次)
- 光标方点 + 磁性按钮
- 点阵背景,鼠标靠近才变亮
- 滚动显现、数字滚动、阅读进度
- 代码块工具条 + 一键复制
- 命令面板:↑↓ 选择、↵ 打开

## 内容策略

长文写透一个主题,「短记」记那些不值得展开的现场。两者混排,首页才不会一停更好几个月。
`,
  },
  {
    slug: "webgl-editor",
    title: "WebGL 轻量编辑器",
    subtitle: "拖拽搭建,导出场景 JSON",
    status: "原型",
    year: 2026,
    tags: ["WebGL", "TypeScript"],
    desc: "不依赖重型引擎的网页 3D 编辑器:拖拽摆放、材质编辑、光照预览,一键导出场景 JSON 给渲染端复用。",
    highlights: [
      "自研场景图,序列化为可复用的 JSON",
      "拖拽 + 吸附,支持框选与多选",
      "撤销 / 重做用命令模式实现",
    ],
    stack: [
      { name: "TypeScript", role: "语言" },
      { name: "WebGL", role: "渲染" },
      { name: "Vite", role: "构建" },
    ],
    links: [{ label: "源码", href: "https://github.com/hank-dev", kind: "code" }],
    metrics: [
      { label: "对象上限", value: "500" },
      { label: "包体积", value: "38KB" },
    ],
    content: `
## 目标

给运营同学一个「不写代码也能摆个 3D 场景」的工具,产物是一份 JSON,渲染端直接消费。

## 设计取舍

不上 three.js,自己写最小的场景图和渲染循环。代价是手写矩阵与光照,好处是包体积只有 38KB。

## 已知问题

还没有纹理压缩,大图很吃显存。下一步接 KTX2。
`,
  },
  {
    slug: "realtime-dashboard",
    title: "实时数据大屏",
    subtitle: "多图表联动 · 自动轮播",
    status: "已交付",
    year: 2025,
    tags: ["ECharts", "Vue3", "SSE"],
    desc: "中控室用的数据看板:等比缩放到任意屏、图表联动筛选、自动轮播高亮,连续运行不掉帧。",
    highlights: [
      "1920×1080 设计稿等比缩放,不糊字",
      "SSE 单向推送,断线自动恢复",
      "统一 rAF 调度,避免多定时器抖动",
    ],
    stack: [
      { name: "ECharts", role: "图表" },
      { name: "Vue 3", role: "页面" },
      { name: "SSE", role: "数据通道" },
    ],
    links: [],
    metrics: [
      { label: "图表", value: "8" },
      { label: "刷新", value: "5s" },
      { label: "连续运行", value: "72h" },
    ],
    content: `
## 难点

大屏真正的难点不是图表,是**节奏**:缩放、轮播、动画、数据刷新,四条时间线要统一,否则看起来就是乱。

## 做法

所有图表共用一份 rAF 驱动,轮播用 setTimeout 链而不是 setInterval,这样可以随时暂停。

## 结果

在一台四年前的核显机器上连续跑 72 小时,内存稳定在 260MB 左右。
`,
  },
  {
    slug: "whisper-pipeline",
    title: "录音转写流水线",
    subtitle: "本地批量转写 · 数据不出机器",
    status: "内部使用",
    year: 2025,
    tags: ["Python", "whisper", "CUDA"],
    desc: "基于 faster-whisper 的本地批量转写脚本:VAD 过滤静音、自动生成 SHA-256 清单、核心片段用大模型精转。",
    highlights: [
      "VAD 先切,转写只花在有声音的地方",
      "每份产物带哈希清单,便于校验",
      "纯本地推理,数据不出机器",
    ],
    stack: [
      { name: "Python", role: "脚本" },
      { name: "faster-whisper", role: "转写" },
      { name: "CUDA", role: "加速" },
    ],
    links: [],
    metrics: [
      { label: "提速", value: "3.1x" },
      { label: "准确率", value: "94%" },
    ],
    content: `
## 为什么不用在线服务

录音里有不该上传的内容。全部本地推理,是硬要求,不是偏好。

## 流程

1. ffmpeg 抽音轨 → 单声道 16k
2. VAD 切分,丢掉纯静音
3. faster-whisper 批量转写
4. 核心片段再过一遍大模型润色标点
5. 生成 SHA-256 清单

## 收益

比直接用原版 whisper 快 3 倍,主要是 VAD 省掉了大量无效计算。
`,
  },
  {
    slug: "hash-manifest",
    title: "文件哈希清单工具",
    subtitle: "完整性校验 + 差异比对",
    status: "内部使用",
    year: 2025,
    tags: ["PowerShell", "Python"],
    desc: "给任意目录生成 SHA-256 / MD5 清单(CSV + 纯文本),用于备份完整性校验与变更追踪。",
    highlights: [
      "递归扫描,大文件流式读取不爆内存",
      "同时输出给人看和给机器验的两种格式",
      "支持增量校验,只比对变化文件",
    ],
    stack: [
      { name: "PowerShell", role: "主脚本" },
      { name: "Python", role: "校验与比对" },
    ],
    links: [],
    metrics: [
      { label: "处理", value: "1.2TB" },
      { label: "文件数", value: "84k" },
    ],
    content: `
## 用途

备份的第一个动作是「固定现场」:对目录做一次哈希清单,之后所有操作都在副本上做,清单用来证明原始状态。

## 实现

流式读取避免大文件爆内存;输出 CSV 方便表格看,输出纯文本方便 \`sha256sum -c\` 直接验。

## 教训

第一版把整个文件读进内存,遇到一个 40GB 的镜像直接 OOM。改成 8MB 分块后,1.2TB 跑了 40 分钟。
`,
  },
];

export const featuredProjects = projects.filter((project) => project.featured);

export function getProject(slug) {
  return projects.find((project) => project.slug === slug) || null;
}

export function adjacentProjects(slug) {
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: projects[index + 1] || null,
    next: projects[index - 1] || null,
  };
}
