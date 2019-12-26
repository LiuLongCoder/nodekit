const fs = require('fs')
const path = require('path')


const filePath = '/Users/Martin/Dev/识别/中少/中少伴读10本PDF/饼干加工厂'

let books = []

function bianliFiles () {
  fs.readdir(filePath, function (err, files) {
    if (err) {
      console.log('>>> read dir error : ', err)
    } else {
      files.forEach(function (fileName) {
        let fileDir = path.join(filePath, fileName)
        try {
          let stats = fs.statSync(fileDir)
          let isFile = stats.isFile()
          if (isFile) {
            // console.log('>>>> file : ', fileDir)
            books.push(fileDir)
          }
        } catch (ex) {
          console.log('>>> stat error ', ex)
        }
      })
      console.log('>>>> books ', books)
    }
  })
}

bianliFiles()
