const Moment = require('moment')
const { Mongoose, mongooseConnection } = require('../mongoose_util')
const ObjectId = Mongoose.Types.ObjectId
const Mixed = Mongoose.Mixed

/// 用户
const log_crash_schema = new Mongoose.Schema({
  /// 设备型号 iPhone6,1
  machineModel: { type: String },
  /// 手机型号名称 “iPhone 8“
  machineModelName: { type: String },
  /// 系统版本
  osVersion: { type: String },
  /// APP名称
  appDisplayName: { type: String },
  /// APP包名
  appBundleId: { type: String },
  /// APP版本
  appVersion: { type: String },
  /// APPBuild版本
  appBuildVersion: { type: String },
  /// 是否越狱
  isJailBroken: { type: Boolean },
  /// 发生时间
  logTime: { type: Date },
  /// 发生时间 YYYY-MM-DD HH:mm:ss
  logTimeStr: { type: String },
  /// 崩溃原因
  exReason: { type: String },
  /// 崩溃名称
  exName: { type: String },
  /// 崩溃堆栈
  exCallStackSymbols: { type: String },
  /// 崩溃堆栈地址?
  exCallStackReturnAddresses: { type: String },
  /// 崩溃堆栈数组
  exCallStackSymbolsArray: { type: Array },
  /// 崩溃堆栈地址?数组
  exCallStackReturnAddressesArray: { type: Array }
}, {
  strict: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  minimize: false,
  collection: 'log_crash_t'
})

log_crash_schema.pre('save', function (next) {
  if (this.logTimeStr) {
    try {
      let m = Moment(this.logTimeStr, 'YYYY-MM-DD HH:mm:ss')
      this.logTime = new Date(m.get('year'), m.get('month'), m.get('date'), m.get('hour'), m.get('minute'), m.get('second'))
    } catch (e) {
      console.error('log_crash_schema pre save error: ', e)
    }
  }
  next()
})

module.exports = {
  log_crash_schema
}
