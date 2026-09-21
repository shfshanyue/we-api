import { describe, expect, it } from 'vitest'
import Wechat from '../lib/wechat'
import { Article } from '../models/article'

describe('strictImages option', () => {
  it('defaults to false and can be enabled on Wechat', () => {
    const loose = new Wechat('app', 'secret')
    expect(loose.options.strictImages).toBe(false)

    const strict = new Wechat('app', 'secret', undefined, undefined, {
      strictImages: true
    })
    expect(strict.options.strictImages).toBe(true)
  })

  it('rejects failed remote fetch in prepareContent when strict', async () => {
    const wechat = new Wechat(
      'app',
      'secret',
      () => 'token',
      () => undefined,
      { strictImages: true }
    )
    await Article.init({ wechat })

    const uploadImage = (Article as unknown as {
      uploadImage: (src: string) => Promise<string>;
    }).uploadImage.bind(Article)

    await expect(
      uploadImage('http://127.0.0.1/private.jpg')
    ).rejects.toBeInstanceOf(Error)
  })
})
