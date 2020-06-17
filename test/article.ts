import fs from 'fs'
import path from 'path'
import Article from '../models/article'
import Wechat from '../lib/wechat'

const fsp = fs.promises

const file = './token.txt'

async function main() {

  const wechat = new Wechat(
    process.env.APP_ID || '',
    process.env.APP_SECRET || '',
    async () => {
      const txt = await fsp.readFile(file, 'utf8')
      return txt
    },
    async (token) => {
      await fsp.writeFile(file, token)
    }
  )
  await Article.init({ wechat, modelName: 'article' })

  Article.create({
    thumb_media_id: 'yspyRwTb0m9UyK78TLER8E_wdRSWjp6KJF8d2p_vVP4',
    title: 'hello, world',
    author: 'shanyue',
    show_cover_pic: 0,
    content: 'hello, world',
    content_source_url: 'https://github.com/shfshanyue/Daily-Question/issues/1'
  }).then(o => {
    console.log(o)
  }).catch(error => {
    console.log(error)
  })
}

main().catch(error => {
  console.error(error)
})