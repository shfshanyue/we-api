import { assert, describe, expect, it } from 'vitest'
import Wechat from '../lib/wechat'
import { Media } from '../models/media'

const hasCredentials = Boolean(process.env.APP_ID && process.env.APP_SECRET)

describe.runIf(hasCredentials)('Wechat Media API', function () {
  it('expect work', async () => {
    const wechat = new Wechat(process.env.APP_ID!, process.env.APP_SECRET!)

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
    const wechat = new Wechat(process.env.APP_ID!, process.env.APP_SECRET!)

    await wechat.sync()

    const viaModels = await wechat.models.media!.create({
      src: 'https://shanyue.tech/wechat.jpeg',
      type: 'image'
    })

    expect(viaModels.media_id).length.to.gt(10)

    const viaExport = await Media.create({
      src: 'https://shanyue.tech/wechat.jpeg',
      type: 'image'
    })

    expect(viaExport.media_id).length.to.gt(10)
  })
})