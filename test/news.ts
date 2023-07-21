import { describe, it } from 'mocha'
import { expect } from 'chai'
import Wechat from '../lib/wechat'
import { News } from '../models/news'

describe('Wechat News API', function () {
  this.timeout(200000)

  it('expect work', async () => {

    const wechat = new Wechat(process.env.APP_ID || '', process.env.APP_SECRET || '')

    await News.init({ wechat })
    await News.init({ wechat })

    const content = `
      <img src="https://shanyue.tech/wechat.jpeg">
      <span style="background-image: url(https://img.alicdn.com/tfs/TB1Yycwyrj1gK0jSZFuXXcrHpXa-32-32.png); display: inline-block; width: 18px; height: 18px; background-size: 18px; background-repeat: no-repeat; background-position: center">
    `

    const data = await News.create([
      {
        thumbMediaId: 'yspyRwTb0m9UyK78TLER8E_wdRSWjp6KJF8d2p_vVP4',
        title: 'Hello, shanyue',
        author: 'shanyue',
        showCoverPic: 0,
        content
      },
      {
        thumbMediaId: 'yspyRwTb0m9UyK78TLER8E_wdRSWjp6KJF8d2p_vVP4',
        title: 'Hello, daxiange',
        author: 'shanyue',
        showCoverPic: 0,
        content
      }
    ])

    expect(data.media_id).length.to.gt(10)
  })
})