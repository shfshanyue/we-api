import { describe, it } from 'mocha'
import { expect } from 'chai'
import Wechat from '../lib/wechat'
import { Media } from '../models/media'

describe('Wechat Media API', function () {
  it('expect work', async () => {
    const wechat = new Wechat(process.env.APP_ID || '', process.env.APP_SECRET || '')

    await Media.init({
      wechat,
      modelName: 'media'
    })

    const result = await Media.create({
      src: 'https://shanyue.tech/wechat.jpeg',
      type: 'image'
    })

    expect(result.media_id).length.to.gt(10)
  })

  it('expect work with wechat sync', async () => {
    const wechat = new Wechat(process.env.APP_ID || '', process.env.APP_SECRET || '')

    await wechat.sync()

    const result = await wechat.models.media.create({
      src: 'https://shanyue.tech/wechat.jpeg',
      type: 'image'
    })

    expect(result.media_id).length.to.gt(10)
  })
})