// 爬人体视频相关的脚本
process.on('uncaughtException', function (err) {
  console.error(err)
})

const SuperAgent = require('superagent')
const Http = require('http')
const FS = require('fs')
const Path = require('path')
const { URL } = require('url')
const Model = require('../mongoose/mxr/model')
const ASYNC = require('async')

function downFileWithVideoMAsync (videoM) {
  return new Promise(async function (resolve, reject) {
    if (videoM) {
      let url = videoM.url
      const wrapUrl = new URL(url)
      const httpOption = {
        host: wrapUrl.host,
        method: 'GET',
        path: wrapUrl.pathname
      }

      url = decodeURI(url)
      let urlArray = url.split('/')
      let videoName = urlArray[urlArray.length - 1]
      videoName = videoName.replace('?', '')
      console.log('fileName: ' + videoName)
      let bookName = videoM.name
      let fsWriteStream = FS.createWriteStream(Path.join('D:/人体视频', bookName, videoName))
      let receiveByte = 0
      let progress = 0
      Http.get(httpOption, (res) => {
        let contentType = res && res.headers && res.headers['content-type']
        const statusCode = res && res.statusCode
        const contentLength = res && res.headers && res.headers['content-length']
        console.log('contentLength: ', contentLength, ' ; statusCode: ', statusCode, ' ; contentType : ', contentType, '  ', videoM.url)
        videoM.contentLength = contentLength
        let error = undefined
        if (statusCode !== 200) {
          error = new Error('Request Failed.\n' +
            `Status Code: ${statusCode}`)
        }

        // AWS地址会重定向 地址被重定向了
        if (statusCode === 302 && res.headers && res.headers.location) {
          console.log('>>> 地址重定向  -> ', res.headers.location)
          resolve()
          return
        }

        if (error) {
          console.error('>>> error ', error.message)
        }

        res.setEncoding('binary')
        res.on('data', (chunk) => {
          receiveByte += chunk.length
          fsWriteStream.write(chunk, 'ascii')
          let tmpProgress = receiveByte / contentLength
          if (tmpProgress === 1 || tmpProgress - progress > 0.05) {
            progress = tmpProgress
            console.log('<Progress> : ' + progress + ' \t\t ' + videoM.url)
            if (progress === 1) {
              videoM.state = 1
              videoM.save()
            }
          }
        })
        fsWriteStream.on('close', () => {
          console.log('>>> close')
        })
        res.on('end', () => {
          console.log('>>>>> end')
          resolve()
        }).on('error', (err) => {
          console.log('error >>>>>>', err)
          videoM.state = 1
          videoM.save()
          resolve()
        })
      })
    } else {
      resolve()
    }
  })
}

async function downLoadOperation () {
  let books = [
    'Diabetes',
    'Gynecology',
    'Heart',
    'Otolaryngology',
    'Junior Atlas',
    '解剖学']
  for (let key in books) {
    let bookName = books[key]
    let videos = await Model.MXRTVideo.find({ name: bookName, state: 0 })
    console.log(videos.length)
    ASYNC.mapLimit(videos, 10, async function (videoM) {
      // if (videoM.state === 1) {
      //   videoM.state = 0
      //   await videoM.save()
      // }
      await downFileWithVideoMAsync(videoM)
    })
  }
  console.log('all end !!!!!!')
}

downLoadOperation()
