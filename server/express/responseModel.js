const ERRCODEM = require('./errCode')

class ResponseModel {
  constructor () {
    this.Header = new ResponseHeaderModel()
    this.Body = ''
  }

  setErrCode (errCode) {
    this.Header.ErrCode = errCode
    let errMsg = ERRCODEM.ErrMsgDic[errCode]
    if (errMsg) {
      this.Header.ErrMsg = errMsg
    }
  }

  toJSON () {
    return { Header: this.Header.toJSON(), Body: this.Body }
  }

  toString () {
    return JSON.stringify(this.toJSON())
  }
}

class ResponseHeaderModel {
  constructor () {
    this.ErrCode = 0
    this.ErrMsg = ''
  }

  toJSON () {
    return { ErrCode: this.ErrCode, ErrMsg: this.ErrMsg }
  }

  toString () {
    return JSON.stringify(this.toJSON())
  }
}

module.exports = ResponseModel
