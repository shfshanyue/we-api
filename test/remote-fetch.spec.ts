import { afterEach, describe, expect, it, vi } from 'vitest'
import WechatError from '../lib/error'
import * as remoteFetch from '../lib/remote-fetch'

describe('remote fetch URL policy', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects non-http protocols', () => {
    expect(() => remoteFetch.assertRemoteUrlAllowed('file:///etc/passwd')).toThrow(
      WechatError
    )
  })

  it('rejects localhost by default', () => {
    expect(() =>
      remoteFetch.assertRemoteUrlAllowed('http://127.0.0.1/image.jpg')
    ).toThrow(WechatError)
  })

  it('allows localhost when allowPrivateIp is true', () => {
    expect(() =>
      remoteFetch.assertRemoteUrlAllowed('http://127.0.0.1/image.jpg', {
        allowPrivateIp: true
      })
    ).not.toThrow()
  })

  it('enforces allowedHosts when configured', () => {
    expect(() =>
      remoteFetch.assertRemoteUrlAllowed('https://evil.example/a.jpg', {
        allowedHosts: ['cdn.example.com']
      })
    ).toThrow(WechatError)
  })
})
