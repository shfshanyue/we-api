import axios, { getAdapter } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Wechat from '../lib/wechat'
import { DataCube } from '../models/datacube'

const axiosCreate = axios.create.bind(axios)

describe('DataCube', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('posts date range to datacube endpoint with access_token', async () => {
    const wechat = new Wechat(
      'app-id',
      'app-secret',
      () => 'cached-token',
      vi.fn()
    )
    await DataCube.init({ wechat })

    let capturedUrl = ''
    let capturedData: Record<string, unknown> | undefined
    let capturedParams: Record<string, unknown> | undefined

    vi.spyOn(axios, 'create').mockImplementation((config) => {
      const instance = axiosCreate(config!)
      const baseAdapter = getAdapter(instance.defaults.adapter)
      instance.defaults.adapter = async (config) => {
        capturedUrl = config.url ?? ''
        capturedData = config.data as Record<string, unknown>
        capturedParams = config.params as Record<string, unknown>
        return {
          data: {
            list: [{ ref_date: '2024-01-01', cumulate_user: 1 }]
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      }
      return instance
    })

    const result = await DataCube.getUserCumulate({
      beginDate: '2024-01-01',
      endDate: '2024-01-07'
    })

    expect(capturedUrl).toBe(
      'https://api.weixin.qq.com/datacube/getusercumulate'
    )
    const body =
      typeof capturedData === 'string'
        ? JSON.parse(capturedData)
        : capturedData
    expect(body).toEqual({
      begin_date: '2024-01-01',
      end_date: '2024-01-07'
    })
    expect(capturedParams?.access_token).toBe('cached-token')
    expect(result.list[0].cumulate_user).toBe(1)
  })
})
