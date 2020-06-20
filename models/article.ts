import pMap from 'p-map'
import _ from 'lodash'

import Model from '../lib/model'

export class Article extends Model {
  title: string = '';
  thumbMediaId: string = '';
  author?: string;
  digest?: string;
  content: string = 'Powerd by weichat-api';
  contentSourceUrl?: string;
  showCoverPic?: 0 | 1 = 1;
  needOpenComment?: 0 | 1 = 1;
  onlyFansCanComment?: 0 | 1 = 1;

  private static async _create (article: Article | Article[]) {
    const articles = Array.isArray(article) ? article : [article]
    const prepareArticles = await pMap(articles, async article => {
      return {
        ..._.mapKeys(article, (value, key) => _.snakeCase(key)),
        content: await this.prepareContent(article.content)
      }
    })
    return this.request({
      url: '/material/add_news',
      method: 'POST',
      params: {
        access_token: this.accessToken
      },
      data: {
        articles: prepareArticles
      }
    })
  }

  private static async uploadImage (src: string): Promise<string> {
    const { data } = await this.request({
      url: '/media/uploadimg',
      method: 'POST',
      params: {
        access_token: this.accessToken
      },
      data: {
        src
      }
    })
    return data.src
  }
  
  private static async prepareContent (content: string) {
    const re = /<img.*?src="(.*?)".*?>/g
    const match = content.matchAll(re)
    const imgs = Array.from(match, x => x[1])

    // 批量上传图片
    const imgCache = await pMap(_.uniq(imgs), async (src) => {
      const weixinImg = src.includes('mmbiz') ? await this.uploadImage(src) : src
      return { src, weixinImg }
    }, { concurrency: 3 })
    const imgMap = _.keyBy(imgCache, 'src')
    return content.replace(re, (x, src) => {
      const weixinSrc = imgMap[src]?.weixinImg || src
      return weixinSrc
    })
  }

  static create (article: Article) {
    return this._create(article)
  }

  static bulkCreate (articles: Article[]) {
    return this._create(articles)
  }
}

