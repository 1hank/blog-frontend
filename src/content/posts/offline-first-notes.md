去年出差,酒店网络第三天彻底断了。我手边只有一个笔记本,想记点东西,打开自己常用的笔记 App —— 转圈。

三天里我用一个 textarea 和 localStorage 凑合过去了。回来后决定认真写一个:离线优先,联网只是加分项。

## 离线优先到底是什么意思

一句话:**所有操作先写本地,再谈同步。**

```text
读: 永远是读本地数据库 → 秒开
写: 写本地 + 进队列 → 界面立刻返回
同步: 后台尽力而为,失败就重试
```

对比"在线优先 + 缓存"的做法,区别在于**谁是事实来源**。离线优先里,本地库是事实来源,服务器是副本。

## 存储选 IndexedDB,理由很实在

| 方案 | 上限 | 查询 | 事务 |
| --- | --- | --- | --- |
| localStorage | ~5MB | 无 | 无 |
| IndexedDB | 磁盘配额内 | 索引 | 有 |
| OPFS | 大文件友好 | 无 | 有 |

笔记要全文搜索、要按时间排序、偶尔还要存图片,localStorage 不够用。

我用 `idb` 这个薄封装,不引 ORM:

```ts
const db = await openDB("notes", 1, {
  upgrade(db) {
    const store = db.createObjectStore("notes", { keyPath: "id" });
    store.createIndex("updatedAt", "updatedAt");
    store.createIndex("dirty", "dirty");
  },
});
```

`dirty` 这个索引是关键:同步队列直接 `index("dirty").getAll()`,不需要额外的队列表。

## 冲突:比想象中简单

我原本准备实现 CRDT,后来发现这个笔记是**单人使用、多设备**场景,冲突概率极低。

最后用的是"最后写入胜出 + 保留历史":

```ts
type Note = {
  id: string;
  updatedAt: number;   // 逻辑时钟: max(本地时间, 服务器时间) + 1
  rev: number;
  text: string;
  dirty: boolean;
};

function merge(local: Note, remote: Note): Note {
  if (remote.rev === local.rev) return local;
  return remote.updatedAt > local.updatedAt ? remote : local;
}
```

用 `updatedAt` 而不是本地系统时间,是为了防设备时间不准。每次服务端返回时把时钟往大推一点。

被覆盖的版本不删,进 `history` 表。这样"我明明写了"的时候可以捞回来。

## 队列要能忍

```ts
async function flush() {
  if (!navigator.onLine) return;
  const queue = await db.getAllFromIndex("notes", "dirty");
  for (const note of queue) {
    try {
      const saved = await api.put(note);
      await db.put("notes", { ...note, dirty: false, rev: saved.rev });
    } catch (error) {
      if (isConflict(error)) await resolveConflict(note);
      else break;   // 网络问题, 停下等下次
    }
  }
}
```

两个细节:

- **遇到网络错误就停**,不要继续打接口;
- **指数退避**,从 2 秒到 5 分钟封顶。

触发时机:`online` 事件、页面可见、每 60 秒轮询一次。

## Service Worker 只做两件事

1. 应用外壳缓存(Cache Storage),保证离线能打开;
2. 提供"添加到主屏"所需的 manifest 和图标。

```ts
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    caches.match("/index.html").then((cached) => cached || fetch(event.request))
  );
});
```

不要试图缓存所有接口 —— 那会和 IndexedDB 的数据打架,而且很难清。

## 结果

- 断网可以正常写、正常搜索、正常导出 Markdown;
- 联网后 2 秒内自动同步完;
- 冷启动 280ms(本地库直接读);
- 代码总量 1800 行,其中同步逻辑 240 行。

## 一句反思

做完之后我把主笔记 App 也换成了自己的 —— 不是因为它更好,而是因为**它不转圈**。

用户感知不到"架构先进",但一定感知得到"点开就有"。
