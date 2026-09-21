import { map, mapKeys, snakeCase, uniq, keyBy } from 'midash'
import path from 'path'

import Model from '../lib/model'
import { fetchRemoteBuffer } from '../lib/remote-fetch'

import formstream from 'formstream'

export interface ArticleResult {
  media_id: string;
  url: string;
  item: Record<string, unknown>[];
}

export interface DraftBatchGetParams {
  offset: number;
  count: number;
  noContent?: number;
}

export interface ArticleDraftListResult {
  total_count: number;
  item_count: number;
  item: Record<string, unknown>[];
}

export interface ArticleDraftGetResult {
  news_item: Record<string, unknown>[];
}

export interface ArticleDraftCountResult {
  total_count: number;
}

export type ArticleInput = Partial<Article> & {
  title?: string;
  thumbMediaId?: string;
  content?: string;
}

export class Article extends Model {
  title: string = '';
  thumbMediaId: string = '';
  author?: string;
  digest?: string;
  content: string = 'Powered by we-api';
  contentSourceUrl?: string;
  showCoverPic?: 0 | 1 = 1;
  needOpenComment?: 0 | 1 = 1;
  onlyFansCanComment?: 0 | 1 = 1;

  private static async _create(article: Article | Article[]): Promise<ArticleResult> {
    const articles = Array.isArray(article) ? article : [article]
    const prepareArticles = await map(articles, async article => {
      const content = await this.prepareContent(article.content)
      return {
        ...mapKeys(article as any, (value, key) => snakeCase(key)),
        content
      }
    })
    const { data } = await this.request({
      url: '/draft/add',
      method: 'POST',
      data: {
        articles: prepareArticles
      }
    })
    return data
  }

  private static async uploadImage(src: string, name?: string): Promise<string> {
    const { buffer, headers } = await fetchRemoteBuffer(
      src,
      this.wechat.options.remoteFetch
    )

    const form = formstream();
    // 这里的 `.jpg` 本来毫无意义，但是微信服务器会根据后缀判断是否可以上传
    const contentType = headers['content-type']
    form.buffer(
      'media',
      buffer,
      path.basename(src) + '.jpg',
      contentType != null ? String(contentType) : undefined
    )
    const { data } = await this.request.post('/media/uploadimg', form, {
      headers: form.headers()
    })
    return data.url
  }

  private static async prepareContent(content: string) {
    const re = /<img.*?src="(.*?)".*?>|background-image: url\((.*?)\)/g
    const match = content.matchAll(re)
    const imgs = Array.from(match, x => x[1] || x[2])

    // 批量上传图片
    const imgList = await map(uniq(imgs), async (src) => {
      let weixinImg = src
      if (!src.includes('mmbiz')) {
        try {
          weixinImg = await this.uploadImage(src)
        } catch (error) {
          if (this.wechat.options.strictImages) {
            throw error
          }
          weixinImg = ''
        }
      }
      return { src, weixinImg }
    }, { concurrency: 3 })
    const imgMap = keyBy(imgList, x => x.src)
    return imgs.reduce((content, src) => {
      const weixinSrc = imgMap[src]?.weixinImg || src
      return content.replace(src, weixinSrc)
    }, content)
  }

  private static async toSnakeArticleFields (article: ArticleInput) {
    let fields = { ...article }
    if (article.content != null) {
      fields = {
        ...fields,
        content: await this.prepareContent(article.content)
      }
    }
    return mapKeys(fields as Record<string, unknown>, (value, key) => snakeCase(key))
  }

  static create(article: Article) {
    return this._create(article)
  }

  static bulkCreate(articles: Article[]) {
    return this._create(articles)
  }

  static async findOne ({ mediaId }: { mediaId: string }): Promise<ArticleDraftGetResult> {
    const { data } = await this.request({
      url: '/draft/get',
      method: 'POST',
      data: {
        media_id: mediaId
      }
    })
    return data
  }

  static async findAll (params: DraftBatchGetParams): Promise<ArticleDraftListResult> {
    const { data } = await this.request({
      url: '/draft/batchget',
      method: 'POST',
      data: {
        offset: params.offset,
        count: params.count,
        no_content: params.noContent
      }
    })
    return data
  }

  static async count (): Promise<ArticleDraftCountResult> {
    const { data } = await this.request({
      url: '/draft/count',
      method: 'GET'
    })
    return data
  }

  static async update ({
    mediaId,
    index,
    article
  }: {
    mediaId: string;
    index: number;
    article: ArticleInput;
  }): Promise<Record<string, unknown>> {
    const articles = await this.toSnakeArticleFields(article)
    const { data } = await this.request({
      url: '/draft/update',
      method: 'POST',
      data: {
        media_id: mediaId,
        index,
        articles
      }
    })
    return data
  }

  static async destroy ({ mediaId }: { mediaId: string }): Promise<Record<string, unknown>> {
    const { data } = await this.request({
      url: '/draft/delete',
      method: 'POST',
      data: {
        media_id: mediaId
      }
    })
    return data
  }
}
