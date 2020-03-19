const Mongoose = require('mongoose')
const Model = require('../../db/loginfo')
const MyURL = require('./url')
const ResponseModel = require('../responseModel')
const ERRCODE = require('../errCode')

function _ExpressParams (req) {
  if (req.method === 'POST') {
    return req.body
  }
  return req.query
}

function expressFunction (app) {
  /* 获取对应的app版本信息
  * header: { bundleId:[string], osType: [string] }
  * */
  app.post(MyURL.URL_LOG_AddCrashLog, async (req, res, next) => {
    console.log('>>>>>> add crash log')
    let responseModel = new ResponseModel()
    try {
      let param = _ExpressParams(req)
      console.log('param : ', param)
      let logCrashM = new Model.LogCrash(param)
      logCrashM = await logCrashM.save()
      console.log('save result: ', logCrashM)
      if (logCrashM) {
        responseModel.Body = logCrashM
      } else {
        responseModel.setErrCode(ERRCODE.serverError)
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
