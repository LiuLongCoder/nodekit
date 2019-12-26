const schemaTables = require('./schema')
const { mongooseConnection } = require('../mongoose_util')

module.exports = {
  /// 统计bug龙虎榜相关
  MXRTUser: mongooseConnection.model('mxr_user_t', schemaTables.mxr_user_schema),
  MXRTDebug: mongooseConnection.model('mxr_debug_t', schemaTables.mxr_bug_schema),
  MXRTDepartment: mongooseConnection.model('mxr_department_t', schemaTables.mxr_department_schema),
}
