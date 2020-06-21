import fs from 'fs'
import Wechat, { Article } from '../index'

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
    thumbMediaId: 'yspyRwTb0m9UyK78TLER8E_wdRSWjp6KJF8d2p_vVP4',
    title: 'hello, world',
    author: 'shanyue',
    showCoverPic: 0,
    content: '<img src="https://leancloud-gold-cdn.xitu.io/bdfecd06f90e24f88946.jpeg">',
    contentSourceUrl: 'https://github.com/shfshanyue/Daily-Question/issues/1'
  }).then(o => {
    console.log(o.status)
  }).catch(error => {
    console.log(error)
  })
}

main().catch(error => {
  console.error(error)
})
