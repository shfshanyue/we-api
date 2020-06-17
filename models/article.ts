import Model from '../lib/model'

class Article extends Model {
  title: string = '';
  thumb_media_id: string = '';
  author?: string;
  digest?: string;
  content: string = 'Powerd by weichat-api';
  content_source_url?: string;
  show_cover_pic?: 0 | 1 = 1;
  need_open_comment?: 0 | 1 = 1;
  only_fans_can_comment?: 0 | 1 = 1;

  private static _create (article: Article | Article[]) {
    const articles = Array.isArray(article) ? article : [article]
    return this.request({
      url: '/material/add_news',
      method: 'POST',
      params: {
        access_token: this.accessToken
      },
      data: {
        articles
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
  
  private static prepareContent (content: string) {
    const re = /<img.*?src="(.*?)".*?>/g
    return content.replace(re, (x, src) => {
      const weixinSrc = await this.uploadImage(src)
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

export default Article
