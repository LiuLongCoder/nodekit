let JieBa = require('nodejieba')
let result = JieBa.cut("我想你")
console.log(result)

console.log(JieBa.extract("姥姥给我讲猫和老鼠的故事", 10))
