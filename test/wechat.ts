import { describe, it } from 'mocha'
import { expect } from 'chai'
import Wechat from '../lib/wechat'

describe('Wechat API', function () {
  it('expect work', async () => {
    const wechat = new Wechat(process.env.APP_ID || '', process.env.APP_SECRET || '')
    const token = await wechat.getAccessToken()

    // 生成的 access_token 字符串长度为 157
    expect(token).to.length(157)
  })

  it('expect work with global cache', async () => {
    const cache: Record<string, any> = {}
    const wechat = new Wechat(
      process.env.APP_ID || '',
      process.env.APP_SECRET || '',
      () => {
        return cache.token
      },
      (token) => {
        cache.token = token
      }
    )
    const token = await wechat.getAccessToken()

    // 生成的 access_token 字符串长度为 157
    expect(token).to.length(157)
    expect(token).to.equal(cache.token)
  })
})