import { Article } from './article'
import Model from '../lib/model'

export class News extends Model {
  static create (news: Article[]) {
    return Article.bulkCreate(news)
  }

  static findAndCountAll () {
    
  }
}
