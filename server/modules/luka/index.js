const Mongoose = require('mongoose')
const Model = require('../../db/money')
const ServerModel = require('../../db/moneyserver')
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
    limit: 35000,
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
    //
    // 到账了
    // let records = await Model.MoneyRecord.find({ state: 0 })
    // for (let key in records) {
    //   let record = records[key]
    //   record.state = 1
    //   record = await record.save()
    //   console.log(record)
    // }

    // 计算信用卡该还多少钱
    // await caculateBill()

    // await savePayWayTable()
    // let card = await Model.MoneyCard.findOne().populate('user')
    // console.log('card : ', card)

    testFunction ()
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
    /// 过滤已经保存的数据
    if (recordJson['5'] && recordJson['5'] === '1') {
      continue
    }
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
      console.error(`error : bankName<${bankName}>, shopName<${shopShortName}, price<${price}> is wrong`)
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
  let totalMoney = 0
  let nowMoment = Moment(Moment().format('YYYY-MM-DD'), 'YYYY-MM-DD')
  let dayThisMonth = nowMoment.get('date')
  let query = Model.MoneyCard.find()
  query.find({ user: '5e0c40e625121975a09516dc' })
  let cards = await query.exec()
  // let cards = await Model.MoneyCard.find({ 'user': '5e0c40e625121975a09516dc', _id: { $in: ['5e00c8c72f8fe9353cd60850'] } })
  let cardArray = []
  for (let key in cards) {
    let card = cards[key]
    let cardJson = card.toJSON()
    cardArray.push(cardJson)
    let billDay = parseInt(card.billDayStr)
    let repaymentDay = parseInt(card.repaymentDayStr)
    let preBillMoment = Moment(nowMoment)
    let preRepaymentMoment = Moment(nowMoment)
    let billMoment = Moment(nowMoment)
    let repaymentMoment = Moment(nowMoment)
    let nextBillMoment = Moment(nowMoment)
    let nextRepaymentMoment = Moment(nowMoment)
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
    nextRepaymentMoment = Moment(repaymentMoment).add(1, 'month')
    /// 计算合理日期
    let durationNextBill = 0
    let durationNextRepayment = 0
    let nowSeconds = nowMoment.unix()
    if (nowMoment.isBefore(billMoment)) {
      let billSeconds = billMoment.unix()
      durationNextBill = (billSeconds - nowSeconds) / (60 * 60 * 24)
      let repaymentSeconds = repaymentMoment.unix()
      durationNextRepayment = (repaymentSeconds - nowSeconds) / (60 * 60 * 24)
    } else {
      let nextBillSeconds = nextBillMoment.unix()
      durationNextBill = (nextBillSeconds - nowSeconds) / (60 * 60 * 24)
      let nextRepaymentSeconds = nextRepaymentMoment.unix()
      durationNextRepayment = (nextRepaymentSeconds - nowSeconds) / (60 * 60 * 24)
    }

    let records = await Model.MoneyRecord.find({ card: card._id, repaymentState: 0 })
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
    totalMoney = totalMoney + jiangYaoHuanMoney + haiMeiChuLaiMoney

    cardJson.expireMoney = meiYouHuanMoney
    cardJson.willRepaymentMoney = jiangYaoHuanMoney
    cardJson.waitRepaymentMoney = haiMeiChuLaiMoney

    console.log('>>>> 下次账单日时间:', durationNextBill)
    console.log('>>>> 下次还款日日时间:', durationNextRepayment)
    console.log(`${card.bank} \n meiYouHuanMoney: ${meiYouHuanMoney} \n  jiangYaoHuanMoney: ${jiangYaoHuanMoney} \n haiMeiChuLaiMoney: ${haiMeiChuLaiMoney} \n replay ${totalMoneyShouldReplay}`)
    console.log(`preRepaymentMoment: ${preRepaymentMoment.format('YYYY-MM-DD')}, bill: ${billMoment.format('YYYY-MM-DD')}, repay: ${repaymentMoment.format('YYYY-MM-DD')}, nextbill: ${nextBillMoment.format('YYYY-MM-DD')} \n\n`)
  }
  let resultJson = {}
  resultJson.totalMoney = totalMoney
  resultJson.list = cardArray
  console.log('>>> cards: ', resultJson)
  console.log('>>> all money :', totalMoney)
}

