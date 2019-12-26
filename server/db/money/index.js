const moneySchemaTables = require('./schema')
const { mongooseConnection } = require('../mongoose_util')

module.exports = {
  /// 撸卡相关
  MoneyCard: mongooseConnection.model('money_card_t', moneySchemaTables.money_card_schema),
  MoneyShop: mongooseConnection.model('money_shop_t', moneySchemaTables.money_shop_schema),
  MoneyRecord: mongooseConnection.model('mxr_record_t', moneySchemaTables.money_record_schema)
}
