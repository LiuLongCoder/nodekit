const Mongoose = require('mongoose')
const Moment = require('moment')
const Model = require('../../db/money')
const MyURL = require('./url')
const ResponseModel = require('../responseModel')
const ERRCODE = require('../errCode').ERRCODE
const FS = require('fs')
const Path = require('path')
const express = require('express')
const Crypto = require('crypto')

// 上传文件
const UploadFileLib = require('multer')
const upload = UploadFileLib({ dest: './server/web/moneyImages/' })

function _MoneyExpressParams (req) {
  if (req.method === 'POST') {
    return req.body
  }
  return req.query
}

function _MoneyExpressHeader (req) {
  try {
    let header = req.headers['app-header']
    if (!header) {
      /// 适配以前的版本
      header = req.headers['money-header']
    }
    return JSON.parse(header)
  } catch (e) {
    console.error('[error] parse header err: ', e)
  }
  return {}
}

function _MoneyExpressUserIdFromHeader (req) {
  let header = _MoneyExpressHeader(req)
  return header['userId']
}

function _MoneyExpressValidateKey (params, validateKeys) {
  if (params) {
    for (let key in validateKeys) {
      if (!params[validateKeys[key]]) {
        console.log(`[MoneyExpress_validateKey err] 参数缺少 ${validateKeys[key]}`)
        return false
      }
    }
  }
  return true
}

