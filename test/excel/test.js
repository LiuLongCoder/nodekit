const XLSX = require('xlsx')
const { numberOfCol, colFromNumber } = require('./exceltool')
const Model = require('../mongoose/mxr/model')

// Model.MXRTDebug.find({}, (err, docs) => {
//   console.log(docs)
// })
// return

const codeNumberJson = {
  '王纪凯': 16198,
  '王东升': 37766,
  '孙凯': 93283,
  '武元元': 325,
  '陈冬': 27078,
  '宋维超': 6653,
  '倪泽民': 23097,
  '宋晓勇': 2858,
  '杨泽龙': 5033,
  '王峥': 32,
  '曹言桩': 4835,
  '曹广东': 17203,
  '刘龙': 3150,
  '项大山': 20720,
  '孔峰': 12472,
  '高伟龙': 0,
  '宋雨': 0,
  '戢灿': 0,
  '刘元龙': 0,
  '张青林': 0,
  '郑宗恒': 0,
  '朱亮宇': 0,
  '何晓辉': 0
}

// const excelPath = path.join(__dirname, '7月份bug确认.xlsx')

const excelPath = 'F:\\Users\\Martin\\Documents\\WeChat Files\\WeChat Files\\bigdragondev\\FileStorage\\File\\2019-09\\八月份bugs统计.xlsx'
// const excelPath = 'F:\\Users\\Martin\\Documents\\WeChat Files\\WeChat Files\\bigdragondev\\FileStorage\\File\\2019-09\\bug统计图.xlsx'
const workbook = XLSX.readFile(excelPath)
// console.log(workbook.Sheets[workbook.SheetNames[10]])
// return

let sheet = {
  '!ref': 'A1:K100',
  A1: { t: 's', v: '权重', h: '权重', w: '权重' },
  B1: { t: 'n', v: 50, w: '50' },
  C1: { t: 'n', v: 20, w: '20' },
  D1: { t: 'n', v: 10, w: '10' },
  E1: { t: 'n', v: 5, w: '5' },
  F1: { t: 'n', v: 2, w: '2' },
  J1: { t: 's', v: '标准：10000行5个bug=1', h: '标准：10000行5个bug=1', w: '标准：10000行5个bug=1' },
  A2: { t: 's', v: '姓名', h: '姓名', w: '姓名' },
  B2: { t: 's', v: '一级bug', h: '一级bug', w: '一级bug' },
  C2: { t: 's', v: '二级bug', h: '二级bug', w: '二级bug' },
  D2: { t: 's', v: '三级bug', h: '三级bug', w: '三级bug' },
  E2: { t: 's', v: '四级bug', h: '四级bug', w: '四级bug' },
  F2: { t: 's', v: '五级bug', h: '五级bug', w: '五级bug' },
  G2: { t: 's', v: 'bug总数', h: 'bug总数', w: 'bug总数' },
  H2: { t: 's', v: '总权数', h: '总权数', w: '总权数' },
  I2: { t: 's', v: '代码行数', h: '代码行数', w: '代码行数' },
  J2: { t: 's', v: '代码质量（缺小越好）', h: '代码质量（缺小越好）', w: '代码质量（缺小越好）' },
  K2: { t: 's', v: '差', h: '差', w: '差' }
}

let wb = {
  SheetNames: ['Sheet1'],
  Sheets: {
    Sheet1: sheet
  }
}

// console.log(workbook.SheetNames[10])
// let wb = {
//   SheetNames: ["Sheet1"],
//   Sheets: {
//     Sheet1: workbook.Sheets[workbook.SheetNames[10]]
//   }
// }
// XLSX.writeFile(wb, 'haha.xlsx')
// return

// console.log(workbook.Sheets[workbook.SheetNames[0]]['!ref'])

let scope = workbook.Sheets[workbook.SheetNames[0]]['!ref']
console.log(scope)
let scopeArray = scope.split(':')
console.log(scopeArray)

let rows = []
let cols = []

