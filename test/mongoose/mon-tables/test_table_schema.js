const Mongoose = require('mongoose')
const Schema = Mongoose.Schema
const ObjectId = Mongoose.SchemaTypes.ObjectId
const Mixed = Mongoose.Mixed

const testTableSchema = new Schema({
  column: String,
  column2: String,
  name: { type: String, default: 'Martin' },
  height: { type: Number, default: '183' },
  age: { type: Number }
}, {
  strict: false
})

module.exports = testTableSchema
