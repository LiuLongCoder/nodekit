process.on('uncaughtException', function (err) {
  console.error(err)
})

const Model = require('../mongoose/mxr/model')
const XLSX = require('xlsx')
const { colFromNumber, colOffset, numberOfCol } = require('../../server/util')

async function parseVideoCVS () {
  const path = 'D:/人体视频/解剖学.csv'
  const pathArray = path.split('/')
  let fileName = pathArray[pathArray.length - 1]
  let bookName = fileName.split('.')[0]
  const workbook = XLSX.readFile(path)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  let scope = workbook.Sheets[workbook.SheetNames[0]]['!ref']
  console.log(scope)
  let scopeArray = scope.split(':')

  let rows = []
  let cols = []

  for (let key in scopeArray) {
    let v = scopeArray[key]
    const word = v.match(/^[a-z|A-Z]+/gi)
    cols.push(word[0])
    const number = v.match(/\d+$/gi)
    rows.push(number[0])
  }
  const colBegin = numberOfCol(cols[0])
  const colEnd = numberOfCol(cols[1])
  const rowBegin = parseInt(rows[0])
  const rowEnd = parseInt(rows[1])

  let categoryJson = {}
  let colCategoryJson = {}

  for (let cIdx = colBegin; cIdx <= colEnd; cIdx++) {
    const colKey = colFromNumber(cIdx)
    const sheetKey = colKey + '1'
    if (workbook.Sheets[workbook.SheetNames[0]][sheetKey]) {
      // console.log(workbook.Sheets[workbook.SheetNames[0]][sheetKey]['v'])
      categoryJson[colKey] = workbook.Sheets[workbook.SheetNames[0]][sheetKey]['v']
      colCategoryJson[workbook.Sheets[workbook.SheetNames[0]][sheetKey]['v']] = colKey
    }
  }

  console.log(colCategoryJson['URL'])
  console.log(colCategoryJson['Response Body Size (bytes)'])

  for (let i = 2; i <= rowEnd; i++) {
    let sheetKey = colCategoryJson['URL'] + i
    let url = sheet[sheetKey]['v']
    url = url.replace('https', 'http')
    sheetKey = colCategoryJson['Response Body Size (bytes)'] + i
    let videoM = new Model.MXRTVideo()
    videoM.name = bookName
    videoM.url = url
    console.log(videoM.toJSON())
    try {
      await videoM.save()
    } catch (e) {
      console.log(e)
    }
  }
}

parseVideoCVS()

async function test () {
  let docs = await Model.MXRTVideo.find({ name: 'Atlas of Hypertension' })
  for (let key in docs) {
    let doc = docs[key]
    let urlArray = doc.url.split('/')
    let lastPath = '/' + urlArray[urlArray.length - 1]
    doc.url = doc.url.replace(lastPath, '.mp4')
    doc = await doc.save()
    console.log(doc)
  }
  console.log(docs.length)
}

// test()
