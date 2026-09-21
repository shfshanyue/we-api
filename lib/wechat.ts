import axios from 'axios'
import Model from './model'
import { Article } from '../models/article'
import { News } from '../models/news'
import { Media } from '../models/media'
import { Publish } from '../models/publish'
import WechatError from './error'

const DEFAULT_GET_TOKEN = () => ''
const DEFAULT_SET_TOKEN = (token: string) => {}

interface Models {
  article: typeof Article;
  news: typeof News;
  media: typeof Media;
  publish: typeof Publish;
}

class Wechat {
  appId: string;
  appSecret: string;
  get: () => string | Promise<string>;
  set: (token: string) => void | Promise<void>;
  models: Models & Record<string, typeof Model>;
  private refreshPromise?: Promise<string>;

  constructor(
    appId: string,
    appSecrect: string,
    get: () => string | Promise<string> = DEFAULT_GET_TOKEN,
    set: (token: string) => void | Promise<void> = DEFAULT_SET_TOKEN
  ) {
    this.appId = appId
    this.appSecret = appSecrect
    this.get = get
    this.set = set
    this.models = {} as any
  }

  private async _getAccessToken(): Promise<string> {
    const { data } = await axios.request({
      url: 'https://api.weixin.qq.com/cgi-bin/token',
      params: {
        appid: this.appId,
        secret: this.appSecret,
        grant_type: 'client_credential'
      }
    })
    if (data.errcode) {
      throw new WechatError(data.errmsg, data.errcode)
    }
    return data.access_token
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshPromise) {
      this.refreshPromise = this._getAccessToken()
        .then(async (token) => {
          await this.set(token)
          return token
        })
        .finally(() => {
          this.refreshPromise = undefined
        })
    }
    return this.refreshPromise
  }

  async sync() {
    await Article.init({ wechat: this, modelName: 'article' })
    await News.init({ wechat: this, modelName: 'news' })
    await Media.init({ wechat: this, modelName: 'media' })
    await Publish.init({ wechat: this, modelName: 'publish' })
  }

  async getAccessToken() {
    const token = await this.get()
    if (!token) {
      return this.refreshAccessToken()
    }
    return token
  }

  addModel(model: typeof Model) {
    this.models[model.modelName] = model
  }
}

export default Wechat
