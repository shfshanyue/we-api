import _ from 'lodash'
import axios from 'axios'
import path from 'path'

import Model from '../lib/model'

const formstream = require('formstream')

interface MediaResult {
  media_id: string;
  url: string;
  item: any[]
}

export class Media extends Model {
  type: 'image' | 'voice' | 'video' | 'thumb' = 'image';

  // One url of media
  src: string = '';

  static async create (media: Media): Promise<MediaResult> {
    const { data: buffer } = await axios({
      url: media.src,
      responseType: 'arraybuffer'
    })
    const form = formstream();
    form.buffer('media', buffer, path.basename(media.src))
    const { data } = await this.request.post('/material/add_material', form, {
      headers: form.headers(),
      params: {
        access_token: this.accessToken,
        type: media.type
      }
    })
    return data as MediaResult
  }
}
