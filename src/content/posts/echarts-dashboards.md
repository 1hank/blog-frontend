中控大屏的项目验收很顺利,上线第三天开始出问题:长时间运行后卡顿、图表高亮错乱、第二个大屏打开时内存翻倍。

这篇是那六个坑,以及现在每次开新大屏都会先做的三件事。

## 坑一:等比缩放不是万能的

设计稿 1920×1080,用 `transform: scale()` 等比缩放是最省事的方案:

```ts
const scale = Math.min(innerWidth / 1920, innerHeight / 1080);
stage.style.transform = `scale(${scale})`;
stage.style.transformOrigin = "left top";
```

但它有个副作用:**画布的实际像素尺寸没有变**。超宽屏上缩放倍率大于 1,ECharts 的 canvas 会被放大变糊。

解法是让 ECharts 的容器尺寸跟随缩放后的尺寸,或者干脆给 ECharts 传 `devicePixelRatio`:

```ts
echarts.init(el, null, { devicePixelRatio: window.devicePixelRatio * scale });
```

## 坑二:高亮不会自动取消

轮播高亮是这个坑的高发区:

```ts
// ✗ 累积状态, 越跑越乱
chart.dispatchAction({ type: "highlight", dataIndex: i });

// ✓ 先清再高亮
chart.dispatchAction({ type: "downplay", seriesIndex: 0 });
chart.dispatchAction({ type: "highlight", seriesIndex: 0, dataIndex: i });
```

`downplay` 不带 `dataIndex` 会清掉整条系列,这正是想要的。

## 坑三:setOption 的合并策略

大屏每 5 秒更新一次数据。用默认的 `notMerge: false` 时,上一次的 series 会残留:

```ts
chart.setOption(nextOption, { notMerge: true });
```

代价是每次都要传完整 option。我写了一个 `mergeOption(base, data)` 来保证完整。

## 坑四:容器尺寸变化不 resize

```ts
const ro = new ResizeObserver(() => chart.resize());
ro.observe(el);
```

不用 `window.addEventListener('resize')`,因为大屏常放在 iframe 或者抽屉里,窗口没变但容器变了。

## 坑五:数据量大时默认渲染模式很慢

散点超过 5000 点时,打开 ECharts 的大数据模式:

```ts
series: [{ type: "scatter", large: true, largeThreshold: 2000 }]
```

折线也别用平滑曲线(`smooth: true`)配大数据,采样会重复计算。必要时用 `sampling: "lttb"`。

## 坑六:忘记销毁

一条大屏 8 个图表,每个图表内部有 canvas、resize 监听、定时器。切换页面不销毁,内存就是线性增长。

```ts
onBeforeUnmount(() => {
  ro.disconnect();
  clearInterval(timer);
  chart.dispose();
});
```

`chart.dispose()` 之后实例不可复用,要重新 `init`。

## 现在必做的三件事

### 一、先定节奏,再做视觉

四条时间线必须统一:数据刷新(5s)、轮播高亮(3s)、图表动画(0.9s)、缩放重算(事件驱动)。

我见过轮播 3 秒、动画 1.2 秒、数据 5 秒三者互相打断的大屏,看起来就是"一直在闪"。

### 二、给每个图表一个"空状态"

真实数据经常缺失。没有空状态的大屏,数据一断就是一块空白,像坏了。

### 三、跑一次 24 小时

用假数据 + 定时器跑一整夜,第二天看:

- `performance.memory` 有没有涨;
- 控制台有没有堆积的警告;
- 图表是否还在正常轮播。

这一步抓到过一次"每 5 秒新建一个 tooltip 实例"的问题,三小时就吃掉 700MB。

## 结果

| 指标 | 修复前 | 修复后 |
| --- | --- | --- |
| 72 小时内存 | 1.8GB → 崩 | 稳定在 260MB |
| 高亮错乱 | 每 10 分钟一次 | 无 |
| 4K 屏清晰度 | 模糊 | 清晰 |

大屏这类项目,"能看"很容易,"能一直看"才需要工程。
