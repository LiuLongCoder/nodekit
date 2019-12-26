const Model = require('./model')

Model.MXRTDebug.find({}, 'bugIndex user', function (err, docs) {
  if (err)
    console.log('err > ', err)
  else
    console.log('docs > ', docs)
})

return

Model.MXRTDebug.estimatedDocumentCount().exec(function (err, count) {
  if (err)
    console.log('err > ', err)
  else
    console.log('count > ', count)
})
return

Model.MXRTDebug.distinct('bugIndex', function (err, docs) {
  if (err)
    console.log('err > ', err)
  else
    console.log('docs > ', docs)
})

return

let personJson = {'iOS': [ '项大山', '孔峰', '高伟龙', '刘龙'],
  'Android': [
    '王峥',
    '宋晓勇',
    '杨泽龙',
    '曹广东',
    '曹言桩'
  ],
  '前端': [
    '孙凯',
    '王东升',
    '王纪凯'
  ],
  '接口后台': [
    '武元元',
    '宋维超',
    '倪泽民',
    '陈冬'
  ],
  'Unity': [
    '郑宗恒',
    '宋雨',
    '戢灿',
    '朱亮宇'
  ],
  '编辑器': [
    '刘元龙',
    '何晓辉'
  ]
}

async function test (){
  try {
    for (let key in personJson) {
      let doc = await Model.MXRTDepartment.findOne({ 'name': key})
      if (doc === undefined || doc === null) {
        let department = new Model.MXRTDepartment()
        department.name = key
        doc = await department.save()
      }
      if (doc === undefined || doc === null) {
        console.log('err >>> ', key)
      }
      let personArray = personJson[key]
      for (let idx in personArray) {
        let user = await Model.MXRTUser.findOne({ 'name': personArray[idx] })
        if (user === undefined || user == null) {
          user = Model.MXRTUser()
          user.name = personArray[idx]
          user.department = doc._id
          let userDoc = await user.save();
          console.log('userDoc>>> ', userDoc)
        }
      }
    }
  } catch (e) {
    console.log('err>>> ', e)
  }
}
test()
return
Model.MXRTDepartment.findOne({ 'name': 'iOS' }, function (err, docs) {
  if (err) {
    console.log('err >>> ', err)
  } else {
    console.log('doc >>> ', docs)
  }
})
return
let department = new Model.MXRTDepartment()
department.name = '前端'
department.save(function (err, doc) {
  if (err) {
    console.log('err >>> ', err)
  } else {
    console.log('doc >>> ', doc)
  }
})
