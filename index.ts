export * from './models/article'
export * from './models/news'
export * from './models/publish'
export * from './models/datacube'
export { default as WechatError } from './lib/error'
export type { WechatOptions, RemoteFetchOptions } from './lib/wechat'

import Wechat from './lib/wechat'

export default Wechat
