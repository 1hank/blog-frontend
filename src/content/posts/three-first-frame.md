户型渲染的项目上线前,老板只问了一句:为什么别人家的 3D 打开就出来了,我们要等三秒。

那三秒很具体。

## 首屏的三段时间

把一次三维首屏拆开,其实是三段串行的活:

1. **资源**:模型、贴图、着色器文本下载完。
2. **解析**:几何体上传显存、贴图解码。
3. **编译**:着色器在 GPU 上编译链接。

大部分人只优化第一段,因为它最好量。实际上在我的项目里,三段大概是这样分布的:

| 阶段 | 优化前 | 优化后 |
| --- | --- | --- |
| 资源下载 | 1.4s | 0.5s |
| 解析上传 | 0.6s | 0.25s |
| 着色器编译 | 0.9s | 0.2s |

## 一、先把资源砍掉一半

- 模型走 DRACO 压缩,一个 12MB 的户型从 12MB 降到 2.1MB;
- 贴图统一 1024,法线图只对家具保留;
- 环境贴图从 4K HDR 换成 512 的程序化渐变,肉眼几乎看不出差别。

**最关键的一条:首屏只加载摄像机视野内的东西。** 走廊尽头的房间等用户走过去再加载,用户根本不会察觉。

## 二、并行解析,不要串行 await

```ts
const [geoA, geoB, tex] = await Promise.all([
  loadGeometry(urlA),
  loadGeometry(urlB),
  loadTexture(texUrl),
]);
```

这一条听起来像废话,但我在真实代码里见过 `await` 写了七层的地方。

## 三、提前编译着色器

这是被低估最严重的一段。`renderer.compileAsync(scene, camera)` 会把所有材质的着色器提前编译好:

```ts
renderer.compileAsync(scene, camera).then(() => {
  // 这之后第一帧才不会卡
  requestAnimationFrame(render);
});
```

在 Chrome 上它返回 Promise,内部用的是 `KHR_parallel_shader_compile`。注意:必须传**真实会渲染的场景**,否则编译的不是同一批程序。

## 四、加载界面要说人话

进度条不要按字节数跑。我按"阶段"分:

```ts
setStage("读取户型");
setStage("生成墙体");
setStage("编译材质");
```

用户看到"编译材质"卡住 0.2 秒可以接受,看到进度条停在 87% 三十秒会直接关页面。

## 五、量,不要猜

`performance.mark` / `measure` 加一个开发面板:

```ts
performance.mark("scene:start");
await buildScene();
performance.mark("scene:end");
performance.measure("scene", "scene:start", "scene:end");
```

再配合 `renderer.info`:

```ts
console.log(renderer.info.render.calls, renderer.info.memory.textures);
```

`calls` 是 drawcall,`memory.textures` 是显存里的贴图数量。后者如果只增不减,说明你在泄漏 —— 这是下一篇的主题。

## 结果

- 首屏从 3.1s 降到 1.4s(中端笔记本,核显);
- 首次交互从 3.6s 降到 1.9s;
- 低端安卓平板从"打不开"变成 6.8s 可交互。

最后一条收益最大:**能用**和**快**是两件事,但用户分不出来。
