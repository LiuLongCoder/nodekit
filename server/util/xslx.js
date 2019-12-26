
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

module.exports.numberOfCol = numberOfCol
module.exports.colFromNumber = colFromNumber
module.exports.colOffset = colOffset
