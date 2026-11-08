"构建太慢了"是我听过最没信息量的反馈。

慢多少?哪一段慢?冷启动还是热更新?答不上来的时候,先量。

## 三个指标,分开量

Vite 相关的时间其实是三件不同的事:

| 指标 | 怎么量 | 心理预期 |
| --- | --- | --- |
| 冷启动 | `vite` 到 printed ready | < 1.5s |
| HMR 响应 | 改文件到浏览器更新 | < 200ms |
| 生产构建 | `vite build` 总耗时 | < 30s(中型项目) |

把三个混成"构建慢",就会去优化错误的东西。比如冷启动慢装插件是有效的,生产构建慢装插件基本没用。

## 生产构建:先看是谁占的

Vite 8 用 rolldown 之后,`--debug` 的输出已经很详细。想看模块级明细,加可视化插件:

```bash
npm i -D rollup-plugin-visualizer
```

```ts
// vite.config.ts
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [vue(), visualizer({ gzipSize: true, filename: "stats.html" })],
});
```

打开 `stats.html`,我那次看到的第一名是一个 **1.2MB 的图表库**,而项目里只用了两个图表类型。

## 常见三类浪费

### 一、整包引入

```ts
// 1.2MB
import * as echarts from "echarts";

// 380KB
import * as echarts from "echarts/core";
import { BarChart, LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
echarts.use([BarChart, LineChart, GridComponent, TooltipComponent]);
```

`echarts/core` + 按需注册,是这类库的标准用法。

### 二、大依赖没拆

单文件几 MB 的时候,首屏要等整个 bundle。手动分块:

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vue: ["vue", "vue-router"],
        three: ["three"],
        charts: ["echarts/core", "echarts/charts"],
      },
    },
  },
},
```

注意:分块解决的是**首屏并行下载**,不是总字节数。分完记得看首屏实际加载量。

### 三、图标和字体

- 图标:内联 SVG,不要整包图标库;
- 字体:子集化,只保留用到的字符。中文项目尤其明显,一个字体文件 8MB 很常见。

```bash
pyftsubset NotoSansSC.woff2 --text-file=used-chars.txt
```

## 我最后的一份配置

```ts
export default defineConfig({
  build: {
    target: "es2020",
    cssCodeSplit: true,
    reportCompressedSize: false,  // 省 3-5 秒, 数字本地看
    rollupOptions: {
      output: {
        manualChunks: { vue: ["vue", "vue-router"] },
      },
    },
  },
  optimizeDeps: {
    include: ["gsap", "lenis"],
  },
});
```

`reportCompressedSize: false` 是我最喜欢的一行 —— 它只影响终端里那个 gzip 数字,不影响产物,但能省几秒。

## 结果

| 指标 | 优化前 | 优化后 |
| --- | --- | --- |
| 生产构建 | 71s | 18s |
| 首屏 JS(gzip) | 480KB | 142KB |
| LCP(4G 模拟) | 4.2s | 1.6s |

真正改变体验的是第二行,不是第一行。构建慢只是让你自己难受,包大是让用户难受。

## 一句提醒

不要为了"构建快"去关掉类型检查、关掉 sourcemap。那是把成本转移给未来的自己 —— 我干过,后来又加回来了。
