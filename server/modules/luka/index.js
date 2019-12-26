const Model = require('../../db/money')
const XLSX = require('xlsx')
const Moment = require('moment')
const { colFromNumber, colOffset, numberOfCol } = require('../../util')

let cardJsons = [
  {
    bank: '中国银行',
    mobile: '13218189892',
    cardNumber: '6259063295218195',
    limit: 20000,
    billDayStr: '3',
    repaymentDayStr: '18',
    expireDayStr: '2024-12-01'
  },
  {
    bank: '中国民生银行',
    mobile: '13218189892',
    cardNumber: '5127700009957392',
    limit: 20000,
    billDayStr: '0',
    repaymentDayStr: '0',
    expireDayStr: '2024-12-01'
  },
  {
    bank: '上海银行',
    mobile: '13218189892',
    cardNumber: '4026747232961808',
    limit: 20000,
    billDayStr: '8',
    repaymentDayStr: '0',
    expireDayStr: '2024-12-01'
  },
  {
    bank: '江苏银行',
    mobile: '13218189892',
    cardNumber: '6222830608202981',
    limit: 25000,
    billDayStr: '7',
    repaymentDayStr: '0',
    expireDayStr: '2027-10-01'
  },
  {
    bank: '中信银行',
    mobile: '13218189892',
    cardNumber: '6226890311904386',
    limit: 25000,
    billDayStr: '0',
    repaymentDayStr: '0',
    expireDayStr: '2022-11-01'
  },
  {
    bank: '平安银行',
    mobile: '13218189892',
    cardNumber: '6225269793922821',
    limit: 33000,
    billDayStr: '20',
    repaymentDayStr: '8',
    expireDayStr: '2023-08-01'
  },
  {
    bank: '招商银行',
    mobile: '13327976945',
    cardNumber: '6225757591262994',
    limit: 20000,
    billDayStr: '15',
    repaymentDayStr: '3',
    expireDayStr: '2020-01-01'
  },
  {
    bank: '宁波银行',
    mobile: '13218189892',
    cardNumber: '6227788254863107',
    limit: 50000,
    billDayStr: '7',
    repaymentDayStr: '22',
    expireDayStr: '2027-08-01'
  }
]

let shopJsons = [
  /// 刘龙
  {
    name: '苏州巴莎美家进出口家具',
    shortName: '巴莎美家家具',
    owner: '刘龙',
    mobile: '13218189892',
    rate: '0.003'
  },
  {
    name: '苏州久光百货店',
    shortName: '久光百货',
    owner: '刘龙',
    mobile: '13218189892',
    rate: '0.003'
  },
  {
    name: '苏州Gsuper绿地优选',
    shortName: '绿地优选',
    owner: '刘龙',
    mobile: '13218189892',
    rate: '0.003'
  },
  {
    name: '苏州西山岛旅游度假别墅派对俱乐部',
    shortName: '西山岛旅游度假',
    owner: '刘龙',
    mobile: '13218189892',
    rate: '0.003'
  },
  {
    name: '苏州去哪儿国际旅游社',
    shortName: '去哪儿旅游社',
    owner: '刘龙',
    mobile: '13218189892',
    rate: '0.003'
  },
  /// 刘元龙
  {
    name: '苏州我爱萌宠宠物亲自互动馆',
    shortName: '宠物互动馆',
    owner: '刘元龙',
    mobile: '15370348006',
    rate: '0.003'
  },
  {
    name: '苏州婉美汗蒸美容馆',
    shortName: '婉美汗蒸美容馆',
    owner: '刘元龙',
    mobile: '15370348006',
    rate: '0.003'
  },
  {
    name: '苏州潘多拉3D酒吧',
    shortName: '潘多拉酒吧',
    owner: '刘元龙',
    mobile: '15370348006',
    rate: '0.003'
  },
  {
    name: '苏州顺义烟酒店',
    shortName: '顺义烟酒店',
    owner: '刘元龙',
    mobile: '15370348006',
    rate: '0.003'
  },
  /// 赖翔
  {
    name: '苏州金游数码科技',
    shortName: '金游数码科技',
    owner: '赖翔',
    mobile: '18994307175',
    rate: '0.003'
  }
]

