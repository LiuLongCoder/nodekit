const Mongoose = require('mongoose')
const Model = require('../../db/money')
const APPModel = require('../../db/app')
const ServerModel = require('../../db/moneyserver')
const XLSX = require('xlsx')
const Moment = require('moment')
const { colFromNumber, colOffset, numberOfCol } = require('../../util')

async function doSome () {
  try {
    let cardMap = {}
    let cards = await Model.MoneyCard.find({ user: '5e0c40e625121975a09516dc' })
    for (let key in cards) {
      let card = cards[key]
      cardMap[card._id.toString()] = card //.toJSON()
    }

    let groupAggregateJson = {
      $group: {
        _id: { card: '$card'},
        card: { $first: '$card' },
        count: { $sum: 1 },
        price: { $sum: '$price' },
        // returnPrice: { $sum: { $multiply: ['$price', { $subtract: [1, '$rate'] }] } }
      }
    }
    let lookupCardJson = { $lookup: { from: 'money_card_t', localField: 'card', foreignField: '_id', as: 'cardModel' } }
    let cardIdArrayFilter = []
    let matchJson = {}
    for (let key in cards) {
      cardIdArrayFilter.push(Mongoose.Types.ObjectId(cards[key]._id))
    }
    if (cardIdArrayFilter.length > 0) {
      matchJson.card = { $in: cardIdArrayFilter }
    }
    let matchAggregateJson = { $match: matchJson }
    /// 获取该用户所有信用卡刷卡的总额
    let wrapDocs = await Model.MoneyRecord.aggregate([matchAggregateJson, groupAggregateJson]).exec()
    /// 根据刷卡金额升序进行排序
    wrapDocs.sort(function (a, b) {
      return a.price > b.price ? 1 : -1
    })
    for (let key in wrapDocs) {
      let item = wrapDocs[key]
      let card = cardMap[item.card]
      if (card) {
        item.bank = card.bank
        item.cardNumber = card.cardNumber
      }
    }

    let cardAllMontyChart = { chartId: 'cardAllMontyChartId', chartTitle: '刷卡总额', chartType: 'mix' }
    let bankCategories = []
    let allPriceData = []
    let allCountData = []
    cardAllMontyChart.categories = bankCategories
    cardAllMontyChart.series = [{ name: '刷卡次数', data: allCountData, type: 'line' }, { name: '刷卡金额', data: allPriceData, type: 'line' }]
    for (let key in wrapDocs) {
      let doc = wrapDocs[key]
      allPriceData.push(doc.price + '')
      allCountData.push(doc.count + '')
      bankCategories.push(doc.bank)
    }
    // console.log(cardAllMontyChart)
    /// ========================================================================
    /// 每张银行卡根据月份进行金额统计， 过去的12个月
    let cardMontyMonthChart = { chartId: 'cardMonthMontyChartId', chartTitle: '按月刷卡总额', chartType: 'mix' }
    let monthCategories = []
    cardMontyMonthChart.categories = monthCategories
    cardMontyMonthChart.series = []

    let cardMonthMontyDataMap = {}
    for (let key in cardMap) {
      cardMonthMontyDataMap[key] = []
    }

    let tmpNumber = 1
    for (let i = 11; i >= 0; i--) {
      let firstDayMonthMoment = Moment().set('date', 1)
      firstDayMonthMoment.subtract(i, 'month')
      let year = firstDayMonthMoment.get('year')
      let month = firstDayMonthMoment.get('month')
      let f = Moment({ year :year, month :month, date :1, hour :0, minute :0, second :0 });
      let t = Moment(f).add(1, 'month').subtract(1, 'second')
      let fromDate = new Date(f.get('year'), f.get('month'), f.get('date'), f.get('hour'), f.get('minute'), f.get('second'))
      let toDate = new Date(t.get('year'), t.get('month'), t.get('date'), t.get('hour'), t.get('minute'), t.get('second'))
      let cardRecordMatchJson = { card: { $in: cardIdArrayFilter }, date: { $gte: fromDate, $lte: toDate } }
      matchAggregateJson = { $match: cardRecordMatchJson }
      let cardDocs = await Model.MoneyRecord.aggregate([matchAggregateJson, lookupCardJson, groupAggregateJson]).exec()
      if (cardDocs.length > 0) {
        monthCategories.push(firstDayMonthMoment.format('YYYY-MM'))
        for (let key in cardDocs) {
          let doc = cardDocs[key]
          let data = cardMonthMontyDataMap[doc.card]
          data && data.push(doc.price + '')
        }
        /// 给没有的补0
        for (let key in cardMonthMontyDataMap) {
          let cardMonthMontyData = cardMonthMontyDataMap[key]
          if (cardMonthMontyData.length < tmpNumber) {
            cardMonthMontyData.push('0')
          }
        }
        tmpNumber++
      }
    }
    /// 过滤全是0的
    for (let key in cardMonthMontyDataMap) {
      let cardMonthMontyData = cardMonthMontyDataMap[key]
      let hasValidPrice = false
      if (Array.isArray(cardMonthMontyData)) {
        for (let key in cardMonthMontyData) {
          let priceStr = cardMonthMontyData[key]
          if (priceStr !== '0') {
            hasValidPrice = true
            break
          }
        }
      }
      if (!hasValidPrice) {
        delete cardMonthMontyDataMap[key]
      } else {
        let card = cardMap[key]
        let itemSeries = { name: card.bank, type: 'line', data: cardMonthMontyData }
        cardMontyMonthChart.series.push(itemSeries)
        console.log(itemSeries)
      }
    }

    // =============================================================
    // 按月统计刷卡总金额
    let moneyMonthChart = { chartId: 'cardMonthMontyChartId', chartTitle: '按月统计刷卡总金额', chartType: 'mix' }
    let moneyMonthCategories = []
    let moneyMonthData = []
    let moneyMonthCountDate = []
    moneyMonthChart.categories = moneyMonthCategories
    moneyMonthChart.series = [{ name:'总金额', type: 'line', data: moneyMonthData }, { name:'总次数', type: 'column', data: moneyMonthCountDate }]

    let groupAggregateJson2 = {
      $group: {
        _id: { noUsed: '1'},
        // card: { $first: '$card' },
        count: { $sum: 1 },
        price: { $sum: '$price' },
        // returnPrice: { $sum: { $multiply: ['$price', { $subtract: [1, '$rate'] }] } }
      }
    }
    for (let i = 11; i >= 0; i--) {
      let firstDayMonthMoment = Moment().set('date', 1)
      firstDayMonthMoment.subtract(i, 'month')
      let year = firstDayMonthMoment.get('year')
      let month = firstDayMonthMoment.get('month')
      let f = Moment({ year :year, month :month, date :1, hour :0, minute :0, second :0 });
      let t = Moment(f).add(1, 'month').subtract(1, 'second')
      let fromDate = new Date(f.get('year'), f.get('month'), f.get('date'), f.get('hour'), f.get('minute'), f.get('second'))
      let toDate = new Date(t.get('year'), t.get('month'), t.get('date'), t.get('hour'), t.get('minute'), t.get('second'))
      let cardRecordMatchJson = { card: { $in: cardIdArrayFilter }, date: { $gte: fromDate, $lte: toDate } }
      matchAggregateJson = { $match: cardRecordMatchJson }
      let cardDocs = await Model.MoneyRecord.aggregate([matchAggregateJson, groupAggregateJson2]).exec()
      if (cardDocs.length > 0) {
        moneyMonthCategories.push(firstDayMonthMoment.format('YYYY-MM'))
        for (let key in cardDocs) {
          let doc = cardDocs[key]
          moneyMonthData.push(doc.price + '')
          moneyMonthCountDate.push(doc.count + '')
        }
      }
    }

    console.log(moneyMonthChart)
    // let charts = [cardAllMontyChart, cardMontyMonthChart]
    // console.log(charts)
    return
    let nowMoment = Moment(Moment().format('YYYY-MM-DD'), 'YYYY-MM-DD')
    let dayThisMonth = nowMoment.get('date')
    let cardArray = []
    let cardMoneyArray = []
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
      let durationCurrentRepayment = -1 // 该信用卡距离这次还款日的天数
      let durationNextBill = 0 // 该信用卡距离下次账单日的天数
      let durationNextRepayment = 0 // 该信用卡距离下次还款日的天数
      let cardTotalMoney = 0 // 该信用卡已经刷出的总额
      let nowSeconds = nowMoment.unix()
      let oneDaySeconds = (60 * 60 * 24)
      if (nowMoment.isSameOrBefore(billMoment)) {
        let billSeconds = billMoment.unix()
        durationNextBill = (billSeconds - nowSeconds) / oneDaySeconds + 1
        let repaymentSeconds = repaymentMoment.unix()
        durationNextRepayment = (repaymentSeconds - nowSeconds) / oneDaySeconds + 1
      } else {
        let nextBillSeconds = nextBillMoment.unix()
        durationNextBill = (nextBillSeconds - nowSeconds) / oneDaySeconds + 1
        let nextRepaymentSeconds = nextRepaymentMoment.unix()
        durationNextRepayment = (nextRepaymentSeconds - nowSeconds) / oneDaySeconds + 1
        if (nowMoment.isSameOrBefore(repaymentMoment)) {
          let repaymentSeconds = repaymentMoment.unix()
          durationCurrentRepayment = (repaymentSeconds - nowSeconds) / oneDaySeconds + 1
        }
      }
      let records = await Model.MoneyRecord.find({ card: card._id, repaymentState: 0 })
      let meiYouHuanMoney = 0
      let jiangYaoHuanMoney = 0
      let haiMeiChuLaiMoney = 0
      for (let recordKey in records) {
        let record = records[recordKey]
        let price = record.price
        let payMoment = Moment(record.dateStr, 'YYYY-MM-DD')
        if (payMoment.isSameOrBefore(preBillMoment)) {
          meiYouHuanMoney += price
        } else if (payMoment.isSameOrBefore(billMoment) && !nowMoment.isSameOrBefore(billMoment)) {
          jiangYaoHuanMoney += price
        } else if (payMoment.isSameOrBefore(nextBillMoment)) {
          haiMeiChuLaiMoney += price
        }
        cardTotalMoney = jiangYaoHuanMoney + haiMeiChuLaiMoney
      }

      cardJson.billDate = billMoment.format('YYYY-MM-DD')
      cardJson.repaymentDate = repaymentMoment.format('YYYY-MM-DD')
      cardJson.durationCurrentRepayment = durationCurrentRepayment
      cardJson.durationNextBill = durationNextBill
      cardJson.durationNextRepayment = durationNextRepayment
      cardJson.expireMoney = meiYouHuanMoney
      cardJson.willRepaymentMoney = jiangYaoHuanMoney
      cardJson.waitRepaymentMoney = haiMeiChuLaiMoney
      cardJson.billMoment = billMoment
      cardJson.nextBillMoment = nextBillMoment

      let firstMoneyJson = {}
      firstMoneyJson.bank = card.bank
      // Object.assign(firstMoneyJson, cardJson)
      let secondMoneyJson = {}
      secondMoneyJson.bank = card.bank
      // Object.assign(secondMoneyJson, cardJson)

      if (!nowMoment.isSameOrBefore(billMoment)) {
        firstMoneyJson.money = jiangYaoHuanMoney
        firstMoneyJson.moment = repaymentMoment
        secondMoneyJson.money = haiMeiChuLaiMoney
        secondMoneyJson.moment = nextRepaymentMoment
        if (firstMoneyJson.money > 0)
          cardMoneyArray.push(firstMoneyJson)
        if (secondMoneyJson.money > 0)
          cardMoneyArray.push(secondMoneyJson)
      } else {
        firstMoneyJson.money = haiMeiChuLaiMoney
        firstMoneyJson.moment = repaymentMoment
        if (firstMoneyJson.money > 0)
          cardMoneyArray.push(firstMoneyJson)
      }
    }

    cardMoneyArray.sort(function (first, second) {
      return first.moment.isAfter(second.moment) ? 1 : -1
    })

    let chartItemOne = { chartId: 'cardId', chartTitle: '信用卡相关'}
    let categories = []
    let cardMoneyDataArray = []
    let cardMoneySeries = { name: '刷卡金额', type: 'line', data: cardMoneyDataArray }

    let cardAllMoneyDataArray = []
    let cardAllMoneySeries = { name: '总金额', type: 'line', data: cardAllMoneyDataArray }


    chartItemOne.categories = categories
    chartItemOne.series = [cardMoneySeries, cardAllMoneySeries]

    let tmpMoney = 0
    for (let key in cardMoneyArray) {
      let cardChartJson = cardMoneyArray[key]
      cardChartJson.moment = cardChartJson.moment.format('M-D')
      categories.push(cardChartJson.moment + cardChartJson.bank.substring(0, 8))
      let money = cardChartJson.money
      cardMoneyDataArray.push(money)
      tmpMoney += money
      cardAllMoneyDataArray.push(tmpMoney)
    }
    console.log(chartItemOne)

    let moneyArray = []
    let preMoneyM = null
    for (let key in cardMoneyArray) {
      let cardMoney = cardMoneyArray[key]
      let moneyM = {}
      Object.assign(moneyM, cardMoney)
      moneyArray.push(moneyM)
      if (preMoneyM) {
        moneyM.money += preMoneyM['money']
      }
      preMoneyM = moneyM
    }
    console.log(moneyArray)

  } catch (e) {
    console.error('>>> error : ', e)
  }
}
doSome()
return

async function test1 () {
  let users = await Model.MoneyUser.find()
  let userDic = {}
  for (let key in users) {
    let userM = users[key]
    userDic[userM._id.toString()] = userM
  }
  let records = await Model.MoneyRecord.find().populate({ path: 'card', select: ['user', 'bank'] })
  console.log('records:', records)
  let recordArray = []
  for (let key in records) {
    let recordM = records[key]
    let userId = recordM.card.user.toString()
    let recordJson = recordM.toJSON()
    let user = userDic[userId]
    if (user) {
      recordJson.userName = user.name
    } else {
      recordJson.userName = ''
    }
    recordArray.push(recordJson)
    // console.log(recordM.userName)
  }
  console.log('recordArray: ', recordArray)
}

let appJson = { bundleId: 'com.mxr.money',
  version: '1.0.1',
  osType: 'android',
  dandelion: 'https://www.pgyer.com/luka',
  forceUpgrade: 0,
  upgradeDescription: '解决了已知bug，增加了还款记录，建议升级'
}

let app = new APPModel.AppVersion(appJson)
app.save( (err, doc) => {
  console.log('err: ', err)
  console.log('doc: ', doc)
} )

return
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
