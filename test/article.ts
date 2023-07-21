import { describe, it } from 'mocha'
import { expect } from 'chai'
import Wechat from '../lib/wechat'
import { Article } from '../models/article'

describe('Wechat Article API', function () {
  it('expect work', async () => {
    this.timeout(20000)

    const wechat = new Wechat(process.env.APP_ID || '', process.env.APP_SECRET || '')

    await Article.init({ wechat })

    const content = `
      <img src="https://shanyue.tech/wechat.jpeg">
      <span style="background-image: url(https://img.alicdn.com/tfs/TB1Yycwyrj1gK0jSZFuXXcrHpXa-32-32.png); display: inline-block; width: 18px; height: 18px; background-size: 18px; background-repeat: no-repeat; background-position: center">
    `

    const data = await Article.create({
      thumbMediaId: 'yspyRwTb0m9UyK78TLER8E_wdRSWjp6KJF8d2p_vVP4',
      title: 'Hello, world',
      author: 'shanyue',
      showCoverPic: 0,
      content
    })

    expect(data.media_id).length.to.gt(10)
  })
})