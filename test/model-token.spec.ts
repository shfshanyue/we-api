import axios from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Wechat from '../lib/wechat'
import { Article } from '../models/article'

const axiosCreate = axios.create.bind(axios)

describe('Wechat refreshAccessToken single-flight', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('deduplicates concurrent refreshAccessToken calls', async () => {
    let tokenFetches = 0
    vi.spyOn(axios, 'request').mockImplementation(async () => {
      tokenFetches += 1
      await new Promise((resolve) => setTimeout(resolve, 25))
      return { data: { access_token: 'token-a' } }
    })

    const wechat = new Wechat('app-id', 'app-secret')
    const [a, b] = await Promise.all([
      wechat.refreshAccessToken(),
      wechat.refreshAccessToken()
    ])

    expect(a).toBe('token-a')
    expect(b).toBe('token-a')
    expect(tokenFetches).toBe(1)
  })
})

describe('Model access token retry', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('refreshes token once and retries when WeChat returns 42001', async () => {
    const wechat = new Wechat(
      'app-id',
      'app-secret',
      () => 'cached-token',
      vi.fn()
    )
    const refreshSpy = vi
      .spyOn(wechat, 'refreshAccessToken')
      .mockResolvedValue('new-token')

    await Article.init({ wechat })

    let draftCountRequests = 0
    vi.spyOn(axios, 'create').mockImplementation((config) => {
      const instance = axiosCreate(config!)
      const baseAdapter = instance.defaults.adapter!
      instance.defaults.adapter = async (config) => {
        const url = config.url ?? ''
        if (url.includes('/draft/count')) {
          draftCountRequests += 1
          if (draftCountRequests === 1) {
            return {
              data: { errcode: 42001, errmsg: 'access_token expired' },
              status: 200,
              statusText: 'OK',
              headers: {},
              config
            }
          }
          return {
            data: { total_count: 2 },
            status: 200,
            statusText: 'OK',
            headers: {},
            config
          }
        }
        return baseAdapter(config)
      }
      return instance
    })

    const result = await Article.count()

    expect(result.total_count).toBe(2)
    expect(refreshSpy).toHaveBeenCalledTimes(1)
    expect(draftCountRequests).toBe(2)
  })
})
