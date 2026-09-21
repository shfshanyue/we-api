import { describe, expect, it } from 'vitest'
import WechatError from '../lib/error'

describe('WechatError', () => {
  it('sets name and numeric code', () => {
    const error = new WechatError('invalid media_id', 40007)

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(WechatError)
    expect(error.name).toBe('WechatError')
    expect(error.code).toBe(40007)
    expect(error.message).toBe('Wechat Code 40007: invalid media_id')
  })

  it('coerces string errcode to number', () => {
    const error = new WechatError('api unauthorized', '48001')

    expect(error.code).toBe(48001)
  })

  it('omits code in message when code is absent', () => {
    const error = new WechatError('network error')

    expect(error.code).toBeUndefined()
    expect(error.message).toBe('network error')
  })
})