let shopJson = {
  name: '苏州巴莎美家进出口家具',
  shortName: '巴莎美家家具',
  owner: '刘龙',
  mobile: '13218189892',
  rate: '0.003'
}

async function doSomethings () {
  try {
    // for (let key in cardJsons) {
    //   await saveCard(cardJsons[key])
    // }

    // for (let key in shopJsons) {
    //   await saveShop(shopJsons[key])
    // }
    // await parseAndSaveRecords()

    // let liuShops = []
    // let shops = await Model.MoneyShop.find()
    // for (let key in shops) {
    //   if (shops[key].owner === '刘元龙') {
    //     liuShops.push(shops[key])
    //   }
    // }
    // let liuYuanLongRecords = []
    // let records = await Model.MoneyRecord.find()
    // for (let recKey in records) {
    //   let recordM = records[recKey]
    //   for (let shopKey in liuShops) {
    //     let shopM = liuShops[shopKey]
    //     if (shopM._id.toString() === recordM.shop.toString()) {
    //       liuYuanLongRecords.push(recordM)
    //       break
    //     }
    //   }
    // }
    // console.log('LIu : length : ', liuYuanLongRecords.length)
    // let totalPrice = 0
    // for (let key in liuYuanLongRecords) {
    //   let record = liuYuanLongRecords[key]
    //   totalPrice += record.price
    // }
    // console.log(totalPrice * 0.997)
    //
    // 计算信用卡该还多少钱
    await caculateBill()
  } catch (e) {
    console.log(' do something wrong: ', e)
  }
}

async function saveCard (cardJson) {
  try {
    let card = await new Model.MoneyCard(cardJson).save()
    console.log('save card success: ', card)
  } catch (e) {
    console.log('save card error : ', e)
  }
}

async function saveShop (shopJson) {
  try {
    let card = await new Model.MoneyShop(shopJson).save()
    console.log('save shop success: ', card)
  } catch (e) {
    console.log('save shop error : ', e)
  }
}

async function parseAndSaveRecords () {
  let xlsxPath = 'F:/Users/Martin/Documents/信用卡/信用卡记录全部.xlsx'
  let workbook = XLSX.readFile(xlsxPath)
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
  console.log(`rows : ${rows}, cols: ${cols}`)

  const colBegin = numberOfCol(cols[0])
  const colEnd = numberOfCol(cols[1])
  const rowBegin = parseInt(rows[0]) + 1
  const rowEnd = parseInt(rows[1])

  let recordArray = []
  for (let rIdx = rowBegin; rIdx <= rowEnd; rIdx++) {
    let record = {}
    for (let cIdx = colBegin; cIdx <= colEnd; cIdx++) {
      const colKey = colFromNumber(cIdx)
      const sheetKey = colKey + rIdx
      if (workbook.Sheets[workbook.SheetNames[0]][sheetKey]) {
        record[cIdx + ''] = workbook.Sheets[workbook.SheetNames[0]][sheetKey]['w']
      }
    }
    recordArray.push(record)
  }
  console.log('shop Array : ', recordArray)

  let cardMap = {}
  let shopMap = {}
  let cards = await Model.MoneyCard.find()
  let shops = await Model.MoneyShop.find()
  for (let key in cards) {
    cardMap[cards[key].bank] = cards[key]
  }
  for (let key in shops) {
    shopMap[shops[key].shortName] = shops[key]
  }

  for (let key in recordArray) {
    let recordJson = recordArray[key]
    let payDateStr = recordJson['1']
    let shopShortName = recordJson['2']
    let bankName = recordJson['3']
    let price = parseFloat(recordJson['4'])
    let cardM = null
    let shopM = null
    if (cardMap[bankName] && shopMap[shopShortName]) {
      cardM = cardMap[bankName]
      shopM = shopMap[shopShortName]
    } else {
      console.error(`error : bankName<${bankName}>, shopName<${shopShortName}> is wrong`)
      continue
    }

    try {
      let recordJson = {
        card: cardM._id,
        shop: shopM._id,
        dateStr: payDateStr,
        date: new Date(payDateStr),
        price: price
      }
      let count = await Model.MoneyRecord.count(recordJson)
      if (count === 0) {
        let recordM = new Model.MoneyRecord(recordJson)
        recordM = await recordM.save()
        console.log('save record success: ', recordM)
      } else {
        console.error('warning: this record have exist : ', recordJson)
      }
    } catch (e) {
      console.log('get count error ', e)
    }
  }
}

