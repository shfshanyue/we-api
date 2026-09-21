import Model from '../lib/model'

export interface PublishSubmitResult {
  publish_id: string;
  msg_data_id?: string;
}

export interface PublishStatusResult {
  publish_id: string;
  publish_status: number;
  article_id?: string;
  article_detail?: Record<string, unknown>;
  fail_idx?: number[];
}

export interface PublishBatchGetParams {
  offset: number;
  count: number;
  noContent?: number;
}

export interface PublishBatchGetResult {
  total_count: number;
  item_count: number;
  item: Record<string, unknown>[];
}

export interface PublishGetArticleResult {
  news_item: Record<string, unknown>[];
  errcode?: number;
  errmsg?: string;
}

export class Publish extends Model {
  static async submit ({ mediaId }: { mediaId: string }): Promise<PublishSubmitResult> {
    const { data } = await this.request({
      url: '/freepublish/submit',
      method: 'POST',
      params: {
        access_token: this.accessToken
      },
      data: {
        media_id: mediaId
      }
    })
    return data
  }

  static async getStatus ({ publishId }: { publishId: string }): Promise<PublishStatusResult> {
    const { data } = await this.request({
      url: '/freepublish/get',
      method: 'POST',
      params: {
        access_token: this.accessToken
      },
      data: {
        publish_id: publishId
      }
    })
    return data
  }

  static async batchGet (params: PublishBatchGetParams): Promise<PublishBatchGetResult> {
    const { data } = await this.request({
      url: '/freepublish/batchget',
      method: 'POST',
      params: {
        access_token: this.accessToken
      },
      data: {
        offset: params.offset,
        count: params.count,
        no_content: params.noContent
      }
    })
    return data
  }

  static async getArticle ({ articleId }: { articleId: string }): Promise<PublishGetArticleResult> {
    const { data } = await this.request({
      url: '/freepublish/getarticle',
      method: 'POST',
      params: {
        access_token: this.accessToken
      },
      data: {
        article_id: articleId
      }
    })
    return data
  }

  static async destroy ({
    articleId,
    index
  }: {
    articleId: string;
    index?: number;
  }): Promise<Record<string, unknown>> {
    const { data } = await this.request({
      url: '/freepublish/delete',
      method: 'POST',
      params: {
        access_token: this.accessToken
      },
      data: {
        article_id: articleId,
        index
      }
    })
    return data
  }
}
