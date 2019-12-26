const XLSX = require('xlsx')
const path = require('path')

// const excelPath = path.join(__dirname, '7月份bug确认.xlsx')
const excelPath = 'F:\\Users\\Martin\\Documents\\WeChat Files\\WeChat Files\\bigdragondev\\FileStorage\\File\\2019-09\\八月份bugs统计.xlsx'
const workbook = XLSX.readFile(excelPath)
console.log(workbook.SheetNames[0])
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
console.log(analysisJson)

/// 输出想要的列的展示
let keyArray = ['Bug编号', '解决者', '严重程度']
let filterArray = []
for (let key in array) {
  let filterJson = {}
  let oneRecord = array[key]
  for (let idx in keyArray) {
    let filterKey = keyArray[idx]
    if (oneRecord[filterKey]) {
      filterJson[filterKey] = oneRecord[filterKey]
    }
  }
  filterArray.push(filterJson)
}

console.log(filterArray)

/// 根据列的位置计算出有多少列
function numberOfCol (col) {
  const ACodeNumber = 'A'.charCodeAt(0)
  let sum = 0
  for (let idx = 0; idx < col.length; idx++) {
    // console.log(col.charCodeAt(idx))
    // console.log(col.charAt(idx))
    const num = (col.charCodeAt(idx) - ACodeNumber + 1) * Math.pow(26, col.length - idx - 1)
    sum += num
    // console.log('num', num)
  }
  return sum
}

/// 根据列坐标的序列位置计算出对应的列坐标字符串组合
function colFromNumber (number) {
  const extendAdd = 'A'.charCodeAt(0) - 1
  if (number < 0) return ''
  let col = ''
  while (number / 26 >= 1) {
    let mod = number % 26
    if (mod === 0) {
      mod = 26
    }
    col = String.fromCharCode(mod + extendAdd) + col
    number = Math.floor((number - mod) / 26)
  }
  if (number > 0) {
    col = String.fromCharCode(Math.floor(number) + extendAdd) + col
  }
  return col
}

/// 根据列坐标以及偏移量得出列坐标字符串
function colOffset (col, offset) {
  let sum = 0
  if (col === undefined || col === null || col.length === 0) {
    sum += offset
  } else {
    sum = numberOfCol(col) + offset
  }
  return colFromNumber(sum)
}

// console.log(workbook.Sheets[workbook.SheetNames[0]])

//
// let first_sheet_name = workbook.SheetNames[0]
// // var address_of_cell = 'A1';
//
// /* Get worksheet */
// var worksheet = workbook.Sheets[first_sheet_name];
//
// /* Find desired cell */
// var desired_cell = worksheet[address_of_cell];
//
// /* Get the value */
// var desired_value = (desired_cell ? desired_cell.v : undefined);
