首页想做一个"会呼吸"的背景:一层规则的点阵,鼠标靠近时点会变大、变亮,离开后慢慢恢复。

第一版用 CSS 实现,第二版才换成 Canvas。两版都留在仓库里,因为各有各的用处。

## 第一版:CSS 点阵

```css
.field {
  background-image: radial-gradient(rgb(20 19 14 / 0.16) 1px, transparent 1px);
  background-size: 22px 22px;
}
```

好处是零 JS、零布局成本、任意尺寸都清晰。

坏处也很明确:**点不能单独响应鼠标**。只能整体移动背景位置来制造视差,做不出"靠近变大"的效果。

## 第二版:Canvas 网格

核心就三层循环:算网格、算距离、算半径。

```ts
function draw() {
  ctx.clearRect(0, 0, width, height);

  for (let y = step / 2; y < height; y += step) {
    for (let x = step / 2; x < width; x += step) {
      const distance = Math.hypot(x - mouse.x, y - mouse.y);
      const influence = Math.max(0, 1 - distance / radius);

      const size = 0.7 + influence * 2.2;
      const alpha = 0.14 + influence * 0.55;

      ctx.fillStyle = `rgba(31, 58, 214, ${alpha})`;
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }
  }
  requestAnimationFrame(draw);
}
```

用 `fillRect` 而不是 `arc`,因为方形更好看,也更快 —— 1440×900 下大约 1400 个点,方形填充几乎不吃帧。

## 鼠标位置必须做缓动

直接把 `mousemove` 的坐标喂给绘制,会看到一圈"硬边"跟着鼠标抖动。加一层插值:

```ts
eased.x += (mouse.x - eased.x) * 0.16;
eased.y += (mouse.y - eased.y) * 0.16;
```

`0.16` 是我试出来的:再小就跟不上手,再大就有拖影。

## 性能:三件必须做的事

1. **DPR 封顶 2**。4K 屏上 `devicePixelRatio` 是 2.5,画布像素直接翻 6 倍。
2. **出视口就停**。用 `IntersectionObserver` 拿 `inView`,再叠一个 `document.hidden`。
3. **不要在循环里读 DOM**。`getBoundingClientRect()` 提前算好缓存,`resize` 时更新。

```ts
new IntersectionObserver(([entry]) => {
  inView = entry.isIntersecting;
}).observe(canvas);
```

## 一个反直觉的优化

一开始我每帧都重绘全部点。后来发现:**鼠标不动的时候画面也不该动**。

加一个"静止判定":

```ts
const moving = Math.abs(mouse.x - eased.x) > 0.2 || Math.abs(mouse.y - eased.y) > 0.2;
if (!moving && !dirty) { requestAnimationFrame(draw); return; }
```

后台标签页省电、笔记本风扇不转,用户是能感觉到的。

## 什么时候别用 Canvas

- 只是想要一张纹理 → 用 CSS `background-image`;
- 需要点可点击、可访问 → 用 DOM;
- 静态、或者只在滚动时变化 → CSS + `transform` 更省。

Canvas 值得用的场景只有一个:**每一帧都要根据光标位置重新计算的东西**。

## 收尾

点阵背景最后只留在首页 Hero 和 404 页。文章页我关掉了 —— 阅读时有东西在动,注意力会被吃掉。

这也算一条经验:**装饰性动效的作用域应该比技术能力更窄。**
