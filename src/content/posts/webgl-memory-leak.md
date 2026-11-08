家装项目的用户有个习惯:在一个方案里来回切房间。切了二十次之后,页面白屏、GPU 进程崩溃。

Chrome 的任务管理器里,标签页内存从 400MB 涨到了 2.1GB。

## 现象

- 切房间不刷新页面,只替换场景内容;
- 每次切换内存涨 60–90MB;
- 切换 20 次左右崩溃;
- `renderer.info.memory` 里的 `textures` 和 `geometries` 只增不减。

最后一条基本就确诊了:**three.js 的 `dispose()` 只释放 GPU 资源,不会从 JavaScript 里移除引用**。

## 第一轮:把该 release 的 release

```ts
function disposeNode(node: THREE.Object3D) {
  node.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    child.geometry?.dispose();

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      // 贴图必须逐个释放
      for (const value of Object.values(material)) {
        if (value && (value as THREE.Texture).isTexture) {
          (value as THREE.Texture).dispose();
        }
      }
      material.dispose();
    }
  });
}
```

内存增长从 80MB/次 降到 15MB/次。有效但不彻底。

## 第二轮:贴图复用

户型项目里,同一块木地板被 40 个柜子用。每次加载都新建一个 `TextureLoader`,于是显存里躺着 40 份同样的贴图。

加一层纹理缓存:

```ts
const textureCache = new Map<string, THREE.Texture>();

function getTexture(url: string) {
  if (!textureCache.has(url)) {
    const tex = loader.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    textureCache.set(url, tex);
  }
  return textureCache.get(url)!;
}
```

注意:**缓存之后就不能随便 dispose**。释放要跟着缓存走,用引用计数:

```ts
const refCount = new Map<string, number>();

function releaseTexture(url: string) {
  const count = (refCount.get(url) ?? 1) - 1;
  if (count <= 0) {
    textureCache.get(url)?.dispose();
    textureCache.delete(url);
    refCount.delete(url);
  } else {
    refCount.set(url, count);
  }
}
```

## 第三轮:renderer 上挂的东西

这一轮最隐蔽。三个泄漏点:

1. **`EffectComposer` 的 render target** 每帧 new 一次,永远不释放;
2. **`WebGLRenderTarget`** 换分辨率时重建,旧的没 dispose;
3. **`onBeforeCompile` 里改的 shader** 会生成新的 program,切换时数量暴涨。

检查 program 数量:

```ts
console.log(renderer.info.programs.length);
```

正常场景应该是个位数到十几个。当时我这里是 **214**。

## 一个持续监控

```ts
if (import.meta.env.DEV) {
  setInterval(() => {
    const { memories, programs, geometries } = renderer.info;
    console.table({
      geometries: renderer.info.memory.geometries,
      textures: renderer.info.memory.textures,
      programs: programs?.length,
      calls: renderer.info.render.calls,
    });
  }, 3000);
}
```

有了这张表,泄漏从"偶发崩溃"变成了"看着数字涨"。这个差别很大:前者要复现,后者只要盯着。

## 结果

| 指标 | 修复前 | 修复后 |
| --- | --- | --- |
| 单次切换内存增长 | +80MB | +2MB |
| 连续切换 50 次 | 崩溃 | 通过 |
| 显存贴图数 | 稳定上涨 | 稳定在 60 左右 |
| shader program | 214 | 12 |

## 结论

WebGL 的"内存泄漏"几乎都不是内存问题,是**引用管理问题**。

记住三条:

1. 缓存了就一定要有引用计数,否则不知道什么时候能释放;
2. `renderer.info` 是免费的体检表,开发环境常驻;
3. 任何"每帧 new"的对象都是嫌疑犯,先查它。
