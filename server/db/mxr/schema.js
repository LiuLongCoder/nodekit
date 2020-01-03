const { Mongoose, mongooseConnection } = require('../mongoose_util')
const ObjectId = Mongoose.Types.ObjectId
const Mixed = Mongoose.Mixed

const mxr_user_schema = new Mongoose.Schema({
  // 用户唯一标识
  userId: { type: ObjectId, index: true, unique: true, trim: true },
  // 账号名， 后期可以用于登录
  account: { type: String, index: true, unique: true },
  /// 手机号
  mobile: { type: String },
  /// 密码， 后期可用于登录
  password: { type: String },
  /// 微信中的openId
  openId: { type: String },
  /// 微信昵称
  nickName: { type: String },
  /// 姓名
  name: { type: String, unique: true },
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
  /// 是否是VIP
  vip: { type: Boolean },
  /// 权限
  rule: { type: Number },
  /// 状态， 备用
  state: { type: Number },
  /// 虚拟币
  yuBi: { type: Number },
  /// 部门
  department: { type: ObjectId, ref: 'mxr_department_t' },
  /// 爱好
  hobby: { type: Array },
  /// 老家
  home: { type: String },
  /// 生日 yyyy-MM-dd
  birthday: { type: String },
  /// 生日日期
  birthdayDate: { type: Date },
  /// 星座
  constellation: { type: String },
  /// 已婚
  married: { type: Boolean },
  /// 是否已经在苏州买房
  hasHouse: { type: Boolean }
}, {
  strict: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  minimize: false,
  collection: 'mxr_user_t'
})

mxr_user_schema.pre('save', function (next) {
  if (this.userId === null || this.userId === undefined) {
    this.userId = new Mongoose.Types.ObjectId()
  }
  if (this.account === null || this.account === undefined) {
    this.account = this.userId + ''
  }
  next()
})

const mxr_department_schema = new Mongoose.Schema({
  name: { type: String, index: true, unique: true, require: true }
}, {
  strict: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  minimize: false,
  collection: 'mxr_department_t'
})

const mxr_bug_schema = new Mongoose.Schema({
  /// bug索引 例如：201909
  bugIndex: { type: String, require: true },
  /// 用户
  user: { type: ObjectId, ref: 'mxr_user_t' },
  /// 用户名字
  // userName: { type: String },
  /// 一级bug数量
  level1: { type: Number, default: 0 },
  /// 二级bug数量
  level2: { type: Number, default: 0 },
  /// 三级bug数量
  level3: { type: Number, default: 0 },
  /// 四级bug数量
  level4: { type: Number, default: 0 },
  /// 五级bug数量
  level5: { type: Number, default: 0 },
  /// 代码行数
  codeLine: { type: Number, default: 0 },
  /// bug总数
  totalBugNum: { type: Number, default: 0 },
  /// bug权重
  totalBugValue: { type: Number, default: 0 },
  /// 代码质量
  codeQuality: { type: Number, default: 0 }
}, {
  strict: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  minimize: false,
  collection: 'mxr_bug_t'
})

mxr_bug_schema.pre('save', function (next) {
  this.totalBugNum = this.level1 + this.level2 + this.level3 + this.level4 + this.level5
  this.totalBugValue = this.level1 * 50 + this.level2 * 20 + this.level3 * 10 + this.level4 * 5 + this.level5 * 2
  if (this.codeLine && this.codeLine > 0) {
    this.codeQuality = this.totalBugNum / 5 / (this.codeLine / 10000)
  }
  console.log('codeQuality ', this.codeQuality, ' total bug :', this.totalBugNum)
  next()
})

mxr_bug_schema.virtual('userName').get(function () {
  return this.user.name
})

module.exports = {
  mxr_user_schema,
  mxr_bug_schema,
  mxr_department_schema
}
