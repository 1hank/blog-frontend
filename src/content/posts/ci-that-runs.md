我接手过的项目里,大概一半没有 CI。另一半有,但红了没人管。

第二种更糟:它让所有人学会了忽略红色。

## 最小可用 CI 只做三件事

不要把 CI 当成一套大工程。第一版只需要:

1. 装依赖(用 lockfile,不要 `npm install`);
2. 构建通过;
3. 类型检查通过。

```yaml
# .github/workflows/ci.yml
name: ci
on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm run build
      - run: npx vue-tsc --noEmit
```

四十秒左右跑完。它挡不住所有问题,但挡住了最常见的两类:**"我本地能跑"** 和 **"漏提交了一个文件"**。

## 缓存是唯一值得加的优化

`actions/setup-node` 的 `cache: npm` 一行就够。更细的可以自己控 `node_modules` 的 key,但我实测差别不大,还容易因为 key 写错导致永远命中旧缓存。

**注意 `npm ci` 和 `npm install` 的区别**:前者严格按 lockfile 装,后者可能会悄悄更新它。CI 里必须用 `ci`。

## 红了就要挡住合并

这一步比配置本身重要:

- 仓库设置里开启 "Require status checks to pass before merging";
- 把 `verify` 加进必需检查。

没有这一条,红色的工作流就只是装饰品。

## 第二版再加什么

按收益率排序:

1. **依赖安全扫描**(`npm audit --omit=dev --audit-level=high`);
2. **格式检查**(`prettier --check`),注意单独一个 job,不要阻塞构建;
3. **包体积预算**:超过阈值直接失败。这是最有价值的一条:

```yaml
      - run: npm run build
      - name: size budget
        run: node scripts/check-size.mjs --max-gzip=200kb
```

`check-size.mjs` 二十行:读 `dist/assets/*.js`,gzip 后求和,超了就 `process.exit(1)`。

我有一次靠这条在合并前发现有人把整个 lodash 引入了。

## 别再做的两件蠢事

**一、在 CI 里跑格式化和自动提交。** 会制造大量无意义的提交历史,还会和本地 IDE 打架。

**二、把所有检查塞进一个 job。** 一个 job 失败你要翻完整日志。拆成 `lint` / `typecheck` / `build` 三个,失败位置一目了然。

## 时间账

| 版本 | 配置时间 | 每次运行 | 抓到的问题 |
| --- | --- | --- | --- |
| 无 CI | 0 | 0 | 靠人肉 |
| 最小版 | 20 分钟 | 45s | 类型错误、漏文件 |
| 加体积预算 | +30 分钟 | 70s | 依赖膨胀 |

半小时的投入,换来"合并前一定构建得起来"这个保证。我认为这是团队里性价比最高的一小时。
