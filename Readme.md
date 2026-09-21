# Wechat API

[![npm version](https://img.shields.io/npm/v/we-api.svg?style=flat-square)](https://www.npmjs.org/package/we-api)
[![install size](https://packagephobia.now.sh/badge?p=we-api)](https://packagephobia.now.sh/result?p=we-api)
[![npm downloads](https://img.shields.io/npm/dm/we-api.svg?style=flat-square)](http://npm-stat.com/charts.html?package=we-api)

基于 Model 形式对微信公众号 API 进行封装，并且支持 `Typescript`。它有以下优点

+ 支持 Typescript
+ Model Style
+ 上传素材时，会提前自动上传非微信域名图片

## 快速使用

使用 `npm` 装包

``` bash
$ npm i we-api
```

### 初始化 Model

推荐一次性注册全部 Model（草稿、素材、发布等）：

``` ts
import Wechat, { Article, Publish } from 'we-api'

const wechat = new Wechat(appId, appSecret)
await wechat.sync()

// 之后可直接使用导出的 Model 类，或通过 wechat.models.article 等访问同一套 API
await Article.create({ /* ... */ })
```

只需部分能力时，可对单个 Model 调用 `init`（需自行传入 `wechat`）：

``` ts
await Article.init({ wechat, modelName: 'article' })
await Media.init({ wechat, modelName: 'media' })
```

使用 `we-api` 进行素材上传（单 Model 初始化示例）

``` ts
import Wechat, { Article } from 'we-api'

const wechat = new Wechat(appId, appSecret)

await Article.init({ modelName: 'article', wechat })

await Article.create({
  thumbMediaId: 'yspyRwTb0m9UyK78TLER8E_wdRSWjp6KJF8d2p_vVP4',
  title: '前端部署发展史',
  author: '山月',
  showCoverPic: 0,
  content: '前端一说起刀耕火种，那肯定紧随着前端工程化这一话题。...',
  contentSourceUrl: 'https://shanyue.tech/frontend-engineering/deploy.html'
})
```

发布草稿示例：

``` ts
import Wechat, { Article, Publish } from 'we-api'

const wechat = new Wechat(appId, appSecret)
await wechat.sync()

const draft = await Article.create({ /* ... */ })
const { publish_id } = await Publish.submit({ mediaId: draft.media_id })
const status = await Publish.getStatus({ publishId: publish_id })
```

## API

### Article

图文媒体资源，现为草稿。

+ `Article.create(article)`: 上传文章，如果文章内容包含图片，则会自动转成微信域名内图片。
+ `Article.bulkCreate(article)`: 上传多图文消息
+ `Article.findOne({ mediaId })`: 获取草稿详情
+ `Article.findAll({ offset, count, noContent? })`: 获取草稿列表
+ `Article.count()`: 获取草稿总数
+ `Article.update({ mediaId, index, article })`: 更新草稿（`content` 会走与 create 相同的图片转链逻辑）
+ `Article.destroy({ mediaId })`: 删除草稿

### DataCube

公众号数据统计（[微信数据统计接口](https://developers.weixin.qq.com/doc/subscription/guide/product/analysis_data/analysis_data.html)）。请求参数统一为 `beginDate` / `endDate`（`yyyy-MM-dd`），对应微信侧的 `begin_date` / `end_date`。

用户数据：

+ `DataCube.getUserSummary(range)`: 用户增减
+ `DataCube.getUserCumulate(range)`: 累计用户

图文数据：

+ `DataCube.getArticleSummary(range)`: 群发图文每日数据
+ `DataCube.getUserReadHour(range)` / `DataCube.getUserShareHour(range)`: 阅读、转发分时
+ `DataCube.getUserRead(range)` / `DataCube.getUserShare(range)`: 阅读、转发概况
+ `DataCube.getArticleTotal(range)`: 群发总数据（微信已标记停止维护）
+ `DataCube.getArticleRead(range)` / `DataCube.getArticleShare(range)`: 发表内容每日阅读、分享
+ `DataCube.getBizSummary(range)` / `DataCube.getArticleTotalDetail(range)`: 发表内容概况与明细

消息数据：`getUpstreamMsg`、`getUpstreamMsgWeek`、`getUpstreamMsgMonth`、`getUpstreamMsgHour`、`getUpstreamMsgDist`、`getUpstreamMsgDistWeek`、`getUpstreamMsgDistMonth`

接口数据：`getInterfaceSummary`、`getInterfaceSummaryHour`

``` ts
import Wechat, { DataCube } from 'we-api'

const wechat = new Wechat(appId, appSecret)
await wechat.sync()

const { list } = await DataCube.getUserSummary({
  beginDate: '2024-01-01',
  endDate: '2024-01-07'
})
```

### Publish

发布能力（草稿发布到公众号）。

+ `Publish.submit({ mediaId })`: 提交发布任务
+ `Publish.getStatus({ publishId })`: 查询发布状态
+ `Publish.batchGet({ offset, count, noContent? })`: 获取已发布消息列表
+ `Publish.getArticle({ articleId })`: 获取已发布图文详情
+ `Publish.destroy({ articleId, index? })`: 删除已发布文章

### News

批量图文媒体资源，相当于上传多条 Article

+ `News.create(news)`

### Media

图文资源，如图片等

+ `Media.create(media)`

### WechatError

微信接口错误。`code` 为数字型 `errcode`，可通过 `error.extensions` 查看原始响应。

### Wechat 选项

构造函数第 5 个参数为可选 `WechatOptions`：

``` ts
const wechat = new Wechat(appId, appSecret, getToken, setToken, {
  strictImages: false,
  remoteFetch: {
    timeoutMs: 30_000,
    maxBytes: 10 * 1024 * 1024,
    allowPrivateIp: false,
    allowedHosts: ['cdn.example.com']
  }
})
```

+ `strictImages`：默认为 `false`。为 `true` 时，正文图片转链失败会直接抛错，而不是保留原 URL。
+ `remoteFetch`：拉取远程图片/素材时的 HTTP 限制。默认拒绝 `http(s)` 以外的协议及 localhost、内网段等主机名（非完整 SSRF 防护）；可通过 `allowedHosts` 白名单进一步收紧。

## Development

使用 pnpm 11+ 开发时，依赖安装脚本的放行策略见根目录 `pnpm-workspace.yaml` 中的 `allowBuilds`；`package.json` 的 `packageManager` 锁定 pnpm 版本（需 `corepack enable`）。
