class WechatError extends Error {
  readonly code?: number;
  readonly extensions?: Record<string, any>;

  constructor(
    message: string,
    code?: number | string,
    extensions?: Record<string, any>
  ) {
    const numCode =
      code != null && !Number.isNaN(Number(code)) ? Number(code) : undefined
    super(numCode != null ? `Wechat Code ${numCode}: ${message}` : message)
    this.name = 'WechatError'
    this.code = numCode
    this.extensions = extensions
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export default WechatError
