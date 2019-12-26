const conn = require('./conn').conn
const testTableSchema = require('./mon-tables/test_table_schema')
const monTables = {
  testTable: conn.model('testTable', testTableSchema)
}

module.exports = monTables
