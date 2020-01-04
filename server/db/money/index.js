const moneySchemaTables = require('./schema')
const { mongooseConnection } = require('../mongoose_util')

module.exports = {
  /// 撸卡相关
  MoneyUser: mongooseConnection.model('money_user_t', moneySchemaTables.money_user_schema),
  MoneyCard: mongooseConnection.model('money_card_t', moneySchemaTables.money_card_schema),
  MoneyShop: mongooseConnection.model('money_shop_t', moneySchemaTables.money_shop_schema),
  MoneyRecord: mongooseConnection.model('money_record_t', moneySchemaTables.money_record_schema),
  MoneyPayWay: mongooseConnection.model('money_payWay_t', moneySchemaTables.money_payWay_schema)
}
