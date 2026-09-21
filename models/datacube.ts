import Model from '../lib/model'

const DATACUBE_BASE = 'https://api.weixin.qq.com/datacube'

/** 查询日期范围，格式 `yyyy-MM-dd`，单次最多 7 天（部分接口规则见微信文档） */
export interface DataCubeDateRange {
  beginDate: string;
  endDate: string;
}

export interface DataCubeListResult<T = Record<string, unknown>> {
  list: T[];
}

export class DataCube extends Model {
  private static async query<T = Record<string, unknown>> (
    path: string,
    range: DataCubeDateRange
  ): Promise<DataCubeListResult<T>> {
    const { data } = await this.request({
      url: `${DATACUBE_BASE}/${path}`,
      method: 'POST',
      data: {
        begin_date: range.beginDate,
        end_date: range.endDate
      }
    })
    return data
  }

  /** 用户增减数据 */
  static getUserSummary (range: DataCubeDateRange) {
    return this.query('getusersummary', range)
  }

  /** 累计用户数据 */
  static getUserCumulate (range: DataCubeDateRange) {
    return this.query('getusercumulate', range)
  }

  /** 图文群发每日数据 */
  static getArticleSummary (range: DataCubeDateRange) {
    return this.query('getarticlesummary', range)
  }

  /** 图文阅读分时数据 */
  static getUserReadHour (range: DataCubeDateRange) {
    return this.query('getuserreadhour', range)
  }

  /** 图文转发分时数据 */
  static getUserShareHour (range: DataCubeDateRange) {
    return this.query('getusersharehour', range)
  }

  /** 图文阅读概况数据 */
  static getUserRead (range: DataCubeDateRange) {
    return this.query('getuserread', range)
  }

  /**
   * 图文群发总数据（微信已标记停止维护，建议优先使用 `getArticleRead` 等发表内容接口）
   */
  static getArticleTotal (range: DataCubeDateRange) {
    return this.query('getarticletotal', range)
  }

  /** 图文转发概况数据 */
  static getUserShare (range: DataCubeDateRange) {
    return this.query('getusershare', range)
  }

  /** 发表内容每日阅读数据 */
  static getArticleRead (range: DataCubeDateRange) {
    return this.query('getarticleread', range)
  }

  /** 发表内容每日分享数据 */
  static getArticleShare (range: DataCubeDateRange) {
    return this.query('getarticleshare', range)
  }

  /** 发表内容概况总数据 */
  static getBizSummary (range: DataCubeDateRange) {
    return this.query('getbizsummary', range)
  }

  /** 发表内容发表详细数据 */
  static getArticleTotalDetail (range: DataCubeDateRange) {
    return this.query('getarticletotaldetail', range)
  }

  /** 消息发送概况数据 */
  static getUpstreamMsg (range: DataCubeDateRange) {
    return this.query('getupstreammsg', range)
  }

  /** 消息发送月数据 */
  static getUpstreamMsgMonth (range: DataCubeDateRange) {
    return this.query('getupstreammsgmonth', range)
  }

  /** 消息发送分布周数据 */
  static getUpstreamMsgDistWeek (range: DataCubeDateRange) {
    return this.query('getupstreammsgdistweek', range)
  }

  /** 消息发送分布月数据 */
  static getUpstreamMsgDistMonth (range: DataCubeDateRange) {
    return this.query('getupstreammsgdistmonth', range)
  }

  /** 消息发送分时数据 */
  static getUpstreamMsgHour (range: DataCubeDateRange) {
    return this.query('getupstreammsghour', range)
  }

  /** 消息发送周数据 */
  static getUpstreamMsgWeek (range: DataCubeDateRange) {
    return this.query('getupstreammsgweek', range)
  }

  /** 消息发送分布数据 */
  static getUpstreamMsgDist (range: DataCubeDateRange) {
    return this.query('getupstreammsgdist', range)
  }

  /** 被动回复概要数据 */
  static getInterfaceSummary (range: DataCubeDateRange) {
    return this.query('getinterfacesummary', range)
  }

  /** 被动回复分布数据（分时） */
  static getInterfaceSummaryHour (range: DataCubeDateRange) {
    return this.query('getinterfacesummaryhour', range)
  }
}