for (let key in scopeArray) {
  let v = scopeArray[key]
  const word = v.match(/^[a-z|A-Z]+/gi)
  cols.push(word[0])
  const number = v.match(/\d+$/gi)
  rows.push(number[0])
}
// rows[1] = 'CBA'
console.log('rows :', rows)
console.log('cols :', cols)

const colBegin = numberOfCol(cols[0])
const colEnd = numberOfCol(cols[1])
const rowBegin = parseInt(rows[0])
const rowEnd = parseInt(rows[1])

let categoryJson = {}

for (let cIdx = colBegin; cIdx <= colEnd; cIdx++) {
  const colKey = colFromNumber(cIdx)
  const sheetKey = colKey + '1'
  if (workbook.Sheets[workbook.SheetNames[0]][sheetKey]) {
    // console.log(workbook.Sheets[workbook.SheetNames[0]][sheetKey]['v'])
    categoryJson[colKey] = workbook.Sheets[workbook.SheetNames[0]][sheetKey]['v']
  }
}

console.log('.... ', categoryJson)

let array = []
for (let rIdx = rowBegin + 1; rIdx <= rowEnd; rIdx++) {
  let oneRecord = {}
  for (let cIdx = colBegin; cIdx <= colEnd; cIdx++) {
    const colKey = colFromNumber(cIdx)
    const sheetKey = colKey + rIdx
    if (workbook.Sheets[workbook.SheetNames[0]][sheetKey]) {
      // console.log(workbook.Sheets[workbook.SheetNames[0]][sheetKey]['v'])
      // oneRecord[sheetKey] = workbook.Sheets[workbook.SheetNames[0]][sheetKey]['v']
      oneRecord[categoryJson[colKey]] = workbook.Sheets[workbook.SheetNames[0]][sheetKey]['v']
    }
  }
  array.push(oneRecord)
}

console.log(array)

/// 输出每个人的bug等级以及对应的bug数
let analysisJson = {}
for (let key in array) {
  let oneRecord = array[key]
  let person = oneRecord['解决者']
  let oneJson = {}
  if (analysisJson[person]) {
    oneJson = analysisJson[person]
  } else {
    analysisJson[person] = oneJson
  }
  let bugLevel = oneRecord['严重程度']
  if (oneJson[bugLevel]) {
    oneJson[bugLevel] += 1
  } else {
    oneJson[bugLevel] = 1
  }
}

for (let key in codeNumberJson) {
  if (analysisJson[key] === undefined) {
    analysisJson[key] = { 'codeNumber': codeNumberJson[key] }
  } else {
    analysisJson[key]['codeNumber'] = codeNumberJson[key]
  }
}

