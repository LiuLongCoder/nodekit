let regex = new RegExp('xyz')

const regexp = /^\/book\/detail\//
console.log(regexp.test('/book/detail/helloasd'))

var str = 'sdfssdf234dfsdfsd23424sdf32423'

var reg = /\d+/g

console.log(str.match(reg))

let url = 'http://www.baidu.com/a/b/c/d/e/f/sdf?a=1&b=2&c=3'
console.log(/b\/c\/ds/.test(url))
//
// function _getDictionaryFromUrl(path) {
//   let dic = {}
//   const pathArray = path.split('?')
//   if (pathArray.length > 0) {
//     const queryString = pathArray[1]
//     const queryArray = queryString.split('&')
//     for (let key in queryArray) {
//       let queryOneItem = queryArray[key]
//       let queryKeyAndValue = queryOneItem.split('=')
//       if (queryKeyAndValue.length === 2) {
//         dic[queryKeyAndValue[0]] = queryKeyAndValue[1]
//       }
//     }
//   }
//   return dic
// }
//
// console.log(_getDictionaryFromUrl(url))


/*
* 1. 概念正则表达式描述了一种字符串匹配的模式，可以用来检查一个字符串是否含有某种子串、
* 将匹配的子串做替换或者从某个字符串中取出符合某个条件的子串的等。
* 2.创建正则表达式方式一：字面量创建方式             
* var reg = /pattern/flags
* 方式二：构造函数实例创建方式             
* var reg = new RegExp(pattern, flags)        
* 说明：            
* pattern			正则表达式            
* flags			标识（修饰符）            
* 修饰符主要有：                   
* i	忽略大小写匹配                   
* m	多行匹配（即在到达一行文本末尾时还会继续寻找下一行中是否与正则匹配的项）                   
* g	全局匹配（模式应用于所有的字符串），而非在找到第一个匹配项时停止            
* 注意：            字面量创建方式特殊含义的字符不需要转义，实例创建方式需要转义            
* 示例：            var reg1 = new RegExp('\d');	// 表示的 d (如果需要\,必须转义\\)            
* var reg2 = new RegExp('\\d');	// 表示的 \d            
* var reg3 = /\d/;				// 表示的 \d3. 元字符元字符主要分为代表特殊含义的字符与代表次数的量词元字符特殊含义的元字符            
* \d : 0-9之间的任意一个数字  \d只占一个位置            
* \w : 数字，字母 ，下划线 0-9 a-z A-Z _            
* \s : 空格或者空白等            
* \D : 除了\d            
* \W : 除了\w            
* \S : 除了\s            
* . : 除了\n之外的任意一个字符            
* \ : 转义字符            
* | : 或者            
* () : 分组            
* \n : 匹配换行符            
* \b : 匹配边界 字符串的开头和结尾 空格的两边都是边界 => 不占用字符串位数            
* ^ : 限定开始位置 => 本身不占位置            
* $ : 限定结束位置 => 本身不占位置            
* [a-z] : 任意字母 []中的表示任意一个都可以            
* [^a-z] : 非字母 []中^代表除了            
* [abc] : abc三个字母中的任何一个 [^abc]除了这三个字母中的任何一个字符次数的量词元字符            
* * : 0到多个            
* + : 1到多个            
* ? : 0次或1次 可有可无            
* {n} : 正好n次；            
* {n,} : n到多次            
* {n,m} : n次到m次4. Nodejs中和正则相关的一些方法- reg.test(str)  //用来验证字符串是否符合正则 符合返回true 否则返回false示例：    
* var str = 'hello';    
* var reg = /\w+/; 			// 模式：匹配1到多个的数字、字母、下划线    
* console.log(reg.test(str));	// true- reg.exec() //用来捕获符合规则的字符串示例：    
* var str = 'tom287aaa879bbb666';    var reg = /\d+/;    
* console.log(reg.exec(str));    // 返回数组中 [0:"287", index:3, input:"tom287aaa879bbb666"]    
* // 0 : "123" 	表示我们捕获到的字符串    // index: 3		表示捕获开始位置的索引    
* // input: tom287aaa879bbb666	表示原有的字符串标识符 g 作用    
* var str = 'abc123cba456aaa789';    
* var reg = /\d+/g;  //此时加了标识符g    
* console.log(reg.lastIndex)			// lastIndex : 0    
* console.log(reg.exec(str))			//  ["123", index: 3, input: "abc123cba456aaa789"]    
* console.log(reg.lastIndex)			// lastIndex : 6    console.log(reg.exec(str))
* // ["456", index: 9, input: "abc123cba456aaa789"]    
* console.log(reg.lastIndex)			// lastIndex : 12    
* console.log(reg.exec(str))			// ["789", index: 15, input: "abc123cba456aaa789"]    
* console.log(reg.lastIndex)			// lastIndex : 18    console.log(reg.exec(str))			// null    
* console.log(reg.lastIndex)			// lastIndex : 0注意：    每次调用exec方法时,捕获到的字符串都不相同    
* lastIndex ：这个属性记录的就是下一次捕获从哪个索引开始。    当未开始捕获时，这个值为0。    
* 如果当前次捕获结果为null。那么lastIndex的值会被修改为0.下次从头开始捕获。    
* 而且这个lastIndex属性还支持人为赋值。- str.match(reg) 如果匹配成功，就返回匹配成功的数组，如果匹配不成功，就返回null    
* 如果正则表达式没有标识符 g 则exec与match功能一样的    
* 如果正则表达式有标识符 g 则exec与match有明显区别    
* 当全局匹配时，match方法会一次性把符合匹配条件的字符串全部捕获到数组中,    
* 如果想用exec来达到同样的效果需要执行多次exec方法。示例：    
* var str = 'abc123cba456aaa789';    var reg = /\d+/g;    
* console.log(reg.exec(str));		// ["123", index: 3, input: "abc123cba456aaa789"]    
* console.log(str.match(reg));	// ["123", "456", "789"]- str.replace()
* 正则去匹配字符串，匹配成功的字符去替换成新的字符串语法：str.replace(reg,newStr);示例：    
* var str = 'b123bc456d';    
* var res = str.replace(/\d/g,'Q')    
* console.log(res) 	// "bQQQbcQQQd" 将所有的数字替换字符Q5.
* 正则的特性 - 贪婪性 与 懒惰性贪婪性所谓的贪婪性就是正则在捕获时，每一次会尽可能多的去捕获符合条件的内容。
* 如果我们想尽可能的少的去捕获符合条件的字符串的话，可以在量词元字符后加?懒惰性懒惰性则是正则在成功捕获一次
* 后不管后边的字符串有没有符合条件的都不再捕获。如果想捕获目标中所有符合条件的字符串的话，我们可以用标识符g
* 来标明是全局捕获示例：    var str = '123aaa456';    var reg = /\d+/;  //只捕获一次,一次尽可能多的捕获    
* var res = str.match(reg)    
* console.log(res)  // ["123", index: 0, input: "123aaa456"]    
* reg = /\d+?/g; //解决贪婪性、懒惰性    res = str.match(reg)    
* console.log(res)  // ["1", "2", "3", "4", "5", "6"]6.
* 正则运算符的优先级正则表达式从左到右进行计算，并遵循优先级顺序，这与算术表达式非常类似。相同优先级的会从左到右进
* 行运算，不同优先级的运算先高后低。下面是常见的运算符的优先级排列依次从最高到最低说明各种正则表达式运算符的优先级顺序：
* \ : 转义符
* (), (?:), (?=), []  => 圆括号和方括号
* *, +, ?, {n}, {n,}, {n,m}   => 量词限定符
* ^, $, \任何元字符、任何字符
* |       => 替换，"或"操作
* 字符具有高于替换运算符的优先级，一般用 | 的时候，为了提高 | 的优先级，我们常用
* ()来提高优先级

作者：沈林生
链接：https://www.jianshu.com/p/10232b4afedc
來源：简书
简书著作权归作者所有，任何形式的转载都请联系作者获得授权并注明出处。
*
* */
