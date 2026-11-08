三年里我给不同的项目加过几十个自定义 Tailwind 类。现在回头看,真正活下来、每个项目都会抄过去的,只有 12 个。

这篇是那份清单,以及删掉其他类的理由。

## 为什么自定义类会膨胀

Tailwind 的诱惑是"什么都能在模板里写"。于是很快会出现:

```html
<div class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
```

这行在项目里出现 40 次。第一次改圆角,你就要改 40 处 —— 这时人会本能地抽出 `.card`,然后抽出 `.card-lg`、`.card-flat`、`.card-interactive`……最后得到一套自制的、比原生 CSS 更难维护的组件系统。

**膨胀的根因不是"抽了类",是抽的时候没有边界。**

## 我的边界:只抽"语义 + 状态"

一个类值得存在,必须同时满足:

1. 它在模板里读起来像**名词**(`.card`、`.field`)或**状态**(`.is-active`);
2. 它至少有 3 个以上组合属性(布局 + 颜色 + 过渡);
3. 它有自己的状态变体(hover / active / disabled)。

只满足"重复出现"是不够的 —— `flex items-center gap-2` 重复 200 次也不该抽,因为它没有语义。

## 活下来的 12 个

```css
@layer components {
  .shell      /* 页面容器: max-width + 响应式内边距 */
  .label      /* 等宽小字标签: 字号 + 字距 + 大写 */
  .index      /* 编号/日期: 等宽 + 表格数字 */
  .rule       /* 1px 分隔线, 常和 flex 搭配 */
  .btn        /* 按钮基类 + --solid / --accent / --sm */
  .icon-btn   /* 方形图标按钮 */
  .card       /* 方角卡片 + 四角定位标记 */
  .row        /* 文章索引行 + 悬停时的强调边 */
  .tag        /* 小标签 */
  .field      /* 输入框 */
  .prose-blog /* 正文排版 */
  .toc-link   /* 目录链接 + 激活态 */
}
```

数一下正好 12 个。它们的共同点是:**每一个都对应界面里的一种"部件"**,而不是某种样式组合。

## 两个具体的取舍

### 一、`@apply` 只用一层

```css
/* 可以 */
.btn { @apply inline-flex items-center gap-2 rounded; }

/* 不要 */
.btn--primary { @apply btn border-accent bg-accent text-white; }
```

在自定义类里 `@apply` 另一个自定义类,会让依赖关系不可追踪,改基类时不知道会波及谁。变体只写差异属性。

### 二、颜色走 CSS 变量,不走 Tailwind 调色板

```css
:root { --ink-rgb: 20 19 14; --accent-rgb: 31 58 214; }
[data-theme="dark"] { --ink-rgb: 241 239 230; --accent-rgb: 132 147 255; }
```

```js
// tailwind.config.js
colors: { ink: "rgb(var(--ink-rgb) / <alpha-value>)", ... }
```

用 RGB 三元组而不是 hex,是因为要支持 `/60` 这类透明度写法。这样一份类名同时服务两套主题,不用写 `dark:` 前缀。

## 删掉的那些

- `.glass` / `.blur-panel`:用了一次就没人记得;
- `.gradient-text`:渐变文字在不同字号下观感差太多;
- `.hover-lift` / `.hover-scale`:这类"效果类"会让模板变成状态机;
- `.text-balance` 系列:Tailwind 3.4 之后原生有了。

## 数字

重构前后:

| 指标 | 之前 | 之后 |
| --- | --- | --- |
| 自定义类数量 | 47 | 12 |
| `style.css` 行数 | 1900 | 780 |
| 改一次圆角要动的文件 | 6 | 1 |

行数少了 60%,改版速度明显变快 —— 但真正的收益是**新同事能在一小时内看懂样式层**。

## 一句话总结

Tailwind 让"不抽类"变得可行,所以抽类的门槛应该比以前更高,而不是更低。
