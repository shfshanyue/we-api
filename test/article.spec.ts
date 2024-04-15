import { assert, describe, expect, it } from 'vitest'
import Wechat from '../lib/wechat'
import { Article } from '../models/article'
import { Media } from '../models/media'

describe('Wechat Article API', function () {
  it('expect work', async () => {

    const wechat = new Wechat(process.env.APP_ID || '', process.env.APP_SECRET || '')

    await Article.init({ wechat })
    await Media.init({
      wechat,
      modelName: 'media'
    })

    const content = `
      <img src="https://shanyue.tech/wechat.jpeg">
      <span style="background-image: url(https://img.alicdn.com/tfs/TB1Yycwyrj1gK0jSZFuXXcrHpXa-32-32.png); display: inline-block; width: 18px; height: 18px; background-size: 18px; background-repeat: no-repeat; background-position: center">
    `

    const media = await Media.create({
      src: 'https://shanyue.tech/wechat.jpeg',
      type: 'image'
    })

    const data = await Article.create({
      thumbMediaId: media.media_id,
      title: 'Hello, world',
      author: 'shanyue',
      showCoverPic: 0,
      content
    })

    expect(data.media_id).length.to.gt(10)
  })

  it('expect work with unsported image type (svg、webp)', async () => {

    const wechat = new Wechat(process.env.APP_ID || '', process.env.APP_SECRET || '')

    await Article.init({ wechat })
    await Media.init({
      wechat,
      modelName: 'media'
    })

    const content = `
      <img src="https://shanyue.tech/wechat.jpeg">
      <img src="https://markdown.devtool.tech/icon.svg">
    `

    const media = await Media.create({
      src: 'https://shanyue.tech/wechat.jpeg',
      type: 'image'
    })

    const data = await Article.create({
      thumbMediaId: media.media_id,
      title: 'Hello, world',
      author: 'shanyue',
      showCoverPic: 0,
      content
    })

    expect(data.media_id).length.to.gt(10)
  })
})