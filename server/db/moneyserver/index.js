const moneySchemaTables = require('./schema')
const Mongoose = require('mongoose')
const MongooseUrlFormat = require('mongodb-uri')

function encodeMongoURI (urlString) {
  if (urlString) {
    let parsed = MongooseUrlFormat.parse(urlString)
    urlString = MongooseUrlFormat.format(parsed)
  }
  return urlString
}
const mongodbConnectString = 'mongodb://martin:martin2015@39.106.7.121/mardatabase'
// const mongodbConnectString = 'mongodb://localhost/mxrdatabase' // 'mongodb://martin:martin2015@39.106.7.121/mardatabase'; // "mongodb://localhost/mxrdatabase";
const mongooseConnection = Mongoose.createConnection(encodeMongoURI(mongodbConnectString), { promiseLibrary: require('bluebird'), useNewUrlParser: true })

module.exports = {
  /// 撸卡相关
  MoneyUser: mongooseConnection.model('money_user_t', moneySchemaTables.money_user_schema),
  MoneyCard: mongooseConnection.model('money_card_t', moneySchemaTables.money_card_schema),
  MoneyShop: mongooseConnection.model('money_shop_t', moneySchemaTables.money_shop_schema),
  MoneyRecord: mongooseConnection.model('money_record_t', moneySchemaTables.money_record_schema),
  MoneyPayWay: mongooseConnection.model('money_payWay_t', moneySchemaTables.money_payWay_schema)
}