function expressFunction (app) {
  app.use(express.static(Path.resolve(process.cwd(), 'server/web/')))
  /** 验证
   */
  app.use('/money/v1/*', (req, res, next) => {
    let header = _MoneyExpressHeader(req)
    let isValid = false
    if (header) {
      let jsonString = header['jsonString']
      let signature = header['signature']
      if (jsonString && signature) {
        let sig = Crypto.createHash('md5').update('luka' + jsonString + 'luka').digest('hex')
        if (sig === signature) {
          isValid = true
          next()
        }
      }
    }
    if (!isValid) {
      let responseModel = new ResponseModel()
      responseModel.setErrCode(ERRCODE.serverForbidden)
      res.status(403).json(responseModel.toJSON())
    }
  })

  /* 上传图片
 * */
  app.post(MyURL.URL_File_Upload, upload.single('file'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    let responseModel = new ResponseModel()
    try {
      let params = _MoneyExpressParams(req)
      console.log(params)
      if (req && req.file) {
        let fileM = req.file
        let filePath = Path.resolve(process.cwd(), fileM.path)
        let extName = Path.extname(fileM.originalname)
        let renamePath = filePath + extName
        FS.renameSync(filePath, renamePath)
        fileM.imgUrl = 'http://liulong.site/moneyImages/' + fileM.filename + extName
        console.log(fileM)
        let resultJson = fileM
        responseModel.Body = resultJson
      } else {
        responseModel.setErrCode(ERRCODE.uploadFileError)
      }
      res.json(responseModel.toJSON())
    } catch (e) {
      responseModel.setErrCode(ERRCODE.serverError)
      responseModel.Header.ErrMsg += e
      res.json(responseModel.toJSON())
      console.error('[err] >>> 上传文件失败: ', e)
    }
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
   * {mobile: [string], password: [string]}
   * */
  app.all(MyURL.URL_User_Login, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      let params = _MoneyExpressParams(req)
      if (!_MoneyExpressValidateKey(params, ['mobile', 'password'])) {
        responseModel.setErrCode(ERRCODE.loseParameter)
      } else {
        let user = await Model.MoneyUser.findOne({ mobile: params['mobile'] })
        if (user) {
          console.log('<info> login user: ', user)
          if (user.password === params['password']) {
            responseModel.Body = user.toJSON()
          } else {
            responseModel.setErrCode(ERRCODE.loginPasswordError)
          }
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
   * {user, cardNumber: [string], bank: [string], limit: [number], billDayStr: [string], repaymentDayStr: [string]} user即userId
   * {mobile: [string]}
   * */
  app.post(MyURL.URL_User_AddCreditCard, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      let params = _MoneyExpressParams(req)
      if (!_MoneyExpressValidateKey(params, ['user', 'cardNumber', 'bank', 'limit', 'billDayStr', 'repaymentDayStr'])) {
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
   * {card, [string], shop: [string], dateStr: [string], price: [number], payWay: [number]}
   * {payWay: [string]}
   * payType   1:银联   2:微信   3:支付宝  4:云闪付
   * */
  app.post(MyURL.URL_User_AddPayRecord, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      let params = _MoneyExpressParams(req)
      if (!_MoneyExpressValidateKey(params, ['card', 'shop', 'dateStr', 'price', 'payType'])) {
        responseModel.setErrCode(ERRCODE.loseParameter)
      } else {
        let record = new Model.MoneyRecord(params)
        let payType = params['payType']
        let price = params['price']
        let rate = 0
        /// payType 1表示银联4表示云支付，大于1000的时候手续费是千分之5.3其他都是千分之3
        if ((payType === 1 || payType === 4) && price > 1000) {
          rate = 0.0053
        } else {
          rate = 0.003
        }
        record.rate = rate
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
      console.error('[err] >>> 添加信用卡记录失败: ', e)
    }
  })

  /** 获取信用卡刷卡记录
   * {userId, [string]}
   * {cardIds: [string], shopIds: [string], 'page': [number], 'pageSize': [number], 'fromDate': [string], toDate: [string]}   shopIds、cardIds 以','隔开
   * */
  app.get(MyURL.URL_User_GetPayRecordList, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      let params = _MoneyExpressParams(req)
      console.log('<info> get param: ', params)
      let page = 1
      let pageSize = 50
      if (params.hasOwnProperty('page') && params.hasOwnProperty('pageSize')) {
        page = Math.max(parseInt(params['page']), 1)
        pageSize = parseInt(params['pageSize'])
      }
      if (!_MoneyExpressValidateKey(params, ['userId'])) {
        responseModel.setErrCode(ERRCODE.loseParameter)
      } else {
        let shopIds = []
        let cardIds = []
        let fromDate = undefined, toDate = undefined
        if (params['cardIds']) {
          cardIds = params['cardIds'].split(',')
        }
        if (params['shopIds']) {
          shopIds = params['shopIds'].split(',')
        }
        if (params['fromDate'] && params['toDate']) {
          let f = Moment(params['fromDate'], 'YYYY-MM-DD HH:mm:ss')
          let t = Moment(params['toDate'], 'YYYY-MM-DD HH:mm:ss')
          fromDate = new Date(f.get('year'), f.get('month'), f.get('date'), f.get('hour'), f.get('minute'), f.get('second'))
          toDate = new Date(t.get('year'), t.get('month'), t.get('date'), t.get('hour'), t.get('minute'), t.get('second'))
        }
        let needQuery = false
        let recordQuery = Model.MoneyRecord.find().sort('-date').populate(['card', 'shop'])
        if (cardIds.length > 0) {
          recordQuery.find({ card: { $in: cardIds } })
          needQuery = true
        }
        if (shopIds.length === 0 && cardIds.length === 0) {
          let cards = await Model.MoneyCard.find({ user: params['userId'] })
          for (let key in cards) { cardIds.push(cards[key]._id) }
        }
        if (shopIds.length > 0) {
          recordQuery.find({ shop: { $in: shopIds } })
          needQuery = true
        }
        if (cardIds.length > 0) {
          recordQuery.find({ card: { $in: cardIds } })
          needQuery = true
        }
        if (fromDate && toDate) {
          recordQuery.find({ date: { $gte: fromDate, $lte: toDate } })
        }
        recordQuery.limit(pageSize)
        recordQuery.skip(Math.max(0, pageSize * (page - 1)))
        if (needQuery) {
          let records = await recordQuery.exec()
          console.log('<info> get records :', records.length)
          responseModel.Body = records
        } else {
          responseModel.Body = []
        }
      }
      res.json(responseModel.toJSON())
    } catch (e) {
      responseModel.setErrCode(ERRCODE.serverError)
      responseModel.Header.ErrMsg += e
      res.json(responseModel.toJSON())
      console.error('[err] >>> 获取刷卡记录失败: ', e)
    }
  })

  /** 添加门店
   * {user: [string], name: [string], mobile: [number]}
   * {shopId:[string], shopQRCodeImageSrc} // shopId存在则表示更新，否则增加
   * */
  app.post(MyURL.URL_User_AddShop, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      let params = _MoneyExpressParams(req)
      if (!_MoneyExpressValidateKey(params, ['user', 'name', 'mobile'])) {
        responseModel.setErrCode(ERRCODE.loseParameter)
      } else {
        let shopId = params['shopId']
        if (shopId !== null && shopId !== undefined) {
          let shop = await Model.MoneyShop.findOne({ _id: shopId })
          if (shop) {
            shop.shopQRCodeImageSrc = params['shopQRCodeImageSrc']
            shop.name = params['name']
            shop.mobile = params['mobile']
            shop = await shop.save()
            console.log('update shop: ', shop)
            responseModel.Body = shop.toJSON()
          } else {
            responseModel.setErrCode(ERRCODE.shopHasExist)
          }
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
   * {shopId: [string]}
   * */
  app.get(MyURL.URL_User_GetShop, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      let params = _MoneyExpressParams(req)
      if (!_MoneyExpressValidateKey(params, ['shopId'])) {
        responseModel.setErrCode(ERRCODE.loseParameter)
      } else {
        let shop = await Model.MoneyShop.findOne({ _id: params['shopId'] })
        if (shop) {
          responseModel.Body = shop
        } else {
          responseModel.setErrCode(ERRCODE.shopNotExist)
        }
      }
      res.json(responseModel.toJSON())
    } catch (e) {
      responseModel.setErrCode(ERRCODE.serverError)
      responseModel.Header.ErrMsg += e
      res.json(responseModel.toJSON())
      console.error('[err] >>> 获取门店信息失败: ', e)
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
        let totalMoney = 0 // 所有信用卡已经刷出的总额
        let totalRepaymentMoney = 0 // 所有信用卡现在已经出的账单总额
        let totalWaitRepaymentMoney = 0 // 所有信用卡还没出账单的总额
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
          totalRepaymentMoney += jiangYaoHuanMoney
          totalWaitRepaymentMoney += haiMeiChuLaiMoney
          totalMoney = totalMoney + cardTotalMoney

          cardJson.billDate = billMoment.format('YYYY-MM-DD')
          cardJson.repaymentDate = repaymentMoment.format('YYYY-MM-DD')
          cardJson.durationCurrentRepayment = durationCurrentRepayment
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

  /* 信用卡还款
  * {userId:[string], cardId: [string]}
  * */
  app.post(MyURL.URL_User_RepaymentCard, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      let userId = _MoneyExpressUserIdFromHeader(req)
      let params = _MoneyExpressParams(req)
      if (!_MoneyExpressValidateKey(params, ['userId', 'cardId'])) {
        responseModel.setErrCode(ERRCODE.loseParameter)
      } else {
        let cardId = params['cardId']
        let card = await Model.MoneyCard.findOne({ _id: cardId, user: userId })
        if (card) {
          let nowMoment = Moment(Moment().format('YYYY-MM-DD'), 'YYYY-MM-DD')
          let dayThisMonth = nowMoment.get('date')
          let billDay = parseInt(card.billDayStr)
          let repaymentDay = parseInt(card.repaymentDayStr)
          let billMoment = Moment(nowMoment)
          if (billDay < repaymentDay) {
            if (dayThisMonth > repaymentDay) {
              billMoment.set('date', billDay).add(1, 'month')
            } else {
              billMoment.set('date', billDay)
            }
          } else {
            if (dayThisMonth > repaymentDay) {
              billMoment.set('date', billDay)
            } else {
              billMoment.set('date', billDay).subtract(1, 'month')
            }
          }
          if (nowMoment.isAfter(billMoment)) {
            let t = Moment(billMoment).add(1, 'day')
            let toDate = new Date(t.get('year'), t.get('month'), t.get('date'), 0, 0, 0)
            console.log(' toDate: ' + toDate)
            let result = await Model.MoneyRecord.find({ card: cardId, date: { $lt: toDate }, repaymentState: 0 }).updateMany({ repaymentState: 1 }).exec()
            console.log(result)
          } else {
            responseModel.setErrCode(ERRCODE.serverError)
          }
        } else {
          responseModel.setErrCode(ERRCODE.cardNotExist)
        }
      }
      res.json(responseModel.toJSON())
    } catch (e) {
      responseModel.setErrCode(ERRCODE.serverError)
      responseModel.Header.ErrMsg += e
      res.json(responseModel.toJSON())
      console.error('[err] >>> 获取所有门店信息列表: ', e)
    }
  })

  /** 获取支付途径数组
   * */
  app.get(MyURL.URL_Pay_GetPayWayList, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      let payWays = await Model.MoneyPayWay.find()
      console.log('<info> get payWays: ', payWays.length)
      responseModel.Body = payWays
      res.json(responseModel.toJSON())
    } catch (e) {
      responseModel.setErrCode(ERRCODE.serverError)
      responseModel.Header.ErrMsg += e
      res.json(responseModel.toJSON())
      console.error('[err] >>> 获取支付途径信息失败: ', e)
    }
  })

  /** 获取收入情况
   * {type: [string]} // 枚举有 user shop
   * {fromDate: [string], toDate: [string]}
   * */
  app.get(MyURL.URL_Pay_GetIncome, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      let userId = _MoneyExpressUserIdFromHeader(req)
      if (!userId || userId === '0') {
        res.json(responseModel.toJSON())
        return
      }
      console.log('userId : ', userId)
      let params = _MoneyExpressParams(req)
      if (!_MoneyExpressValidateKey(params, ['type'])) {
        responseModel.setErrCode(ERRCODE.loseParameter)
      } else {
        let type = params['type']
        let fromDate = undefined, toDate = undefined
        if (params['fromDate'] && params['toDate']) {
          let f = Moment(params['fromDate'], 'YYYY-MM-DD HH:mm:ss')
          let t = Moment(params['toDate'], 'YYYY-MM-DD HH:mm:ss')
          fromDate = new Date(f.get('year'), f.get('month'), f.get('date'), f.get('hour'), f.get('minute'), f.get('second'))
          toDate = new Date(t.get('year'), t.get('month'), t.get('date'), t.get('hour'), t.get('minute'), t.get('second'))
        }

        let matchJson = {}
        if (fromDate && toDate) {
          matchJson.date = { $gte: fromDate, $lte: toDate }
        }
        let groupAggregateJson = {
          $group: {
            _id: { card: '$card', shop: '$shop' },
            card: { $first: '$card' },
            shop: { $first: '$shop' },
            shopOwnerArray: { $first: '$shopModel.user' },
            cardOwnerArray: { $first: '$cardModel.user' },
            count: { $sum: 1 },
            price: { $sum: '$price' },
            returnPrice: { $sum: { $multiply: ['$price', { $subtract: [1, '$rate'] }] } }
          }
        }

        let userMap = {}
        let userModelMap = {}
        let shopMap = {}
        let cardMap = {}
        let cardIdArrayFilter = []
        let shopIdArrayFilter = []
        let currentUserCardList = []
        let currentUserShopList = []
        let users = await Model.MoneyUser.find()
        for (let key in users) {
          let user = users[key]
          let userJson = user.toJSON()
          userJson.shopList = []
          userJson.cardList = []
          userJson.spendJson = {}
          userMap[user._id.toString()] = userJson
          userModelMap[user._id.toString()] = user
        }
        let shops = await Model.MoneyShop.find()
        for (let key in shops) {
          let shop = shops[key]
          let shopJson = shop.toJSON()
          let userJson = userMap[shopJson.user]
          if (userJson && userJson.shopList) {
            // userJson.shopList.push(shopJson)
            if (userJson._id.toString() === userId) {
              currentUserShopList.push(shopJson)
            }
          }
          shopMap[shop._id.toString()] = shopJson
        }
        let cards = await Model.MoneyCard.find()
        for (let key in cards) {
          let card = cards[key]
          let cardJson = card.toJSON()
          let userJson = userMap[cardJson.user]
          if (userJson && userJson.cardList) {
            // userJson.cardList.push(cardJson)
            if (userJson._id.toString() === userId) {
              currentUserCardList.push(cardJson)
            }
          }
          cardMap[card._id.toString()] = cardJson
        }

        if (type === 'user') {
          for (let key in currentUserCardList) {
            cardIdArrayFilter.push(Mongoose.Types.ObjectId(currentUserCardList[key]._id))
          }
        } else if (type === 'shop') {
          for (let key in currentUserShopList) {
            shopIdArrayFilter.push(Mongoose.Types.ObjectId(currentUserShopList[key]._id))
          }
        }

        if (cardIdArrayFilter.length > 0) {
          matchJson.card = { $in: cardIdArrayFilter }
        }
        if (shopIdArrayFilter.length > 0) {
          matchJson.shop = { $in: shopIdArrayFilter }
        }
        let matchAggregateJson = { $match: matchJson }
        let lookupShopJson = { $lookup: { from: 'money_shop_t', localField: 'shop', foreignField: '_id', as: 'shopModel' } }
        let lookupCardJson = { $lookup: { from: 'money_card_t', localField: 'card', foreignField: '_id', as: 'cardModel' } }
        // let matchJson = { $match: { card: { $in: [Mongoose.Types.ObjectId('5e00c8c72f8fe9353cd60854'), Mongoose.Types.ObjectId('5e00c8c72f8fe9353cd60851')] } } }
        let wrapDocs = await Model.MoneyRecord.aggregate([matchAggregateJson, lookupShopJson, lookupCardJson, groupAggregateJson]).exec()

        for (let key in wrapDocs) {
          let doc = wrapDocs[key]
          if (doc.shopOwnerArray && Array.isArray(doc.shopOwnerArray) && doc.shopOwnerArray.length > 0 && Array.isArray(doc.cardOwnerArray) && doc.cardOwnerArray && doc.cardOwnerArray.length > 0) {
            let shopOwner = doc.shopOwnerArray[0].toString()
            let cardOwner = doc.cardOwnerArray[0].toString()
            doc.shopOwner = shopOwner
            doc.cardOwer = cardOwner
            let shopUserJson = userMap[shopOwner]
            let cardUserJson = userMap[cardOwner]
            if (shopUserJson && cardUserJson) {
              let spendJson = shopUserJson.spendJson
              let userSpendJson = spendJson[cardOwner]
              if (!userSpendJson) {
                userSpendJson = {}
                userSpendJson.list = []
                userSpendJson.count = 0
                userSpendJson.price = 0
                userSpendJson.returnPrice = 0
                userSpendJson.user = userModelMap[cardOwner]
                spendJson[cardOwner] = userSpendJson
              }
              // userSpendJson.list.push(doc)
              userSpendJson.price += doc.price
              userSpendJson.returnPrice += doc.returnPrice
              userSpendJson.count += doc.count
            }
          }
        }
        // 对returnPrice向下取两位小数
        for (let key in userMap) {
          let shopUserJson = userMap[key]
          if (shopUserJson) {
            let spendJson = shopUserJson.spendJson
            for (let sKey in spendJson) {
              let userSpendJson = spendJson[sKey]
              if (userSpendJson) {
                userSpendJson.returnPrice = Math.floor(userSpendJson.returnPrice * 100) / 100
              }
            }
          }
        }
        responseModel.Body = userMap
      }
      res.json(responseModel.toJSON())
    } catch (e) {
      responseModel.setErrCode(ERRCODE.serverError)
      responseModel.Header.ErrMsg += e
      res.json(responseModel.toJSON())
      console.error('[err] >>> 获取收入信息列表: ', e)
    }
  })

  // app服务
  const APPExpress = require('../app')
  APPExpress(app)
}

module.exports = expressFunction
