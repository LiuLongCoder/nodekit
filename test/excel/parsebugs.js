const XLSX = require('xlsx')
const { numberOfCol, colFromNumber } = require('./exceltool')
const Model = require('../mongoose/mxr/model')

async function parseBugs () {
  let docs = await Model.MXRTUser.find()
  let userJson = {}
  if (docs.length > 0) {
    for (let idx in docs) {
      const user = docs[idx]
      userJson[user.name] = user
    }
    // console.log(userJson)
  }
  const excelPath = 'F:\\DeveloperProject\\Node\\nodekit\\test\\excel\\bugs.xlsx'
  const workbook = XLSX.readFile(excelPath)
  for (let sheetIdx in workbook.SheetNames) {
    console.log(workbook.SheetNames[sheetIdx])
    if (sheetIdx >= 2 || parseInt(sheetIdx) >= 2) {
      let sheet = workbook.Sheets[workbook.SheetNames[sheetIdx]]
      const scope = sheet['!ref']
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

      let colJson = {}
      for (let colIndex = 1; colIndex < numberOfCol(cols[1]) + 1; colIndex++) {
        console.log(colFromNumber(colIndex))
        console.log(sheet[colFromNumber(colIndex) + '1'])
        colJson[sheet[colFromNumber(colIndex) + '1']['v']] = colFromNumber(colIndex)
      }
      console.log(colJson)

      for (let rowIdx = 2; rowIdx <= parseInt(rows[1]); rowIdx++) {
        const userName = sheet['A' + rowIdx]['v']
        let userM = userJson[userName]
        if (userM) {
          let bugM = new Model.MXRTDebug()
          bugM.bugIndex = workbook.SheetNames[sheetIdx]
          bugM.user = userM._id
          if (sheet[colJson['一级bug'] + rowIdx]) {
            bugM.level1 = sheet[colJson['一级bug'] + rowIdx]['v']
          }
          if (sheet[colJson['二级bug'] + rowIdx]) {
            bugM.level2 = sheet[colJson['二级bug'] + rowIdx]['v']
          }
          if (sheet[colJson['三级bug'] + rowIdx]) {
            bugM.level3 = sheet[colJson['三级bug'] + rowIdx]['v']
          }
          if (sheet[colJson['四级bug'] + rowIdx]) {
            bugM.level4 = sheet[colJson['四级bug'] + rowIdx]['v']
          }
          if (sheet[colJson['五级bug'] + rowIdx]) {
            bugM.level5 = sheet[colJson['五级bug'] + rowIdx]['v']
          }
          if (sheet[colJson['代码行数'] + rowIdx]) {
            bugM.codeLine = sheet[colJson['代码行数'] + rowIdx]['v']
          }
          console.log('>>>>>', bugM)
          await bugM.save()
        }
      }
      //
      // console.log('rows :', rows)
      // console.log('cols :', cols)
      // console.log(workbook.Sheets[workbook.SheetNames[idx]])
    }
  }
  // let scope = workbook.Sheets[workbook.SheetNames[0]]['!ref']
}

parseBugs()
