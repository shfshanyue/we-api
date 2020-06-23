import axios from 'axios'
import Model from './model'

const DEFAULT_GET_TOKEN = () => ''
const DEFAULT_SET_TOKEN = (token: string) => {}

class Wechat {
  appId: string;
  appSecret: string;
  get: () => string | Promise<string>;
  set: (token: string) => void | Promise<void>;
  models: Record<string, typeof Model>;

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
    this.models = {}
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
    if (data.errorcode) {
      throw new Error(data.errormsg)
    }
    return data.access_token
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
