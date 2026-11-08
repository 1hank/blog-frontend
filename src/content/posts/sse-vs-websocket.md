实时看板的需求很简单:每 3 秒刷新一次指标,断网要能自己恢复。

我一开始想都没想就上了 WebSocket,后来把它换成了 SSE。原因是数据流是**单向**的。

## 先把数据流画出来

- 服务端 → 客户端:指标更新、告警、任务进度。**单向,高频,不需要确认。**
- 客户端 → 服务端:只有偶尔的参数调整。走普通 `POST` 就够。

既然是单向的,WebSocket 的双向能力就是纯成本。

## 对比

| 维度 | SSE | WebSocket |
| --- | --- | --- |
| 协议 | 纯 HTTP,`text/event-stream` | 独立协议,需要 Upgrade |
| 断线重连 | 浏览器内置 | 自己写 |
| 代理/网关 | 走 HTTP,配置简单 | 部分网关要单独开 |
| 双向 | 否 | 是 |
| 二进制 | 否(有 workaround) | 原生支持 |
| 浏览器连接数 | HTTP/1.1 下每域 6 个 | 不受限 |

决定性的是第二行和第三行:**内置重连**和**过代理不用改配置**。

## SSE 的实现

服务端就是一个不结束的响应:

```ts
app.get("/api/metrics/stream", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  const send = (data: unknown) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const timer = setInterval(() => send(collectMetrics()), 3000);

  // 心跳, 防代理掐断空闲连接
  const beat = setInterval(() => res.write(": ping\n\n"), 15000);

  req.on("close", () => {
    clearInterval(timer);
    clearInterval(beat);
    res.end();
  });
});
```

前端:

```ts
const source = new EventSource("/api/metrics/stream");
source.onmessage = (event) => store.update(JSON.parse(event.data));
```

## 三个必踩的坑

### 一、代理缓冲

Nginx 默认会缓冲响应,前端会一次性收到一批数据,看起来像"卡 30 秒然后刷一堆"。

```nginx
location /api/metrics/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 3600s;
}
```

`X-Accel-Buffering: no` 这个响应头也能解决问题,我两个都加了。

### 二、EventSource 不会告诉你"为什么断了"

它只有 `onerror`,没有错误码。断网、服务重启、代理超时,前端看到的都一样。

我的做法是服务端每次连接都发一个 `hello` 事件带 `serverTime`,前端超过 10 秒没收到任何数据就主动 `close()` 再新建 —— 比等浏览器自己的重连更快。

### 三、每个标签页一条连接

HTTP/1.1 下同域最多 6 条并发连接。开了 7 个标签页,整个站点其他请求会全部排队。

这在开发时不明显,上线后被运维指出来了。解法是 HTTP/2,或者只允许一个标签页持有连接,其他标签页用 `BroadcastChannel` 转发。

## 什么时候还是该用 WebSocket

- 真的要双向高频:协同编辑、游戏、语音;
- 要传二进制帧;
- 连接数很少但要极低延迟。

一个判断标准:**如果客户端 90% 的时间只是听着,选 SSE。**

## 结果

换完之后:

- 代码少了约 200 行(重连、心跳、状态机全是浏览器管的);
- 运维那边不用再给网关开特殊配置;
- 掉线恢复从平均 8 秒变成 2 秒左右(心跳超时 + 主动重建)。

功能没有任何损失 —— 因为我们本来就不需要双向。
