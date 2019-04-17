const types = require('./types.js')
const sourceData = require('./mock/source.js/index.js')
const queryData = require('./mock/query.js/index.js.js')
const { isArray, isObject } = types
if (isArray(queryData)) {
  // 多接口处理拼接

} else {
  const { url, params = {}, mergeRule, filterRule } = queryData
  if (!url) throw Error('url is empty')
  // 请求服务端数据 url + params
  // ...
  if (mergeRule) {
    // 如果没有mergeRule 不返回相关数据
    if (!isObject(mergeRule)) throw Error('MergeRule goes wrong data-type')
    const mergeKeys = Object.keys(mergeRule)
  }
  if (filterRule) {
    // 如果没有filterRule 返回所有原数据
  }
}
