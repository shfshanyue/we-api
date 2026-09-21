import { Article, type ArticleResult } from './article'
import Model from '../lib/model'

export class News extends Model {
  static async create (news: Article[]): Promise<ArticleResult> {
    await Article.init({ wechat: this.wechat })
    return Article.bulkCreate(news)
  }
}
