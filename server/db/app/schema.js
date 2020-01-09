const Moment = require('moment')
const { Mongoose, mongooseConnection } = require('../mongoose_util')
const ObjectId = Mongoose.Types.ObjectId
const Mixed = Mongoose.Mixed

/// app管理表
const common_app_schema = new Mongoose.Schema({
  /// app bundleId
  bundleId: { type: String, require: true, trim: true },
  /// app version
  version: { type: String, require: true },
  /// 蒲公英下载地址
  dandelion: { type: String },
  /// 操作系统类型 android， ios 比如 统一小写
  osType: { type: String },
  /// fir下载地址
  fir: { type: String },
  /// 升级必要
  forceUpgrade: { type: Number, default: 0 },
  /// 升级内容
  upgradeDescription: { type: String }
}, {
  strict: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  minimize: false,
  collection: 'common_app_t'
})

module.exports = {
  common_app_schema
}
