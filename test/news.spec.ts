import { assert, describe, expect, it } from 'vitest'
import Wechat from '../lib/wechat'
import { News } from '../models/news'
import { Media } from '../models/media'

describe('Wechat News API', function () {
  it('expect work', async () => {

    const wechat = new Wechat(process.env.APP_ID || '', process.env.APP_SECRET || '')

    await News.init({ wechat })
    await Media.init({ wechat })

    const media = await Media.create({
      src: 'https://shanyue.tech/wechat.jpeg',
      type: 'image'
    })
    const thumbMediaId = media.media_id

    const content = `
      <img src="https://shanyue.tech/wechat.jpeg">
      <span style="background-image: url(https://img.alicdn.com/tfs/TB1Yycwyrj1gK0jSZFuXXcrHpXa-32-32.png); display: inline-block; width: 18px; height: 18px; background-size: 18px; background-repeat: no-repeat; background-position: center">
    `

    const data = await News.create([
      {
        thumbMediaId,
        title: 'Hello, shanyue',
        author: 'shanyue',
        showCoverPic: 0,
        content
      },
      {
        thumbMediaId,
        title: 'Hello, daxiange',
        author: 'shanyue',
        showCoverPic: 0,
        content
      }
    ])

    expect(data.media_id).length.to.gt(10)
  })
})