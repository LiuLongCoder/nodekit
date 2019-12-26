const Mongoose = require('mongoose')
const MongooseUrlFormat = require('mongodb-uri')

function encodeMongoURI (urlString) {
  if (urlString) {
    let parsed = MongooseUrlFormat.parse(urlString)
    urlString = MongooseUrlFormat.format(parsed)
  }
  return urlString
}
const mongodbConnectString = 'mongodb://localhost/mxrdatabase' // 'mongodb://martin:martin2015@39.106.7.121/mardatabase'; // "mongodb://localhost/mxrdatabase";
const mongooseConnection = Mongoose.createConnection(encodeMongoURI(mongodbConnectString), { promiseLibrary: require('bluebird'), useNewUrlParser: true })

module.exports = {
  Mongoose: Mongoose,
  mongooseConnection: mongooseConnection
}
