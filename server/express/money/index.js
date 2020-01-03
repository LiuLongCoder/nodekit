const Moment = require('moment')
const Model = require('../../db/money')
const MyURL = require('./url')
const ResponseModel = require('../responseModel')
const ERRCODE = require('../errCode').ERRCODE

function _MoneyExpressParams (req) {
  if (req.method === 'POST') {
    return req.body
  }
  return req.query
}

function _MoneyExpressValidateKey (params, validateKeys) {
  if (params) {
    for (let key in validateKeys) {
      if (!params[validateKeys[key]]) {
        console.log(`<MoneyExpress_validataKey err> 参数缺少 ${validateKeys[key]}`)
        return false
      }
    }
  }
  return true
}

function expressFunction (app) {
  /** 验证
   */
  app.use('/money/v1/*', (req, res, next) => {
    // console.log('>> header: ', req.headers)
    next()
  })

  /** 用户注册， 添加用户
   *  {name: [string], mobile: [string], IDCard: [string], password: [string]}
   * */
  app.post(MyURL.URL_User_Register, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      let params = _MoneyExpressParams(req)
      if (!_MoneyExpressValidateKey(params, ['name', 'mobile', 'IDCard', 'password'])) {
        responseModel.setErrCode(ERRCODE.loseParameter)
      } else {
        // 验证该手机号是否已经存在
        let user = await Model.MoneyUser.findOne({ mobile: params['mobile'] })
        if (user) {
          responseModel.setErrCode(ERRCODE.registerUserHasExist)
          res.json(responseModel.toJSON())
        } else {
          user = new Model.MoneyUser(params)
          user = await user.save()
          console.log('<info> register user: ', user)
        }
        responseModel.Body = user.toJSON()
      }
      res.json(responseModel.toJSON())
    } catch (e) {
      responseModel.setErrCode(ERRCODE.serverError)
      responseModel.Header.ErrMsg += e
      res.json(responseModel.toJSON())
      console.error('[err] >>> 注册用户失败: ', e)
    }
  })

  /** 登录
   * {mobile: [string]}
   * */
  app.all(MyURL.URL_User_Login, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      let params = _MoneyExpressParams(req)
      if (!_MoneyExpressValidateKey(params, ['mobile'])) {
        responseModel.setErrCode(ERRCODE.loseParameter)
      } else {
        let user = await Model.MoneyUser.findOne({ mobile: params['mobile'] })
        if (user) {
          console.log('<info> login user: ', user)
          responseModel.Body = user.toJSON()
        } else {
          responseModel.setErrCode(ERRCODE.loginError)
        }
      }
      res.json(responseModel.toJSON())
    } catch (e) {
      responseModel.setErrCode(ERRCODE.serverError)
      responseModel.Header.ErrMsg += e
      res.json(responseModel.toJSON())
      console.error('[err] >>> 登录用户失败: ', e)
    }
  })

  /** 获取用户信息
   * {userId: [string]}
   * */
  app.get(MyURL.URL_User_GetUserInfo, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      let params = _MoneyExpressParams(req)
      if (!_MoneyExpressValidateKey(params, ['userId'])) {
        responseModel.setErrCode(ERRCODE.loseParameter)
      } else {
        let user = await Model.MoneyUser.findOne({ _id: params['userId'] })
        if (user) {
          console.log('<info> get user: ', user)
          responseModel.Body = user.toJSON()
        } else {
          responseModel.setErrCode(ERRCODE.userNotExist)
        }
      }
      res.json(responseModel.toJSON())
    } catch (e) {
      responseModel.setErrCode(ERRCODE.serverError)
      responseModel.Header.ErrMsg += e
      res.json(responseModel.toJSON())
      console.error('[err] >>> 获取用户信息失败: ', e)
    }
  })

  /** 用户修改密码
   * {userId: [string], password: [string]}
   * */
  app.post(MyURL.URL_User_ModifyPassword, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      let params = _MoneyExpressParams(req)
      if (!_MoneyExpressValidateKey(params, ['userId', 'password'])) {
        responseModel.setErrCode(ERRCODE.loseParameter)
      } else {
        let user = await Model.MoneyUser.findOne({ _id: params['userId'] })
        if (user) {
          user.password = params['password']
          user = await user.save()
          console.log('<info> modify pwd: ', user)
          responseModel.Body = user.toJSON()
        } else {
          responseModel.setErrCode(ERRCODE.userNotExist)
        }
      }
      res.json(responseModel.toJSON())
    } catch (e) {
      responseModel.setErrCode(ERRCODE.serverError)
      responseModel.Header.ErrMsg += e
      res.json(responseModel.toJSON())
      console.error('[err] >>> 修改用户密碼: ', e)
    }
  })

  /** 添加信用卡
   * {'userId', cardNumber: [string], bank: [string], limit: [number], billDayStr: [string], repaymentDayStr: [string],  }
   * {mobile: [string]}
   * */
  app.post(MyURL.URL_User_AddCreditCard, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      let params = _MoneyExpressParams(req)
      if (!_MoneyExpressValidateKey(params, ['userId', 'cardNumber', 'bank', 'limit', 'billDayStr', 'repaymentDayStr'])) {
        responseModel.setErrCode(ERRCODE.loseParameter)
      } else {
        let card = await Model.MoneyCard.findOne({ cardNumber: params['cardNumber'] })
        if (card) {
          responseModel.setErrCode(ERRCODE.cardHasExist)
        } else {
          card = new Model.MoneyCard(params)
          card = await card.save()
          console.log('[info] add card success: ', card)
        }
      }
      res.json(responseModel.toJSON())
    } catch (e) {
      responseModel.setErrCode(ERRCODE.serverError)
      responseModel.Header.ErrMsg += e
      res.json(responseModel.toJSON())
      console.error('[err] >>> 添加信用卡失败: ', e)
    }
  })

  /** 添加信用卡刷卡记录
   * {'card', [string], shop: [string], dateStr: [string], price: [number]}
   * */
  app.post(MyURL.URL_User_AddPayRecord, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      let params = _MoneyExpressParams(req)
      if (!_MoneyExpressValidateKey(params, ['card', 'shop', 'dateStr', 'price'])) {
        responseModel.setErrCode(ERRCODE.loseParameter)
      } else {
        let record = new Model.MoneyRecord(params)
        record = await record.save()
        if (!record) {
          responseModel.setErrCode(ERRCODE.serverError)
        } else {
          console.log('[info] add pay record success: ', record)
        }
      }
      res.json(responseModel.toJSON())
    } catch (e) {
      responseModel.setErrCode(ERRCODE.serverError)
      responseModel.Header.ErrMsg += e
      res.json(responseModel.toJSON())
      console.error('[err] >>> 添加信用卡失败: ', e)
    }
  })

  /** 添加门店
   * {user: [string], name: [string], mobile: [number]}
   * */
  app.post(MyURL.URL_User_AddShop, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      let params = _MoneyExpressParams(req)
      if (!_MoneyExpressValidateKey(params, ['user', 'name', 'mobile'])) {
        responseModel.setErrCode(ERRCODE.loseParameter)
      } else {
        let shop = await Model.MoneyShop.findOne({ name: params['name'] })
        if (shop) {
          responseModel.setErrCode(ERRCODE.shopHasExist)
        } else {
          shop = new Model.MoneyShop(params)
          shop = await shop.save()
          console.log('[info] add shop success: ', shop)
        }
      }
      res.json(responseModel.toJSON())
    } catch (e) {
      responseModel.setErrCode(ERRCODE.serverError)
      responseModel.Header.ErrMsg += e
      res.json(responseModel.toJSON())
      console.error('[err] >>> 添加门店失败: ', e)
    }
  })

  /** 用户修改信息
   * {userId: [string], name: [string]，mobile: [string], IDCard: [string]}
   * */
  app.post(MyURL.URL_User_ModifyInfo, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      let params = _MoneyExpressParams(req)
      if (!_MoneyExpressValidateKey(params, ['userId', 'name', 'mobile', 'IDCard'])) {
        responseModel.setErrCode(ERRCODE.loseParameter)
      } else {
        let user = await Model.MoneyUser.findOne({ _id: params['userId'] })
        if (user) {
          user.name = params['name']
          user.mobile = params['mobile']
          user.IDCard = params['IDCard']
          user = await user.save()
          console.log('<info> modify user: ', user)
          responseModel.Body = user.toJSON()
        } else {
          responseModel.setErrCode(ERRCODE.userNotExist)
        }
      }
      res.json(responseModel.toJSON())
    } catch (e) {
      responseModel.setErrCode(ERRCODE.serverError)
      responseModel.Header.ErrMsg += e
      res.json(responseModel.toJSON())
      console.error('[err] >>> 修改用户信息失败: ', e)
    }
  })

  /** 获取信用卡列表
   * */
  app.get(MyURL.URL_User_GetCardList, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      let params = _MoneyExpressParams(req)
      if (!_MoneyExpressValidateKey(params, ['userId'])) {
        responseModel.setErrCode(ERRCODE.loseParameter)
      } else {
        let cards = await Model.MoneyCard.find({ user: params['userId'] })
        if (cards && cards.length > 0) {
          console.log('<info> get cards: ', cards.length)
          responseModel.Body = cards
        } else {
          responseModel.Body = []
        }
      }
      res.json(responseModel.toJSON())
    } catch (e) {
      responseModel.setErrCode(ERRCODE.serverError)
      responseModel.Header.ErrMsg += e
      res.json(responseModel.toJSON())
      console.error('[err] >>> 获取信用卡列表: ', e)
    }
  })

  /** 获取用户门店信息
   * {userId: [string]}
   * */
  app.get(MyURL.URL_User_GetShopList, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      let params = _MoneyExpressParams(req)
      if (!_MoneyExpressValidateKey(params, ['userId'])) {
        responseModel.setErrCode(ERRCODE.loseParameter)
      } else {
        let shops = await Model.MoneyShop.find({ user: params['userId'] })
        if (shops && shops.length > 0) {
          console.log('<info> get shops: ', shops.length)
          responseModel.Body = shops
        } else {
          responseModel.Body = []
        }
      }
      res.json(responseModel.toJSON())
    } catch (e) {
      responseModel.setErrCode(ERRCODE.serverError)
      responseModel.Header.ErrMsg += e
      res.json(responseModel.toJSON())
      console.error('[err] >>> 获取门店信息列表: ', e)
    }
  })

  /** 获取所有门店信息
   * */
  app.get(MyURL.URL_User_GetAllShopList, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      // let params = _MoneyExpressParams(req)
      let shops = await Model.MoneyShop.find().populate('user')
      if (shops && shops.length > 0) {
        console.log('<info> get shops: ', shops.length)
        responseModel.Body = shops
      } else {
        responseModel.Body = []
      }
      res.json(responseModel.toJSON())
    } catch (e) {
      responseModel.setErrCode(ERRCODE.serverError)
      responseModel.Header.ErrMsg += e
      res.json(responseModel.toJSON())
      console.error('[err] >>> 获取所有门店信息列表: ', e)
    }
  })

  /** 获取所有门店信息,并按照门店所有者返回二维数组
   * */
  app.get(MyURL.URL_User_GetAllShopListByOwner, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      // let params = _MoneyExpressParams(req)
      let allUser = await Model.MoneyUser.find()
      let resultJson = []
      for (let key in allUser) {
        let userM = allUser[key]
        let userId = userM._id
        let shops = await Model.MoneyShop.find({ user: userId })
        if (shops.length > 0) {
          let userJson = userM.toJSON()
          userJson.shopList = shops
          resultJson.push(userJson)
        }
      }
      responseModel.Body = resultJson
      res.json(responseModel.toJSON())
    } catch (e) {
      responseModel.setErrCode(ERRCODE.serverError)
      responseModel.Header.ErrMsg += e
      res.json(responseModel.toJSON())
      console.error('[err] >>> 获取所有门店信息列表: ', e)
    }
  })

  /** 获取信用卡信息
   * {userId: [string]}
   * {cardIds: [string]}  cardIds ,隔开
   * */
  app.get(MyURL.URL_User_GetCardInfo, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      let params = _MoneyExpressParams(req)
      if (!_MoneyExpressValidateKey(params, ['userId'])) {
        responseModel.setErrCode(ERRCODE.loseParameter)
      } else {
        let cardIds = params['cardIds']
        let query = Model.MoneyCard.find({ user: params['userId'] })
        if (cardIds) {
          let cardArray = cardIds.split(',')
          if (cardArray.length > 0) {
            query.find({ _id: { $in: cardArray } })
          }
        }
        let cards = await query.exec()
        let cardArray = []
        let nowMoment = Moment(Moment().format('YYYY-MM-DD'), 'YYYY-MM-DD')
        let dayThisMonth = nowMoment.get('date')
        let totalMoney = 0
        let totalRepaymentMoney = 0
        let totalWaitRepaymentMoney = 0
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
          let cardTotalMoney = 0
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
            cardTotalMoney = jiangYaoHuanMoney + haiMeiChuLaiMoney
          }
          totalRepaymentMoney += jiangYaoHuanMoney
          totalWaitRepaymentMoney += haiMeiChuLaiMoney
          totalMoney = totalMoney + cardTotalMoney

          cardJson.billDate = billMoment.format('YYYY-MM-DD')
          cardJson.repaymentDate = repaymentMoment.format('YYYY-MM-DD')
          cardJson.durationNextBill = durationNextBill
          cardJson.durationNextRepayment = durationNextRepayment
          cardJson.expireMoney = meiYouHuanMoney
          cardJson.willRepaymentMoney = jiangYaoHuanMoney
          cardJson.waitRepaymentMoney = haiMeiChuLaiMoney
        }
        let resultJson = {}
        resultJson.list = cardArray
        resultJson.totalMoney = totalMoney
        resultJson.totalRepaymentMoney = totalRepaymentMoney
        resultJson.totalWaitRepaymentMoney = totalWaitRepaymentMoney
        responseModel.Body = resultJson
      }
      res.json(responseModel.toJSON())
    } catch (e) {
      responseModel.setErrCode(ERRCODE.serverError)
      responseModel.Header.ErrMsg += e
      res.json(responseModel.toJSON())
      console.error('[err] >>> 获取信用卡费用信息列表: ', e)
    }
  })
}

module.exports = expressFunction
