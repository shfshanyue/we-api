import axios from 'axios'
import Wechat from './wechat'

class Model {
  public static wechat: Wechat;
  public static modelName: string;
  public static accessToken: string;

  static async init ({ wechat, modelName }: {
    wechat: Wechat;
    modelName: string;
  }) {
    this.wechat = wechat
    this.modelName = modelName
    this.accessToken = await wechat.getAccessToken()
    this.wechat.addModel(this)
  }

  static get request () {
    return axios.create({
      baseURL: 'https://api.weixin.qq.com/cgi-bin',
      params: {
        access_token: this.accessToken
      }
    })
  }

  // As interface
  // static create () {}

  // static bulkCreate () {}

  // static destroy () {}
}

export default Model