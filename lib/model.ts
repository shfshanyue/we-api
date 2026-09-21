import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import Wechat from './wechat'
import WechatError from './error'

const TOKEN_INVALID_CODES = new Set([42001, 40001])

interface WeApiAxiosRequestConfig extends InternalAxiosRequestConfig {
  _weApiRetried?: boolean;
}

class Model {
  public static wechat: Wechat;
  public static modelName: string;
  public static accessToken: string;
  private static _client?: AxiosInstance;

  static async init ({ wechat, modelName }: {
    wechat: Wechat;
    modelName?: string;
  }) {
    this.wechat = wechat
    this.modelName = modelName || this.name.toLowerCase()
    this.accessToken = await wechat.getAccessToken()
    this.wechat.addModel(this)
    this._client = undefined
  }

  protected static assertInitialized () {
    if (!this.wechat) {
      throw new Error(
        `${this.name} is not initialized. Call await ${this.name}.init({ wechat }) or await wechat.sync() first.`
      )
    }
  }

  private static getClient (): AxiosInstance {
    if (!this._client) {
      const ModelClass = this
      const instance = axios.create({
        baseURL: 'https://api.weixin.qq.com/cgi-bin'
      })

      instance.interceptors.request.use(async (config) => {
        const token = await ModelClass.wechat.getAccessToken()
        ModelClass.accessToken = token
        config.params = {
          ...config.params,
          access_token: token
        }
        return config
      })

      instance.interceptors.response.use(
        async (res) => {
          const data = res.data
          if (data.errcode) {
            const config = res.config as WeApiAxiosRequestConfig
            if (
              TOKEN_INVALID_CODES.has(data.errcode) &&
              !config._weApiRetried
            ) {
              config._weApiRetried = true
              ModelClass.accessToken = await ModelClass.wechat.refreshAccessToken()
              return instance.request(config)
            }
            throw new WechatError(data.errmsg, data.errcode, {
              response: res
            })
          }
          return res
        }
      )

      this._client = instance
    }
    return this._client
  }

  static get request (): AxiosInstance {
    this.assertInitialized()
    return this.getClient()
  }

  // As interface
  // static create () {}

  // static bulkCreate () {}

  // static destroy () {}
}

export default Model
