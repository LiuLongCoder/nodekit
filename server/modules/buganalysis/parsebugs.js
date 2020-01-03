const XLSX = require('xlsx')
const { colFromNumber, colOffset, numberOfCol } = require('../../util')
const Model = require('../../db/mxr')

let GlobalBugIndex = '201912'
const GlobalExcelPath = 'F:\\Users\\Martin\\Documents\\MXR\\龙虎榜\\2019.12\\2019.12bugs.xlsx' // 从禅道拉下来的bug的excel表格

const codeLineJson = {
  '王纪凯': 1638,
  '王东升': 526,
  '孙凯': 22304,
  '武元元': 4949,
  '陈冬': 107739,
  '宋维超': 10900,
  '倪泽民': 6696,
  '宋晓勇': 0,
  '杨泽龙': 4993,
  '王峥': 0,
  '曹言桩': 3243,
  '曹广东': 4749,
  '刘龙': 0,
  '项大山': 13061,
  '孔峰': 12431,
  '高伟龙': 12324,
  '宋雨': 0,
  '戢灿': 0,
  '窦小龙': 0,
  '朱亮宇': 0,
  '刘元龙': 9400,
  '张青林': 1035,
  '何黎明': 9906,
  '赵紫东': 1339
}

async function getAnalysisFromExcel () {
  console.log('>>> 开始解析从禅道拉下来的bug列表保存到数据库中')
  if (!GlobalBugIndex || !GlobalExcelPath || (typeof GlobalBugIndex === 'string' && GlobalBugIndex.length === 0) || (typeof GlobalExcelPath === 'string' && GlobalExcelPath.length === 0)) {
    console.log('param is invalid : bugIndex : ' + GlobalBugIndex + ' , excelPath : ' + GlobalExcelPath)
    return
  }
  const doc = await Model.MXRTDebug.findOne({ bugIndex: GlobalBugIndex })
  if (doc) {
    console.log(GlobalBugIndex + ' bugIndex has exist ')
    return
  }
  const workbook = XLSX.readFile(GlobalExcelPath)
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

  for (let cIdx = colBegin; cIdx <= colEnd; cIdx++) {
    const colKey = colFromNumber(cIdx)
    const sheetKey = colKey + '1'
    if (workbook.Sheets[workbook.SheetNames[0]][sheetKey]) {
      // console.log(workbook.Sheets[workbook.SheetNames[0]][sheetKey]['v'])
      categoryJson[colKey] = workbook.Sheets[workbook.SheetNames[0]][sheetKey]['v']
    }
  }

  /// 每一行记录增加到数组中
  let array = []
  for (let rIdx = rowBegin + 1; rIdx <= rowEnd; rIdx++) {
    let oneRecord = {}
    for (let cIdx = colBegin; cIdx <= colEnd; cIdx++) {
      const colKey = colFromNumber(cIdx)
      const sheetKey = colKey + rIdx
      if (workbook.Sheets[workbook.SheetNames[0]][sheetKey]) {
        oneRecord[categoryJson[colKey]] = workbook.Sheets[workbook.SheetNames[0]][sheetKey]['v']
      }
    }
    array.push(oneRecord)
  }

  // console.log(array)

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
  // console.log(analysisJson)
  // return 0
  for (let key in analysisJson) {
    let user = await Model.MXRTUser.findOne({ 'name': key })
    if (!user) {
      user = Model.MXRTUser()
      user.name = key
      user = await user.save()
    }
    if (user) {
      const bugModel = Model.MXRTDebug()
      bugModel.user = user._id
      bugModel.bugIndex = GlobalBugIndex
      const oneJson = analysisJson[key]
      for (let bugLevel in oneJson) {
        if (!bugLevel.match(/^[0-9]*$/)) {
          continue
        }
        bugModel['level' + bugLevel] = oneJson[bugLevel]
      }
      bugModel.save()
    }
  }
  return 1
}

async function saveAnalysisCodeLine () {
  for (let key in codeLineJson) {
    let user = await Model.MXRTUser.findOne({ name: key })
    if (!user) {
      user = Model.MXRTUser()
      user.name = key
      user = await user.save()
    }
    if (user) {
      let bug = await Model.MXRTDebug.findOne({ bugIndex: GlobalBugIndex, user: user._id }).populate({ path: 'user' })
      console.log(bug)
      if (!bug) {
        bug = new Model.MXRTDebug()
        bug.user = user._id
        bug.bugIndex = GlobalBugIndex
        bug = await bug.save()
      }
      if (bug) {
        bug.codeLine = codeLineJson[key]
        bug = await bug.save()
      }
    } else {
      console.log('>>>>> error : ', key)
    }
  }
  return 1
}

async function buildMonthsXLSX () {
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
  XLSX.writeFile(wb, 'buildMonthsBugs.xlsx')
  return 1
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
async function buildTotalBugsXLSX () {
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
    return compareStr(userA.department && userA.department.name, userB.department && userB.department.name)
  })
  const colTotal = colFromNumber(bugIndexArray.length + 1)
  const rowTotal = userArray.length + 1
  let sheet = { '!ref': 'A1:' + colTotal + rowTotal }

  let colIdx = 1
  let rowIdx = 1
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
  }

  SheetNames.push('bug总数')
  Sheets['bug总数'] = sheet
  XLSX.writeFile(wb, 'totalBugs.xlsx')
  return 1
}

async function buildBugs () {
  let ret = await getAnalysisFromExcel()
  if (!ret) return
  ret = await saveAnalysisCodeLine()
  if (!ret) return
  ret = await buildMonthsXLSX()
  if (!ret) return
  ret = await buildTotalBugsXLSX()
}

buildBugs()
