// see https://mongoosejs.com/docs
const Mongoose = require('mongoose')
const opts = { user: 'loguser', pass: 'mxr123', useNewUrlParser: true }
// mongodb://loguser:mxr123@47.104.25.112/mxrdatabase
const conn = Mongoose.createConnection('mongodb://47.104.25.112/mxrdatabase', opts)

exports.conn = conn
