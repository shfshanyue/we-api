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

## API

### Article

图文媒体资源，现为草稿

+ `Article.create(article)`: 上传文章，如果文章内容包含图片，则会自动转成微信域名内图片
+ `Article.bulkCreate(article)`: 上传多图文消息

### News

批量图文媒体资源，相当于上传多条 Article

+ `News.create(news)`

### Media

图文资源，如图片等

+ `Media.create(media)`
