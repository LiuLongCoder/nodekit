const moneySchemaTables = require('./schema')
const { mongooseConnection } = require('../mongoose_util')

module.exports = {
  /// 撸卡相关
  LogCrash: mongooseConnection.model('log_crash_t', moneySchemaTables.log_crash_schema)
}
