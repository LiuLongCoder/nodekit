const { Mongoose, mongooseConnection } = require('../mongoose_util')
const ObjectId = Mongoose.Types.ObjectId
const Mixed = Mongoose.Mixed

/// 用户
const money_user_schema = new Mongoose.Schema({
  /// 手机号, 用于登录
  mobile: { type: String, unique: true, trim: true },
  /// 姓名
  name: { type: String, unique: true },
  /// IDCard
  IDCard: { type: String, unique: true },
  /// 密码， 后期可用于登录 ，md5加密
  password: { type: String },
  /// 微信中的openId
  openId: { type: String },
  /// 微信昵称
  nickName: { type: String },
  /// 微信性别 ， 0: 男， 1：女
  gender: { type: Number },
  /// 微信头像地址
  avatarUrl: { type: String },
  /// 微信城市
  city: String,
  /// 微信省会
  province: String,
  /// 微信国家
  country: String,
  /// 微信语言
  language: String,
  /// 权限
  rule: { type: Number },
  /// 状态， 备用
  state: { type: Number },
  /// 生日 yyyy-MM-dd
  birthday: { type: String },
  /// 生日日期
  birthdayDate: { type: Date }
}, {
  strict: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  minimize: false,
  collection: 'money_user_t'
})

/// 信用卡
const money_card_schema = new Mongoose.Schema({
  /// 卡号
  cardNumber: { type: String, required: true, unique: true },
  // 银行名称
  bank: { type: String, index: true, unique: true },
  /// 预留手机号
  mobile: { type: String },
  /// 限额
  limit: { type: Number },
  /// 出账日
  billDayStr: { type: String },
  /// 还款日
  repaymentDayStr: { type: String },
  /// 过期时间
  expireDayStr: { type: String },
  /// 状态， 备用
  state: { type: Number, default: 0 },
  /// 所属人
  user: { type: ObjectId, ref: 'money_user_t' }
}, {
  strict: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  minimize: false,
  collection: 'money_card_t'
})

/// 门店
const money_shop_schema = new Mongoose.Schema({
  /// 门店名称
  name: { type: String, index: true, require: true, unique: true },
  /// 门店短称
  shortName: { type: String, index: true, require: true },
  /// 所属人
  owner: { type: String, require: true },
  /// 联系电话
  mobile: { type: String, require: true },
  /// 费率
  rate: { type: Number, default: 0.03 },
  /// 门店类型，备用，0默认拉卡拉
  type: { type: Number, default: 0 },
  /// 状态， 备用
  state: { type: Number, default: 0 },
  /// 所属人
  user: { type: ObjectId, ref: 'money_user_t' }
}, {
  strict: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  minimize: false,
  collection: 'money_shop_t'
})

money_shop_schema.pre('save', function (next) {
  if (this.shortName === null || this.shortName === undefined) {
    this.shortName = this.name
  }
  if (this.owner === null || this.owner === undefined) {
    this.owner = this.mobile
  }
  next()
})

const money_record_schema = new Mongoose.Schema({
  /// 信用卡
  card: { type: ObjectId, ref: 'money_card_t' },
  /// 门店
  shop: { type: ObjectId, ref: 'money_shop_t' },
  /// 刷卡日期
  dateStr: { type: String },
  /// 刷卡日期
  date: { type: Date },
  /// 刷卡金额
  price: { type: Number },
  /// 刷卡状态，0表示该笔信用卡刷卡待还， 1表示该笔金额已还
  repaymentState: { type: Number, default: 0 },
  /// 状态， 备用  1表示以到自己账上
  state: { type: Number, default: 0 }
}, {
  strict: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  minimize: false,
  collection: 'money_record_t'
})

money_record_schema.pre('save', function (next) {
  if (this.dateStr) {
    try {
      // need to do 时间不对
      this.date = new Date(this.dateStr)
    } catch (e) {
      console.error('money_record_schema pre save error: ', e)
    }
  }
  next()
})

module.exports = {
  money_user_schema,
  money_card_schema,
  money_shop_schema,
  money_record_schema
}
