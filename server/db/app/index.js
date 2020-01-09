const schemaTables = require('./schema')
const { mongooseConnection } = require('../mongoose_util')

module.exports = {
  /// app相关信息表
  AppVersion: mongooseConnection.model('common_app_t', schemaTables.common_app_schema)
}
