const XLSX = require('xlsx')
const { numberOfCol, colFromNumber } = require('./exceltool')
const Model = require('../mongoose/mxr/model')

async function buildXLSX () {
  let bugIndexArray = await Model.MXRTDebug.find().distinct('bugIndex')
  if (!bugIndexArray || bugIndexArray.length === 0) {
    console.log('docs is not exception :', bugIndexArray)
    return
  }
  bugIndexArray.sort()
  let SheetNames = []
  let Sheets = {}
  let wb = {
    'SheetNames': SheetNames,
    'Sheets': Sheets
  }
  for (let bugIdx in bugIndexArray) {
    const bugIndex = bugIndexArray[bugIdx]
    let bugArray = await Model.MXRTDebug.find({ 'bugIndex': bugIndex }).populate('user')
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
      K2: { t: 's', v: '差->好', h: '差->好', w: '差->好' }
    }
    let rowIdx = 3
    bugArray.sort(function (bugA, bugB) {
      return bugB.totalBugValue - bugA.totalBugValue // 降序
    })
    for (let bugKey in bugArray) {
      let bugM = bugArray[bugKey]
      sheet['A' + rowIdx] = { t: 's', v: bugM.user.name, h: bugM.user.name, w: bugM.user.name }
      if (bugM.level1 > 0) {
        sheet['B' + rowIdx] = { t: 'n', v: bugM.level1, w: '' + bugM.level1 } // bug1数量
      }
      if (bugM.level2 > 0) {
        sheet['C' + rowIdx] = { t: 'n', v: bugM.level2, w: '' + bugM.level2 } // bug2数量
      }
      if (bugM.level3 > 0) {
        sheet['D' + rowIdx] = { t: 'n', v: bugM.level3, w: '' + bugM.level3 } // bug3数量
      }
      if (bugM.level4 > 0) {
        sheet['E' + rowIdx] = { t: 'n', v: bugM.level4, w: '' + bugM.level4 } // bug4数量
      }
      if (bugM.level5 > 0) {
        sheet['F' + rowIdx] = { t: 'n', v: bugM.level5, w: '' + bugM.level5 } // bug5数量
      }
      sheet['G' + rowIdx] = { t: 'n', v: bugM.totalBugNum, w: '' + bugM.totalBugNum } // bug总数
      sheet['H' + rowIdx] = { t: 'n', v: bugM.totalBugValue, w: '' + bugM.totalBugValue } // bug总数
      if (bugM.codeLine > 0) {
        sheet['I' + rowIdx] = { t: 'n', v: bugM.codeLine, w: '' + bugM.codeLine } // 代码数量
        sheet['J' + rowIdx] = { t: 'n', v: bugM.codeQuality.toFixed(3), w: '' + bugM.codeQuality.toFixed(3) } // 代码质量
      }
      rowIdx++
    }
    SheetNames.push(bugIndex)
    Sheets[bugIndex] = sheet
  }
  XLSX.writeFile(wb, 'buildBugs.xlsx')
}

function compareStr (str1, str2) {
  if (typeof str1 === 'string' && typeof str2 === 'string') {
    for (let idx = 0; idx < Math.min(str1.length, str2.length); idx++) {
      if (str1.charCodeAt(idx) !== str2.charCodeAt(idx)) {
        return str1.charCodeAt(idx) - str2.charCodeAt(idx)
      }
    }
    if (str1.length === str2.length) {
      return 0
    } else {
      return str1.length - str2.length
    }
  }
  return 0
}

// buildXLSX()
async function buildAnalysisXLSX () {
  let bugIndexArray = await Model.MXRTDebug.find().distinct('bugIndex')
  if (!bugIndexArray || bugIndexArray.length === 0) {
    console.log('docs is not exception :', bugIndexArray)
    return
  }
  bugIndexArray.sort()
  let SheetNames = []
  let Sheets = {}
  let wb = {
    'SheetNames': SheetNames,
    'Sheets': Sheets
  }

  let userArray = await Model.MXRTUser.find().populate('department')
  if (!userArray && userArray.length === 0) {
    console.log('user is not exception :', userArray)
    return
  }
  userArray.sort(function (userA, userB) {
    return compareStr(userA.department.name, userB.department.name)
  })

  const colTotal = colFromNumber(bugIndexArray.length + 1)
  const rowTotal = userArray.length + 1
  let sheet = { '!ref': 'A1:' + colTotal + rowTotal }

  let colIdx = 1
  let rowIdx = 1
  let analysisJson = {}
  // bug总数
  sheet['A' + 1] = { t: 's', v: '姓名/bug数量', h: '姓名/bug数量', w: '姓名/bug数量' }
  for (let idx = 0; idx < bugIndexArray.length; idx++) {
    colIdx++
    let colCor = colFromNumber(colIdx)
    sheet[colCor + 1] = { t: 's', v: bugIndexArray[idx], h: bugIndexArray[idx], w: bugIndexArray[idx] }
  }
  rowIdx = 2
  for (let userIdx in userArray) {
    const userName = userArray[userIdx].name
    sheet['A' + rowIdx] = { t: 's', v: userName, h: userName, w: userName }
    rowIdx++
  }
  rowIdx = 1
  for (let userKey in userArray) {
    rowIdx++
    colIdx = 1
    const userM = userArray[userKey]
    let personDebugs = await Model.MXRTDebug.find({ 'user': userM._id })
    let personBugJson = {}
    for (let bugIdx in bugIndexArray) {
      colIdx++
      const bugIndex = bugIndexArray[bugIdx]
      for (let bugIdx in personDebugs) {
        const bugM = personDebugs[bugIdx]
        if (bugM.bugIndex === bugIndex) {
          personBugJson[bugIndex] = bugM
          console.log(colFromNumber(colIdx) + rowIdx)
          sheet[colFromNumber(colIdx) + rowIdx] = { t: 'n', v: bugM.totalBugNum, w: '' + bugM.totalBugNum }
          break
        }
      }
    }
    // analysisJson[userM.name] = personBugJson
  }

  // console.log(analysisJson)
  SheetNames.push('bug总数')
  Sheets['bug总数'] = sheet
  XLSX.writeFile(wb, 'totalBugs.xlsx')
}

buildAnalysisXLSX()
