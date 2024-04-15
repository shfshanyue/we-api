import { map, mapKeys, snakeCase, uniq, keyBy } from 'midash'
import axios from 'axios'
import path from 'path'

import Model from '../lib/model'

import formstream from 'formstream'

interface ArticleResult {
  media_id: string;
  url: string;
  item: any[]
}

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
      params: {
        access_token: this.accessToken
      },
      data: {
        articles: prepareArticles
      }
    })
    return data
  }

  private static async uploadImage(src: string, name?: string): Promise<string> {
    const { data: buffer, headers } = await axios({
      url: src,
      responseType: 'arraybuffer'
    })

    // FormData cant work
    // const form = new FormData()
    // form.append('media', fs.createReadStream(path.resolve(__dirname, 'hello.jpg')), {
    //   knownLength: 29506,
    //   contentType: 'image/jpeg',
    //   filename: 'hello.jpg'
    // })
    const form = formstream();
    // 这里的 `.jpg` 本来毫无意义，但是微信服务器会根据后缀判断是否可以上传
    form.buffer('media', buffer, path.basename(src) + '.jpg', headers['content-type'])
    const { data } = await this.request.post('/media/uploadimg', form, {
      headers: form.headers(),
      params: {
        access_token: this.accessToken
      }
    })
    return data.url
  }

  private static async prepareContent(content: string) {
    const re = /<img.*?src="(.*?)".*?>|background-image: url\((.*?)\)/g
    const match = content.matchAll(re)
    const imgs = Array.from(match, x => x[1] || x[2])

    // 批量上传图片
    const imgList = await map(uniq(imgs), async (src) => {
      const weixinImg = src.includes('mmbiz') ? src : await this.uploadImage(src).catch(e => '')
      return { src, weixinImg }
    }, { concurrency: 3 })
    const imgMap = keyBy(imgList, x => x.src)
    return imgs.reduce((content, src) => {
      const weixinSrc = imgMap[src]?.weixinImg || src
      return content.replace(src, weixinSrc)
    }, content)
  }

  static create(article: Article) {
    return this._create(article)
  }

  static bulkCreate(articles: Article[]) {
    return this._create(articles)
  }
}

