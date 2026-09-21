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

使用 `we-api` 进行素材上传

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
