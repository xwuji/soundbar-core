// node cwg-json-query-test>cwg-json-query-test-result.json
const libsL=require('cwg-json-query/libs')
const cdata=require(__dirname+'/src/mock/source')

// console.log(cdata)
// 说明
// group：提取分组，从原始数据中的result.list.description中，取出type是3或者2的放到skusOrImgs数组中，下同
// filter：过滤，字段后面带,1表示符合条件保留，不带,1表示符合条件删掉
// remove：删除指定键
const fdata=libsL(cdata).group({
  skusOrImgs: `$.result.list.description: type $= 3 || type $= 2`,
  authorDetailFloors: `$.result.list: floorAppearance $$ /authorDetailFloor/g`,
}).filter([
 '$.result.list,1: floorAppearance $$ /articleDetailFloor_1|similarArticleFloor_2/',
]).remove([
  `$.result.config.head`,
  `$.result.pageView`,
  `$.result.pageViewStr`,
])

console.log(JSON.stringify(fdata, 0, 2))
