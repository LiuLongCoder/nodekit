const ERRCODE = {
  serverForbidden: 90000000,
  serverError: 90000009,
  loseParameter: 10001,
  loginError: 10002,
  registerUserHasExist: 10003,
  userNotExist: 10004,
  cardHasExist: 10005,
  shopHasExist: 10006,
  loginPasswordError: 10007,
  uploadFileError: 10008,
  shopNotExist: 10009,
  cardNotExist: 10010,
  recordNotExist: 10011,
  deleteRecordDateErr: 10012,
  //   //
  // app相关
  headerNotValid: 20011,
  appNotExist: 20012
}
Object.freeze(ERRCODE)

let ErrMsgDic = {
  90000000: '禁止访问',
  90000009: '服务端错误: ',
  10001: '缺少参数',
  10002: '用户不存在或者密码错误',
  10003: '该手机已经注册',
  10004: '用户不存在',
  10005: '信用卡已经存在',
  10006: '门店已经存在',
  10007: '密码错误',
  10008: '上传文件失败',
  10009: '门店不存在',
  10010: '信用卡不存在',
  10011: '该消费记录不存在',
  10012: '删除记录的日期不合法',
  //
  //
  20011: '头部信息有误',
  20012: '该app不存在或已下架'
}

module.exports = {
  ErrMsgDic: ErrMsgDic,
  ERRCODE: ERRCODE
}
