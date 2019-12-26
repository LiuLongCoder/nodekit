const Model = require('../../db/mxr')

let userInfos = [
  { name: '刘龙', mobile: '13218189892' },
  { name: '项大山', mobile: '18550493606' },
  { name: '孔峰', mobile: '18317151779' },
  { name: '高伟龙', mobile: '15238345512' },
  { name: '王峥', mobile: '18662495121' },
  { name: '宋晓勇', mobile: '17315808090' },
  { name: '杨泽龙', mobile: '18352811084' },
  { name: '曹广东', mobile: '15986713656' },
  { name: '曹言桩', mobile: '15052506612' },
  { name: '张青林', mobile: '13402531936' },
  { name: '赵紫东', mobile: '18521086765' },
  { name: '刘元龙', mobile: '15370348006' },
  { name: '窦小龙', mobile: '13682198533' },
  { name: '何黎明', mobile: '18896550535' }
]

for (let key in userInfos) {
  let user = userInfos[key]
  Model.MXRTUser.findOne({ name : user['name'] }, (err, doc) => {
    if (err)
      console.log('err: ', user['name'], err)
    else {
      if (!doc) {
        console.log('>>>', doc)
        let usr = new Model.MXRTUser()
        usr.name = user['name']
        usr.mobile = user['mobile']
        usr.save()
      }
    }
  })
}
return

Model.MXRTUser.findOne({ name: '赵紫东' }, (err, doc) => {
  if (err) {
    console.log('err >>>', err)
  } else {
    console.log(doc)
    doc.save()
  }
})
