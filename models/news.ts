import Article from './article'
import Model from '../lib/model'

class News extends Model {
  static create (article: Article | Article[]) {
    const articles = Array.isArray(article) ? article : [article]
    this.request({
      url: '/material/add_news',
      method: 'POST',
      params: {
        access_token: 'hello, world'
      },
      data: {
        articles
      }
    })
  }

  static findAndCountAll () {
    
  }
}

