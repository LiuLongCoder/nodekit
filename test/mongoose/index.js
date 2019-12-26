
const MonTables = require('./mon_tables')
const TableModel = MonTables.testTable

TableModel.find().update({ $inc: {age: -1}}).exec((err, docs) => {
    if (err)
      console.log('err >>', err)
    else
      console.log('docs >>', docs)
})
return
// TableModel.estimatedDocumentCount((err, count) => {
//   if (err)
//     console.log('err >>', err)
//   else
//     console.log('doc >>', count)
// })
// return

let query = TableModel.find().exists('age').exec((err, doc) => {
  if (err)
    console.log('err >>', err)
  else
    console.log('doc >>', doc)
})
// console.log(query.getQuery())

return

let model = new TableModel()
model.column = 'my first column111'
model.column2 = 'my second column'
model.name = 'Martin'
model.age = 30
model.save(function (err, doc) {
  if (err) {
    console.log('err :', err)
  } else {
    console.log('doc :', doc)
  }
})
