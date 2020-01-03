const ERRCODE = {
  serverError: 90000009,
  loseParameter: 10001,
  loginError: 10002,
  registerUserHasExist: 10003,
  userNotExist: 10004,
  cardHasExist: 10005,
  shopHasExist: 10006
}
Object.freeze(ERRCODE)

let ErrMsgDic = {
  10001: '缺少参数',
  10002: '用户不存在或者密码错误',
  10003: '该手机已经注册',
  10004: '用户不存在',
  10005: '信用卡已经存在',
  10006: '门店已经存在',
  90000009: '服务端错误: '
}

module.exports = {
  ErrMsgDic: ErrMsgDic,
  ERRCODE: ERRCODE
}
