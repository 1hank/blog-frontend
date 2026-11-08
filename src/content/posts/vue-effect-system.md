这是本站的第一组文章之一。写它,是因为半年内我已经在三份代码里见过同一种动效烂摊子。

## 烂摊子长什么样

页面上有 20 处 `div` 各自 `addEventListener('mouseenter')`,各自算位置,各自 `requestAnimationFrame`。改一个按钮的悬停手感,要在四个文件里找同样的代码。

更麻烦的是页面切换:组件卸载了,监听器还在;`requestAnimationFrame` 还在跑;`getBoundingClientRect()` 每帧读一次,触发布局。

## 三条规则

**第一,动效分两类。**

- **声明式**:进视口淡入、滚动进度、列表交错。特征是有明确触发条件,不需要知道鼠标位置。
- **命令式**:磁性按钮、光标跟随、拖拽。特征是每帧都在读输入。

两类的写法必须分开,混在一起就一定会变成每个组件自己一套。

**第二,声明式的用属性标记,不用组件包裹。**

```html
<section data-reveal>...</section>
<div data-reveal-children>
  <article>...</article>
  <article>...</article>
</div>
```

我不用 `<RevealWrapper>` 组件,因为它会往 DOM 里塞一层无意义的 `div`,而这层 `div` 通常会破坏 grid/flex 布局。属性标记的代价是需要一个全局观察者,收益是模板里零成本。

**第三,命令式的只留一个入口。**

```ts
// motion/global.ts
let booted = false;

export function initGlobalMotion() {
  if (booted) return;      // 重复调用直接退出
  booted = true;
  initCursor();
  initMagnetic();
  initSmoothScroll();
}
```

`booted` 这个标记看着土,但它防住了一整类 bug:开发环境热更新、路由重复进入、组件重复挂载,都会重复初始化。

## 观察者只建一个

每页建一个 `IntersectionObserver` 是最常见的浪费。`observe()` 支持动态追加元素,所以全局一个就够:

```ts
const registry = new WeakMap<Element, () => void>();
let observer: IntersectionObserver | null = null;

export function observeReveals(root: ParentNode = document) {
  if (!observer) {
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const play = registry.get(entry.target);
        observer!.unobserve(entry.target);
        registry.delete(entry.target);
        play?.();
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  }

  root.querySelectorAll("[data-reveal]").forEach((el) => {
    if (registry.has(el)) return;
    registry.set(el, () => animateIn(el));
    observer!.observe(el);
  });
}
```

用 `WeakMap` 而不是 `Set`,组件卸载后自然被回收。

## 卸载时到底要清什么

清单固定三条:

1. `cancelAnimationFrame(raf)`
2. `removeEventListener`(用同一个函数引用)
3. `observer.disconnect()` / `unobserve(el)`

第三条最容易漏。我的做法是每个动效入口函数都返回一个 `dispose`,`onBeforeUnmount` 里只调它:

```ts
export function useTicker(cb: () => void, deps: Ref[]) {
  const id = ref(0);
  onMounted(() => {
    const loop = () => { cb(); id.value = requestAnimationFrame(loop); };
    loop();
  });
  onBeforeUnmount(() => cancelAnimationFrame(id.value));
}
```

## 手感参数比代码重要

同一套缓动函数,参数差一点观感完全不同。我现在的默认值:

| 场景 | 时长 | 缓动 |
| --- | --- | --- |
| 悬停反馈 | 180–220ms | `ease-out` |
| 入场淡入 | 700–820ms | `cubic-bezier(.22,1,.36,1)` |
| 磁性归位 | 520–600ms | 弹性回弹 |
| 页面切换 | 300–420ms | `ease-out` |

还有一条:**动效时长不应该由内容长度决定**。列表 3 条和 30 条,单条时长必须一致,只允许交错步长变化。

## 最后

`prefers-reduced-motion` 不是可选项。我的做法是在最早的初始化里读一次,存在模块变量里,后面所有动效入口直接早退:

```ts
export const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

一行判断,省掉后面几十处。
