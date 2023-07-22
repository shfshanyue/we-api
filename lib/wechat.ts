import axios from 'axios'
import Model from './model'
import { Article } from '../models/article'
import { News } from '../models/news'
import { Media } from '../models/media'
import WechatError from './error'

const DEFAULT_GET_TOKEN = () => ''
const DEFAULT_SET_TOKEN = (token: string) => {}

interface Models {
  article: typeof Article;
  news: typeof News;
  media: typeof Media;
}

async function createModel (cls: typeof Model, wechat: Wechat) {
  class ExtendModel extends cls {}
  await ExtendModel.init({ wechat, modelName: cls.name.toLowerCase() })
  return ExtendModel
}

class Wechat {
  appId: string;
  appSecret: string;
  get: () => string | Promise<string>;
  set: (token: string) => void | Promise<void>;
  models: Models & Record<string, typeof Model>;

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
        appId: this.appId,
        secret: this.appSecret,
        grant_type: 'client_credential'
      }
    })
    if (data.errcode) {
      throw new WechatError(data.errmsg, data.errcode)
    }
    return data.access_token
  }

  async sync() {
    await createModel(Article, this)
    await createModel(News, this)
    await createModel(Media, this)
  }

  async getAccessToken() {
    let token
    try {
      token = await this.get()
    } catch (e) {
    }
    if (!token) {
      const refreshToken = await this._getAccessToken()
      await this.set(refreshToken)
      return refreshToken
    }
    return token
  }

  addModel(model: typeof Model) {
    this.models[model.modelName] = model
  }
}

export default Wechat
