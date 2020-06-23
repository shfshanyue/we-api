import axios from 'axios'
import Wechat from './wechat'
import WechatError from './error'

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
    const instance = axios.create({
      baseURL: 'https://api.weixin.qq.com/cgi-bin',
      params: {
        access_token: this.accessToken
      }
    })
    instance.interceptors.response.use(async res => {
      const data = res.data
      if (data.errcode) {
        // 表示 token 过期
        if (data.errcode === 42001) {
          await this.wechat.set('')
        }
        throw new WechatError(data.errmsg, data.errcode, {
          response: res
        })
      }
      return res
    })
    return instance
  }

  // As interface
  // static create () {}

  // static bulkCreate () {}

  // static destroy () {}
}

export default Model