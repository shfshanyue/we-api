import axios from 'axios'
import Model from './model'

class Wechat {
  appId: string;
  appSecret: string;
  get: () => Promise<string>;
  set: (token: string) => Promise<void>;
  models: Record<string, typeof Model>;

  constructor(
    appId: string,
    appSecrect: string,
    get: () => Promise<string>,
    set: (token: string) => Promise<void>
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
    console.log('Fetch token by weixin cgi', data)
    if (data.errorcode) {
      throw new Error(data.errormsg)
    }
    return data.access_token
  }

  async getAccessToken() {
    const token = await this.get()
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
