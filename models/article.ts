import pMap from 'p-map'
import _ from 'lodash'
import axios from 'axios'
import path from 'path'

import Model from '../lib/model'

const formstream = require('formstream')

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
      const content = await this.prepareContent(article.content)
      return {
        ..._.mapKeys(article, (value, key) => _.snakeCase(key)),
        content
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
    const { data: buffer } = await axios({
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
    form.buffer('media', buffer, path.basename(src))
    const { data } = await this.request.post('/media/uploadimg', form, {
      headers: form.headers(),
      params: {
        access_token: this.accessToken
      }
    })
    return data.url
  }
  
  private static async prepareContent (content: string) {
    const re = /<img.*?src="(.*?)".*?>/g
    const match = content.matchAll(re)
    const imgs = Array.from(match, x => x[1])

    // 批量上传图片
    const imgList = await pMap(_.uniq(imgs), async (src) => {
      const weixinImg = src.includes('mmbiz') ? src : await this.uploadImage(src)
      return { src, weixinImg }
    }, { concurrency: 3 })
    const imgMap = _.keyBy(imgList, 'src')
    return imgs.reduce((content, src) => {
      const weixinSrc = imgMap[src]?.weixinImg || src
      return content.replace(src, weixinSrc)
    }, content)
  }

  static create (article: Article) {
    return this._create(article)
  }

  static bulkCreate (articles: Article[]) {
    return this._create(articles)
  }
}