async function savePayWayTable () {
  let payWayArray = [{ name: '银联', type: 1 },
    { name: '微信', type: 2 }, { name: '支付宝', type: 3 }, { name: '云闪付', type: 4 }]
  for (let key in payWayArray) {
    let payWay = payWayArray[key]
    let payWayM = new Model.MoneyPayWay(payWay)
    payWayM = await payWayM.save()
    console.log(payWayM)
  }
}

doSomethings()

async function testFunction () {
  // let matchJson = { $match: { date: { $gte: '', $lte: '' }, shop: { $in: [] } } } // 自己的哪些店时间段的所有记录 店铺发钱用的
  // let matchJson = { $match: { date: { $gte: '', $lte: '' }, card: { $in: [] } } } // 自己的哪些卡在什么时间段的所有记录 自己收钱用的
  // let matchJson = { $match: { card: { $in: [Mongoose.Types.ObjectId('5e00c8c72f8fe9353cd60854'), Mongoose.Types.ObjectId('5e00c8c72f8fe9353cd60851')] } } }
  // let groupJson = { $group: { _id: { card: '$card', shop: '$shop' }, card: { $first: '$card' }, shop: { $first: '$shop' }, count: { $sum: 1 }, price: { $sum: '$price' }, totalPrice: { $sum: { $multiply: ['$price', { $subtract: [1, '$rate'] }] } } } }
  // let docs = await Model.MoneyRecord.aggregate([matchJson, groupJson]).exec()
  // for (let key in docs) {
  //   console.log(docs[key])
  // }

  // let groupJson = { $group: { _id: { card: '$card', shop: '$shop' }, card: { $first: '$card' }, shopOwner: { $first: '$shopModel.user' }, cardOwner: { $first: '$cardModel.user' }, shop: { $first: '$shop' }, count: { $sum: 1 }, price: { $sum: '$price' }, totalPrice: { $sum: { $multiply: ['$price', { $subtract: [1, '$rate'] }] } } } }
  // let lookupJson = { $lookup: { from: 'money_shop_t', localField: 'shop', foreignField: '_id', as: 'shopModel' } }
  // let lookup2Json = { $lookup: { from: 'money_card_t', localField: 'card', foreignField: '_id', as: 'cardModel' } }
  // let docs = await Model.MoneyRecord.aggregate([lookupJson, lookup2Json, groupJson]).exec()
  // for (let key in docs) {
  //   console.log(docs[key])
  // }

  // let localUsers = await Model.MoneyUser.find()
  // for (let key in localUsers) {
  //   let lcoalUser = localUsers[key]
  //   let serverUser = ServerModel.MoneyUser(lcoalUser.toJSON())
  //   serverUser = await serverUser.save()
  //   console.log('>>>> ', serverUser)
  // }

  // let localShops = await Model.MoneyShop.find()
  // for (let key in localShops) {
  //   let lcoalShop = localShops[key]
  //   let serverShop = ServerModel.MoneyShop(lcoalShop.toJSON())
  //   serverShop = await serverShop.save()
  //   console.log('>>>> ', serverShop)
  // }

  let localModels = await ServerModel.MoneyCard.find()
  for (let key in localModels) {
    let lcoalModel = localModels[key]
    let serverModel = Model.MoneyCard(lcoalModel.toJSON())
    serverModel = await serverModel.save()
    console.log('>>>> ', serverModel)
  }
}

// cardM.save(function (err, doc) {
//   if (err) {
//     console.log('save cardM error : ', err)
//   } else {
//     console.log('save cardM success : ', doc)
//   }
// })