async function caculateBill () {
  let nowMoment = Moment(Moment().format('YYYY-MM-DD'), 'YYYY-MM-DD')
  let dayThisMonth = nowMoment.get('date')
  let cards = await Model.MoneyCard.find()
  for (let key in cards) {
    let card = cards[key]
    let billDay = parseInt(card.billDayStr)
    let repaymentDay = parseInt(card.repaymentDayStr)
    let preBillMoment = Moment(nowMoment)
    let preRepaymentMoment = Moment(nowMoment)
    let billMoment = Moment(nowMoment)
    let repaymentMoment = Moment(nowMoment)
    let nextBillMoment = Moment(nowMoment)
    if (billDay < repaymentDay) {
      if (dayThisMonth > repaymentDay) {
        billMoment.set('date', billDay).add(1, 'month')
        repaymentMoment.set('date', repaymentDay).add(1, 'month')
      } else {
        billMoment.set('date', billDay)
        repaymentMoment.set('date', repaymentDay)
      }
    } else {
      if (dayThisMonth > repaymentDay) {
        billMoment.set('date', billDay)
        repaymentMoment.set('date', repaymentDay).add(1, 'month')
      } else {
        billMoment.set('date', billDay).subtract(1, 'month')
        repaymentMoment.set('date', repaymentDay)
      }
    }
    preBillMoment = Moment(billMoment).subtract(1, 'month')
    preRepaymentMoment = Moment(repaymentMoment).subtract(1, 'month')
    nextBillMoment = Moment(billMoment).add(1, 'month')
    let records = await Model.MoneyRecord.find({ card: card._id })
    let totalMoneyShouldReplay = 0
    let meiYouHuanMoney = 0
    let jiangYaoHuanMoney = 0
    let haiMeiChuLaiMoney = 0
    for (let recordKey in records) {
      let record = records[recordKey]
      let price = record.price
      let payMoment = Moment(record.dateStr, 'YYYY-MM-DD')
      if (payMoment.isBefore(preBillMoment)) {
        meiYouHuanMoney += price
      } else if (payMoment.isBefore(billMoment) && !nowMoment.isBefore(billMoment)) {
        jiangYaoHuanMoney += price
      } else if (payMoment.isBefore(nextBillMoment)) {
        haiMeiChuLaiMoney += price
      }
      totalMoneyShouldReplay += price
    }
    console.log(`${card.bank} \n meiYouHuanMoney: ${meiYouHuanMoney} \n  jiangYaoHuanMoney: ${jiangYaoHuanMoney} \n haiMeiChuLaiMoney: ${haiMeiChuLaiMoney} \n replay ${totalMoneyShouldReplay}`)
    console.log(`preRepaymentMoment: ${preRepaymentMoment.format('YYYY-MM-DD')}, bill: ${billMoment.format('YYYY-MM-DD')}, repay: ${repaymentMoment.format('YYYY-MM-DD')}, nextbill: ${nextBillMoment.format('YYYY-MM-DD')} \n\n`)
  }
}

doSomethings()

// cardM.save(function (err, doc) {
//   if (err) {
//     console.log('save cardM error : ', err)
//   } else {
//     console.log('save cardM success : ', doc)
//   }
// })
