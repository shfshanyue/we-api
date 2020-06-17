# Hello, world

``` js
const wechat = new Wechat(appId, appSecret)

Article.init({
  modelName: 'article',
  wechat
})

Article.create({
  title: 'hello, world',
  content: 'hello, world'
})
```