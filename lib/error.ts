class WechatError extends Error {
  readonly code?: string;
  readonly extensions?: Record<string, any>;

  constructor(
    message: string,
    code?: string,
    extensions?: Record<string, any>
  ) {
    super(code ? `Wechat Code ${code}: ${message}` : message)
    this.code = code
    this.extensions = extensions
  }
}

export default WechatError
