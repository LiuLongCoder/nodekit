const Mongoose = require('mongoose')
const Model = require('../../db/app')
const MyURL = require('./url')
const ResponseModel = require('../responseModel')
const ERRCODE = require('../errCode').ERRCODE

function _ExpressParams (req) {
  if (req.method === 'POST') {
    return req.body
  }
  return req.query
}

function _ExpressHeader (req) {
  try {
    let header = req.headers['app-header']
    if (!header) {
      /// 适配以前的版本
      header = req.headers['money-header']
    }
    if (header) {
      return JSON.parse(header)
    }
  } catch (e) {
    console.error('[error] parse header err: ', e)
  }
  return {}
}

function _MoneyExpressUserIdFromHeader (req) {
  let header = _ExpressHeader(req)
  return header['userId']
}

function _ExpressValidateKey (params, validateKeys) {
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
  /* 获取对应的app版本信息
  * header: { bundleId:[string], osType: [string] }
  * */
  app.get(MyURL.URL_APP_GetAppInfo, async (req, res, next) => {
    let responseModel = new ResponseModel()
    try {
      let header = _ExpressHeader(req)
      if (!header || !header['bundleId'] || !header['osType']) {
        responseModel.setErrCode(ERRCODE.loseParameter)
      } else {
        let appM = await Model.AppVersion.findOne({ bundleId: header['bundleId'], osType: header['osType'] })
        if (appM) {
          console.log('appM : ', appM)
          responseModel.Body = appM.toJSON()
        } else {
          responseModel.setErrCode(ERRCODE.appNotExist)
        }
      }
      res.json(responseModel.toJSON())
    } catch (e) {
      responseModel.setErrCode(ERRCODE.serverError)
      responseModel.Header.ErrMsg += e
      res.json(responseModel.toJSON())
      console.log('[error] 获取app信息失败： ', e)
    }
  })
}

module.exports = expressFunction