async function saveAnalysisJson(analysisJ) {
  for (let key in analysisJ) {
    const user = await Model.MXRTUser.findOne({'name': key})
    if (user) {
      const bugModel = Model.MXRTDebug()
      bugModel.user = user._id
      bugModel.bugIndex = '201908'
      const oneJson = analysisJ[key]
      for (let bugLevel in oneJson) {
        if (!bugLevel.match(/^[0-9]*$/)) {
          continue
        }
        bugModel['level' + bugLevel] = oneJson[bugLevel]
      }
      bugModel.codeLine = oneJson['codeNumber']
      bugModel.save()
    }
  }
  return
  const colLevel1 = colFromNumber(2)
  const colLevel2 = colFromNumber(3)
  const colLevel3 = colFromNumber(4)
  const colLevel4 = colFromNumber(5)
  const colLevel5 = colFromNumber(6)
  const colBugTotal = colFromNumber(7)
  const colBugValue = colFromNumber(8)
  const colCodeLine = colFromNumber(9)
  const colCodeQuality = colFromNumber(10)
  let rowIdx = 3
  let docs = await Model.MXRTDebug.find({bugIndex: '201908'}).populate('user')
  console.log(docs)
  for (let key in docs) {
    const bugModel = docs[key]
    sheet['A' + rowIdx] = { t: 's', v: bugModel.user.name, h: bugModel.user.name, w: bugModel.user.name }
    if (bugModel.level1 > 0)
      sheet[colLevel1 + rowIdx] = { t: 'n', v: bugModel.level1, w: '' + bugModel.level1 } // bug1数量
    if (bugModel.level2 > 0)
      sheet[colLevel2 + rowIdx] = { t: 'n', v: bugModel.level2, w: '' + bugModel.level2 } // bug2数量
    if (bugModel.level3 > 0)
      sheet[colLevel3 + rowIdx] = { t: 'n', v: bugModel.level3, w: '' + bugModel.level3 } // bug3数量
    if (bugModel.level4 > 0)
      sheet[colLevel4 + rowIdx] = { t: 'n', v: bugModel.level4, w: '' + bugModel.level4 } // bug4数量
    if (bugModel.level5 > 0)
      sheet[colLevel5 + rowIdx] = { t: 'n', v: bugModel.level5, w: '' + bugModel.level5 } // bug5数量
    sheet[colBugTotal + rowIdx] = { t: 'n', v: bugModel.totalBugNum, w: '' + bugModel.totalBugNum } // bug总数量
    sheet[colBugValue + rowIdx] = { t: 'n', v: bugModel.totalBugValue, w: '' + bugModel.totalBugValue } // bug权重
    if (bugModel.codeLine > 0)
      sheet[colCodeLine + rowIdx] = { t: 'n', v: bugModel.codeLine, w: '' + bugModel.codeLine } // 代码行数
    if (bugModel.codeLine > 0)
    sheet[colCodeQuality + rowIdx] = { t: 'n', v: bugModel.codeQuality.toFixed(3), w: '' + bugModel.codeQuality.toFixed(3) } // 代码质量
    rowIdx++
  }

  XLSX.writeFile(wb, 'test22.xlsx')
}


console.log(analysisJson)

saveAnalysisJson(analysisJson)

return

let rowIdx = 3
for (let key in analysisJson) {
  const oneJson = analysisJson[key]
  sheet['A' + rowIdx] = { t: 's', v: key, h: key, w: key }
  let totalBug = 0 // bug总数
  let totalBugValue = 0 // bug权重
  for (let bugLevel in oneJson) {
    if (!bugLevel.match(/^[0-9]*$/)) {
      continue
    }
    const colCor = colFromNumber(parseInt(bugLevel) + 1)
    const value = oneJson[bugLevel]
    switch (parseInt(bugLevel)) {
      case 1:
        totalBugValue += value * 50
        break
      case 2:
        totalBugValue += value * 20
        break
      case 3:
        totalBugValue += value * 10
        break
      case 4:
        totalBugValue += value * 5
        break
      case 5:
        totalBugValue += value * 5
        break
    }
    sheet[colCor + rowIdx] = { t: 'n', v: value, w: '' + value } // bug数量
    sheet['H' + rowIdx] = { t: 'n', v: totalBugValue, w: '' + totalBugValue } // bug权重
    totalBug += oneJson[bugLevel]
  }
  sheet['G' + rowIdx] = { t: 'n', v: totalBug, w: '' + totalBug } // bug总数
  let codeNumbers = oneJson['codeNumber']
  if (codeNumbers === undefined || codeNumbers === null || codeNumbers === 0) {
    codeNumbers = 0
  } else {
    sheet['I' + rowIdx] = { t: 'n', v: codeNumbers, w: '' + codeNumbers } // 代码行数
  }
  let codeQuality = 0
  if (codeNumbers && codeNumbers > 0) {
    codeQuality = totalBug / 5 / (codeNumbers / 10000)
    sheet['J' + rowIdx] = { t: 'n', v: codeQuality, w: '' + codeQuality } // 代码质量
  }
  rowIdx++
}

/// 输出想要的列的展示
// let keyArray = ['Bug编号', '解决者', '严重程度']
// let filterArray = []
// for (let key in array) {
//   let filterJson = {}
//   let oneRecord = array[key]
//   for (let idx in keyArray) {
//     let filterKey = keyArray[idx]
//     if (oneRecord[filterKey]) {
//       filterJson[filterKey] = oneRecord[filterKey]
//     }
//   }
//   filterArray.push(filterJson)
// }
//
// console.log(filterArray)

console.log(wb)
XLSX.writeFile(wb, 'test.xlsx')
