export * from './models/article'
export * from './models/news'
export * from './models/publish'
export { default as WechatError } from './lib/error'

import Wechat from './lib/wechat'

export default Wechat
