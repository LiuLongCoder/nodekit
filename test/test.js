const Moment = require('moment')

let m = Moment()
console.log('hahaha: ', m.get('second'))

let nowD = new Date(m.get('year'), m.get('month'), m.get('date'), m.get('hour'), m.get('minute'), m.get('second'))
console.log('>>>>> nowD:', nowD)

let timezone = 8; //目标时区时间，东八区
var offset_GMT = new Date().getTimezoneOffset(); // 本地时间和格林威治的时间差，单位为分钟
var nowDate = new Date().getTime(); // 本地时间距 1970 年 1 月 1 日午夜（GMT 时间）之间的毫秒数
var targetDate = new Date(nowDate + offset_GMT * 60 * 1000 + timezone * 60 * 60 * 1000);
console.log("东8区现在是：" + targetDate)
console.log('now is : ', new Date())

let nowMoment = Moment(new Date())
console.log('nowMoment: ', nowMoment.format('YYYY-MM-DD HH:mm:ss'))
let m1 = Moment('2019-01-03 15:57:30')


let m2 = Moment.utc('2019-01-03 15:57:30')
console.log('11>>>> ', m1.format('YYYY-MM-DD HH:mm:ss'))
console.log('22>>>>', m2.format('YYYY-MM-DD HH:mm:ss'))

return
let urls = 'http://focusmedica.net/fmiapps@33/aa/AA_BPH_OAB/3/1_The%20urinary%20tract/video.mp4\n' +
  'http://focusmedica.net/fmiapps@33/aa/AA_BPH_OAB/3/2_Anatomy%20and%20functions%20of%20the%20prostate%20gland/video.mp4\n' +
  'http://focusmedica.net/fmiapps@33/aa/AA_BPH_OAB/3/3_BPH%20and%20its%20symptoms/video.mp4\n' +
  'http://focusmedica.net/fmiapps@33/aa/AA_BPH_OAB/3/4_Causes%20of%20BPH/video.mp4\n' +
  'http://focusmedica.net/fmiapps@33/aa/AA_BPH_OAB/3/5_Risk%20factors%20for%20BPH/video.mp4\n' +
  'http://focusmedica.net/fmiapps@33/aa/AA_BPH_OAB/3/6_BPH%20-%20Diagnosis/video.mp4\n' +
  'http://focusmedica.net/fmiapps@33/aa/AA_BPH_OAB/3/7_Medications%20to%20treat%20BPH%20(including%20IPSS-QoL%20for%20Silodosin)/video.mp4\n' +
  'http://focusmedica.net/fmiapps@33/aa/AA_BPH_OAB/3/8_Surgical%20treatments%20for%20BPH/video.mp4\n' +
  'http://focusmedica.net/fmiapps@33/aa/AA_BPH_OAB/3/9_Complications%20of%20BPH/video.mp4\n' +
  'http://focusmedica.net/fmiapps@33/aa/AA_BPH_OAB/3/10_Urine%20formation/video.mp4\n' +
  'http://focusmedica.net/fmiapps@33/aa/AA_BPH_OAB/3/11_Urinary%20bladder%20and%20its%20functions/video.mp4\n' +
  'http://focusmedica.net/fmiapps@33/aa/AA_BPH_OAB/3/12_Urinary%20incontinence%20and%20its%20types/video.mp4\n' +
  'http://focusmedica.net/fmiapps@33/aa/AA_BPH_OAB/3/13_Overactive%20bladder%20and%20its%20symptoms/video.mp4\n' +
  'http://focusmedica.net/fmiapps@33/aa/AA_BPH_OAB/3/14_Causes%20of%20overactive%20bladder/video.mp4\n' +
  'http://focusmedica.net/fmiapps@33/aa/AA_BPH_OAB/3/15_Diagnosing%20OAB/video.mp4\n' +
  'http://focusmedica.net/fmiapps@33/aa/AA_BPH_OAB/3/16_Risk%20factors%20for%20OAB/video.mp4\n' +
  'http://focusmedica.net/fmiapps@33/aa/AA_BPH_OAB/3/17_Treating%20OAB%20-%20medications/video.mp4\n' +
  'http://focusmedica.net/fmiapps@33/aa/AA_BPH_OAB/3/18_Surgeries%20to%20treat%20OAB/video.mp4\n' +
  'http://focusmedica.net/fmiapps@33/aa/AA_BPH_OAB/3/19_Complications%20of%20overactive%20bladder/video.mp4'

let urlArray = urls.split('\n')
console.log(urlArray)
let nameArray = []
for (let idx in urlArray) {
  let urlStr = decodeURIComponent(urlArray[idx])
  // console.log(urlStr)
  let urlComponents = urlStr.split('/')
  console.log(urlComponents[urlComponents.length - 2])
  nameArray.push(urlComponents[urlComponents.length - 2])
}
const FS = require('fs')
const Path = require('path')
let dirPath = 'D:/人体视频2/Animated Atlas of BPH and OAB'
for (let idx = 0; idx < urlArray.length; idx++) {
  let fileName = 'video(' + idx + ').mp4'
  let filePath = Path.join(dirPath, fileName)
  let newFilePath = Path.join(dirPath, nameArray[idx] + '.mp4')
  FS.renameSync(filePath, newFilePath)
}
